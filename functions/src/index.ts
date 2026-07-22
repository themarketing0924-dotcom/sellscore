// ============================================================
// analyzeSite — 실제 URL을 크롤링해서 Claude로 12개 프레임워크를 채점하는
// Firebase Cloud Function (callable).
//
// 프론트엔드의 src/lib/scoreEngine.ts(목업 엔진)와 정확히 같은 모양의
// DiagnosisReport를 반환하도록 설계했다 — 그래서 이 함수가 실패하거나
// 아직 배포되지 않았을 때는 프론트엔드가 목업 엔진으로 그대로 폴백할 수 있다.
//
// 배포 전 필요한 것:
//   1) Firebase 프로젝트가 Blaze(종량제) 요금제여야 함 (외부 네트워크 호출 필요)
//   2) firebase functions:secrets:set ANTHROPIC_API_KEY
//   3) npm install (functions 폴더 안에서)
//   4) firebase deploy --only functions
// ============================================================

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import Anthropic from '@anthropic-ai/sdk';
import * as cheerio from 'cheerio';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createHash } from 'crypto';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

initializeApp();
const db = getFirestore();
// 리포트 캐시에 sourceUrl 같은 선택 필드가 undefined로 들어오면 Firestore가
// 쓰기 자체를 거부한다 — undefined 필드는 조용히 무시하도록 설정한다.
db.settings({ ignoreUndefinedProperties: true });

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');
const pagespeedApiKey = defineSecret('PAGESPEED_API_KEY');
const tossSecretKey = defineSecret('TOSS_SECRET_KEY');
const paypalClientId = defineSecret('PAYPAL_CLIENT_ID');
const paypalClientSecret = defineSecret('PAYPAL_CLIENT_SECRET');

// 테스트(샌드박스) 통과 후 실결제로 전환할 때 이 값만 'live'로 바꾸면 된다.
// PayPal은 샌드박스/라이브가 API 도메인 자체가 다르고, 자격증명도 완전히 별개 쌍이다.
const PAYPAL_ENV: 'sandbox' | 'live' = 'sandbox';
function paypalApiBase(): string {
  return PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

// 결제 승인 후 users/{uid}에 플랜을 기록해줄 상품 — 자동 정기결제가 아니라
// 결제 시점 기준 1개월짜리 이용권으로 취급한다 (정기 빌링 미연동 상태).
const PLAN_PRODUCT_IDS = new Set(['sellscore-subscription', 'sellscore-agency']);

// ── Google PageSpeed Insights 실측 ──
// 실패하면 null을 반환하고 리포트에서 해당 카드를 아예 숨긴다 —
// 추정치를 실측인 것처럼 보여주지 않는다.

export interface PerformanceSnapshot {
  score: number | null; // Lighthouse 성능 점수 0~100
  seoScore: number | null; // 구글 Lighthouse SEO 점수 0~100
  accessibilityScore: number | null; // 접근성 점수 0~100
  bestPracticesScore: number | null; // 권장사항(기술 위생) 점수 0~100
  lcpMs: number | null;
  cls: number | null;
  tbtMs: number | null;
  fcpMs: number | null;
}

async function fetchPageSpeed(url: string, apiKey: string): Promise<PerformanceSnapshot | null> {
  try {
    // 카테고리 4종을 같은 호출 한 번에 받는다 — 추가 요청·비용 없음
    const endpoint =
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed' +
      `?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=mobile` +
      '&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES';
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(50000) });
    if (!res.ok) {
      console.warn('[fetchPageSpeed] HTTP', res.status);
      return null;
    }
    const data = (await res.json()) as {
      lighthouseResult?: {
        categories?: Record<string, { score?: number }>;
        audits?: Record<string, { numericValue?: number }>;
      };
    };
    const lh = data.lighthouseResult;
    if (!lh) return null;
    const num = (id: string) => lh.audits?.[id]?.numericValue ?? null;
    const cat = (id: string) => {
      const s = lh.categories?.[id]?.score;
      return s != null ? Math.round(s * 100) : null;
    };
    return {
      score: cat('performance'),
      seoScore: cat('seo'),
      accessibilityScore: cat('accessibility'),
      bestPracticesScore: cat('best-practices'),
      lcpMs: num('largest-contentful-paint'),
      cls: num('cumulative-layout-shift'),
      tbtMs: num('total-blocking-time'),
      fcpMs: num('first-contentful-paint'),
    };
  } catch (err) {
    console.warn('[fetchPageSpeed] 실패:', (err as Error).message);
    return null;
  }
}

// ── 무료 사용량 제한 ──
// 비로그인 사용자는 같은 IP에서 3회까지만 무료 진단 가능. 초과하면 회원가입을
// 유도한다 (가입하면 계속 무료 — 고객 DB 수집이 목적). IP는 해시로만 저장한다.
const FREE_LIMIT_PER_IP = 3;

function hashIp(ip: string): string {
  return createHash('sha256').update(`sellscore:${ip}`).digest('hex').slice(0, 40);
}

// ── 리포트 캐싱 ──
// 같은 URL을 반복 진단하면 크롤링+PSI+Claude를 다시 돌리지 않고 캐시된 결과를
// 그대로 돌려준다 — 캐시 히트는 비용이 거의 0원이라 IP 무료 횟수도 차감하지 않는다.
const REPORT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24시간

function hashUrl(url: string): string {
  return createHash('sha256').update(`sellscore:url:${url}`).digest('hex').slice(0, 40);
}

async function getCachedReport(normalizedUrl: string): Promise<Record<string, unknown> | null> {
  try {
    const snap = await db.collection('reportCache').doc(hashUrl(normalizedUrl)).get();
    if (!snap.exists) return null;
    const data = snap.data();
    const createdAt = data?.createdAt as FirebaseFirestore.Timestamp | undefined;
    if (!data?.report || !createdAt) return null;
    if (Date.now() - createdAt.toMillis() > REPORT_CACHE_TTL_MS) return null;
    return data.report as Record<string, unknown>;
  } catch (err) {
    console.warn('[reportCache] 조회 실패:', (err as Error).message);
    return null;
  }
}

async function setCachedReport(normalizedUrl: string, report: Record<string, unknown>): Promise<void> {
  try {
    await db.collection('reportCache').doc(hashUrl(normalizedUrl)).set({
      report,
      url: normalizedUrl,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.warn('[reportCache] 저장 실패:', (err as Error).message);
  }
}

// ── 12개 프레임워크 메타데이터 (프론트엔드 scoreEngine.ts와 동일하게 유지할 것) ──

interface FrameworkMaster {
  name: string;
  theory: string;
  book?: string;
}

interface FrameworkMeta {
  id: string;
  koreanName: string;
  technique: string;
  evidence: string;
  promptCategory: 'sales' | 'seo';
  rubric: string;
  /** 실존 인물 기반 이론 인용 — 없으면(공식 가이드/심리학 원칙 등) undefined */
  master?: FrameworkMaster;
  /** 종합 점수 가중합산에 쓰이는 비중 — 12개 합이 100 */
  weight: number;
}

// 12개 프레임워크 = 실제 책·매출로 검증된 마케팅 거장 12명. 각자의 이론을
// 이름만 빌리는 게 아니라 실제 핵심 로직에 맞춰 채점 기준(rubric)을 짰다.
const FRAMEWORKS: FrameworkMeta[] = [
  {
    id: 'preeminence',
    weight: 10,
    koreanName: '권위 포지셔닝 & 리스크 리버설',
    technique: '리스크 리버설(Risk Reversal)',
    evidence: '제이 에이브러햄 — Preeminence, 전략적 제휴 이론',
    promptCategory: 'sales',
    rubric: '환불 보장, 후기, 실적 지표 등 리스크 리버설 요소가 있는지, CTA와 얼마나 가까이 배치되어 있는지 평가',
    master: {
      name: '제이 에이브러햄(Jay Abraham)',
      theory: 'Preeminence — 판매자가 아니라 "믿을 수 있는 조언자" 위치를 먼저 점유하는 관점 전환',
    },
  },
  {
    id: 'value_ladder',
    weight: 10,
    koreanName: '가치 사다리 & 훅-스토리-오퍼',
    technique: '가치 사다리(Value Ladder)',
    evidence: '러셀 브런슨 — Value Ladder & Hook-Story-Offer',
    promptCategory: 'sales',
    rubric: '무료/저가 진입 오퍼부터 본상품까지 단계가 있는지, 훅 문장이 첫 화면에 있는지 평가',
    master: {
      name: '러셀 브런슨(Russell Brunson)',
      theory: '무료→저가→중가→고가로 이어지는 계단형 오퍼. 매 단계마다 훅·스토리·제안 3요소 반복',
      book: 'DotCom Secrets',
    },
  },
  {
    id: 'sideways',
    weight: 7,
    koreanName: '측면 세일즈 레터 구조',
    technique: '다이렉트 리스폰스 원칙(Direct Response Principle)',
    evidence: '게리 할버트 — "가장 배고픈 군중을 찾아라"',
    promptCategory: 'sales',
    rubric: '문제→시도와 실패→발견→결과 순서의 스토리 구조가 있는지, 스토리가 CTA로 자연스럽게 이어지는지 평가',
    master: {
      name: '게리 할버트(Gary Halbert)',
      theory: '카피보다 타깃 선정이 먼저 — 가장 배고픈 군중(가장 절실한 고객)을 찾는 게 스토리보다 우선',
      book: 'The Boron Letters',
    },
  },
  {
    id: 'positioning',
    weight: 10,
    koreanName: '포지셔닝 & 다이렉트 리스폰스 카피',
    technique: '매그네틱 마케팅(Magnetic Marketing)',
    evidence: '댄 케네디 — 매그네틱 마케팅, 무저항 제안',
    promptCategory: 'seo',
    rubric: '헤드라인이 회사소개형인지 결과중심형인지, 서브카피가 헤드라인을 구체화하는지 평가',
    master: {
      name: '댄 케네디(Dan Kennedy)',
      theory: '특정 타깃에게만 말을 거는 정밀 타겟팅 + 위험을 판매자가 대신 지는 역보증 구조',
      book: 'No B.S. Marketing',
    },
  },
  {
    id: 'results_in_advance',
    weight: 8,
    koreanName: '결과 선체험 설계',
    technique: '결과 선체험(Results In Advance)',
    evidence: '프랭크 컨 — Mass Control, 결과 선지급',
    promptCategory: 'sales',
    rubric: '구매 전 결과물 미리보기(샘플/데모/스크린샷)가 있는지, 결제 버튼과 가까운지 평가',
    master: {
      name: '프랭크 컨(Frank Kern)',
      theory: '판매 전에 작은 실제 결과를 먼저 경험시켜 신뢰를 앞당기는 구조',
    },
  },
  {
    id: 'attention_rhythm',
    weight: 7,
    koreanName: '주의력 경제 & 콘텐츠 리듬',
    technique: 'Customer Value Journey',
    evidence: '라이언 다이스 — Customer Value Journey 8단계',
    promptCategory: 'seo',
    rubric: '첫 화면 정보 밀도, 섹션 간 리듬(텍스트/이미지/숫자 배치) 평가',
    master: {
      name: '라이언 다이스(Ryan Deiss)',
      theory: '인지→참여→구독→전환→흥분→상승→옹호→추천, 낯선 사람을 팬으로 전환하는 8단계 지도',
    },
  },
  {
    id: 'seo_infra',
    weight: 9,
    koreanName: '검색 유입 구조',
    technique: 'Pillar-Cluster 모델',
    evidence: '닐 파텔 — Pillar-Cluster Model / Google Search Essentials',
    promptCategory: 'seo',
    rubric: 'title/meta description 품질, 구조화 데이터(JSON-LD), heading 계층 구조 평가',
    master: {
      name: '닐 파텔(Neil Patel)',
      theory: '큰 주제의 필러 페이지와 세부 클러스터 콘텐츠를 내부링크로 연결해 검색 권위를 쌓는 구조',
    },
  },
  {
    id: 'emotional_momentum',
    weight: 8,
    koreanName: '감정 모멘텀 & 스케일 프레이밍',
    technique: '사회적 증거(Social Proof) 원칙',
    evidence: '로버트 치알디니 — Influence, 사회적 증거 원칙',
    promptCategory: 'sales',
    rubric: '누적 고객수/실적 등 사회적 증거 숫자가 있는지, 비교 기준과 함께 제시되는지 평가',
    master: {
      name: '로버트 치알디니(Robert Cialdini)',
      theory:
        '사람은 확신이 없을 때 타인의 행동을 보고 따라한다 — 숫자·후기·사용자 수가 많을수록 신뢰와 행동 전환이 커진다',
      book: 'Influence: The Psychology of Persuasion',
    },
  },
  {
    id: 'challenge_funnel',
    weight: 9,
    koreanName: '챌린지 퍼널 & 긴급성 설계',
    technique: 'PLC(Pre-Launch Content) 1-2-3',
    evidence: '제프 워커 — PLC + 오픈카트',
    promptCategory: 'sales',
    rubric: '마감/한정 수량 등 긴급성 장치가 있는지, 진짜 데이터 기반인지 평가',
    master: {
      name: '제프 워커(Jeff Walker)',
      theory: '사전 콘텐츠로 신뢰를 단계적으로 쌓고, 한정된 판매창(오픈카트)을 여는 시간 압박 구조',
      book: 'Launch',
    },
  },
  {
    id: 'pricing_ltv',
    weight: 10,
    koreanName: '가격 구조 & LTV 설계',
    technique: 'Value Equation, Grand Slam Offer',
    evidence: '알렉스 하모지 — Value Equation, Grand Slam Offer',
    promptCategory: 'sales',
    rubric: '가격 옵션이 몇 단계인지, 재구매/업셀 유도 문구가 있는지 평가',
    master: {
      name: '알렉스 하모지(Alex Hormozi)',
      theory: '가치 = (꿈의 결과 × 성공 확률) ÷ (시간지연 × 노력) — 가격이 아니라 이 4변수를 조정해 저항 없는 제안 설계',
      book: '$100M Offers',
    },
  },
  {
    id: 'channel_strategy',
    weight: 6,
    koreanName: '채널 전략 진단',
    technique: 'Five Money-Making Marketing Models',
    evidence: '에벤 페이건 — 콜드/매스/추천/검색/1대1 채널 진단',
    promptCategory: 'seo',
    rubric:
      '사이트에 실제로 연결된 유입 채널(SNS, 검색, 추천, 콘텐츠)이 사업 단계에 맞게 다각화되어 있는지, 특정 채널 하나에만 의존하고 있지 않은지 평가',
    master: {
      name: '에벤 페이건(Eben Pagan)',
      theory: '사업 단계에 따라 콜드·매스·추천·검색·1대1 중 맞는 채널을 먼저 진단',
    },
  },
  {
    id: 'expert_authority',
    weight: 6,
    koreanName: '전문가 신뢰 자산화',
    technique: 'Expert Positioning',
    evidence: '브렌든 버처드 — High Performance, Experts Academy',
    promptCategory: 'sales',
    rubric: '운영자/전문가의 이력·자격·얼굴이 드러나는 소개가 있는지, 이를 신뢰 자산으로 활용하고 있는지 평가',
    master: {
      name: '브렌든 버처드(Brendon Burchard)',
      theory: '이미 가진 전문성을 콘텐츠로 체계화해, 팔 수 있는 신뢰 자산으로 만드는 구조',
    },
  },
];

const FRAMEWORK_IDS = FRAMEWORKS.map((f) => f.id);

// ── 페이지 크롤링 ──

interface PageContent {
  normalizedUrl: string;
  domain: string;
  title: string;
  metaDescription: string;
  headings: string[];
  bodyText: string;
  hasJsonLd: boolean;
  imgCount: number;
  imgWithAlt: number;
  // 하드체크 신호 (LLM 판단 없이 마크업에서 직접 확인 가능한 사실들)
  h1Count: number;
  hasCanonical: boolean;
  ogCount: number;
  hasViewport: boolean;
  hasFaviconTag: boolean;
  hasAnalytics: boolean;
  naverVerified: boolean;
  googleVerified: boolean;
  snsChannels: string[];
  hasContactChannel: boolean;
  // ── ① 사이트·기술 구조 체크리스트용 신호 ──
  mixedContentCount: number;
  hasSitemap: boolean;
  robotsBlocksAll: boolean;
  hasWebsiteSchema: boolean;
  hasBreadcrumbSchema: boolean;
  /** 내부 링크 중 쿼리스트링·해시 남용 없이 설명적인 경로 비율 (0~1), 표본 없으면 null */
  descriptiveUrlRatio: number | null;
}

// 링크 href의 호스트로 SNS/채널 종류를 식별한다
const SNS_HOSTS: Record<string, string> = {
  'instagram.com': '인스타그램',
  'youtube.com': '유튜브',
  'youtu.be': '유튜브',
  'blog.naver.com': '네이버 블로그',
  'band.us': '네이버 밴드',
  'facebook.com': '페이스북',
  'threads.net': '스레드',
  'pf.kakao.com': '카카오톡 채널',
  'x.com': 'X(트위터)',
  'twitter.com': 'X(트위터)',
};

// JSON-LD 스크립트를 전부 파싱해서 등장하는 모든 @type을 모은다.
// 값이 객체 하나일 수도, 배열일 수도, @graph로 감싸져 있을 수도 있어 재귀적으로 훑는다.
function collectJsonLdTypes(html: string): Set<string> {
  const types = new Set<string>();
  const $ = cheerio.load(html);
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw || !raw.trim()) return;
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }
    const visit = (node: unknown) => {
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      if (node && typeof node === 'object') {
        const obj = node as Record<string, unknown>;
        const t = obj['@type'];
        if (typeof t === 'string') types.add(t);
        else if (Array.isArray(t)) t.forEach((x) => typeof x === 'string' && types.add(x));
        if (Array.isArray(obj['@graph'])) (obj['@graph'] as unknown[]).forEach(visit);
      }
    };
    visit(data);
  });
  return types;
}

// 내부 링크 href를 표본으로 뽑아 "설명적 URL"인지 휴리스틱으로 판단한다.
// 쿼리스트링에 id/세션 같은 파라미터만 잔뜩 붙어있거나 경로가 숫자·해시로만
// 이루어지면 설명적이지 않다고 본다. 표본이 없으면 null(판단 불가).
function computeDescriptiveUrlRatio($: cheerio.CheerioAPI, normalizedUrl: string): number | null {
  const origin = new URL(normalizedUrl).origin;
  const samples = new Set<string>();
  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').trim();
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    try {
      const abs = new URL(href, normalizedUrl);
      if (abs.origin !== origin) return;
      samples.add(abs.pathname + abs.search);
    } catch {
      /* 무시 */
    }
  });
  if (samples.size === 0) return null;

  let descriptive = 0;
  for (const path of samples) {
    const [pathname, search] = path.split('?');
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || '';
    // 마지막 경로가 순수 숫자/해시만이거나(예: /p/8823), 물음표 뒤 파라미터가
    // 3개를 넘어가면(추적/세션 파라미터 남용 가능성) 설명적이지 않다고 본다.
    const isNumericOnly = /^[0-9a-f]{6,}$/i.test(lastSegment) || /^\d+$/.test(lastSegment);
    const paramCount = search ? search.split('&').filter(Boolean).length : 0;
    if (!isNumericOnly && paramCount <= 2) descriptive += 1;
  }
  return descriptive / samples.size;
}

function parseHtml(html: string, normalizedUrl: string, domain: string): PageContent {
  const $ = cheerio.load(html);

  const title = $('title').first().text().trim();
  const metaDescription = ($('meta[name="description"]').attr('content') || '').trim();
  const headings = $('h1, h2')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 20);
  const hasJsonLd = $('script[type="application/ld+json"]').length > 0;
  const imgCount = $('img').length;
  const imgWithAlt = $('img[alt]').filter((_, el) => ($(el).attr('alt') || '').trim().length > 0).length;

  const h1Count = $('h1').length;
  const hasCanonical = $('link[rel="canonical"]').length > 0;
  const ogCount = ['og:title', 'og:description', 'og:image'].filter(
    (prop) => ($(`meta[property="${prop}"]`).attr('content') || '').trim().length > 0
  ).length;
  const hasViewport = $('meta[name="viewport"]').length > 0;
  const hasFaviconTag =
    $('link[rel="icon"]').length > 0 ||
    $('link[rel="shortcut icon"]').length > 0 ||
    $('link[rel="apple-touch-icon"]').length > 0;
  const hasAnalytics =
    /googletagmanager\.com|gtag\(|google-analytics\.com|analytics\.js|clarity\.ms|wcs\.naver\.net/i.test(html);
  const naverVerified = $('meta[name="naver-site-verification"]').length > 0;
  const googleVerified = $('meta[name="google-site-verification"]').length > 0;

  const snsChannels = new Set<string>();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    for (const [host, label] of Object.entries(SNS_HOSTS)) {
      if (href.includes(host)) snsChannels.add(label);
    }
  });
  const hasContactChannel =
    $('a[href^="tel:"]').length > 0 || $('a[href^="mailto:"]').length > 0 || html.includes('pf.kakao.com');

  // ── ① 사이트·기술 구조 신규 신호 ──
  const jsonLdTypes = collectJsonLdTypes(html);
  const hasWebsiteSchema = jsonLdTypes.has('WebSite');
  const hasBreadcrumbSchema = jsonLdTypes.has('BreadcrumbList');
  // 이 페이지가 이미 https로 로드됐다는 전제하에, 그 안에서 http://로 직접
  // 불러오는 리소스(이미지·스크립트·스타일시트)가 있으면 혼합 콘텐츠다.
  const mixedContentCount =
    (html.match(/\ssrc=["']http:\/\//gi) || []).length +
    (html.match(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']http:\/\//gi) || []).length;
  const descriptiveUrlRatio = computeDescriptiveUrlRatio($, normalizedUrl);

  $('script, style, noscript, svg').remove();
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 6000);

  return {
    normalizedUrl,
    domain,
    title,
    metaDescription,
    headings,
    bodyText,
    hasJsonLd,
    imgCount,
    imgWithAlt,
    h1Count,
    hasCanonical,
    ogCount,
    hasViewport,
    hasFaviconTag,
    hasAnalytics,
    naverVerified,
    googleVerified,
    snsChannels: Array.from(snsChannels),
    hasContactChannel,
    mixedContentCount,
    hasSitemap: false, // extractPageContent에서 별도 요청 후 덮어씀
    robotsBlocksAll: false, // extractPageContent에서 별도 요청 후 덮어씀
    hasWebsiteSchema,
    hasBreadcrumbSchema,
    descriptiveUrlRatio,
  };
}

// CSR(클라이언트 렌더링) 사이트용 폴백 — 화면 없는 크롬으로 자바스크립트를
// 실제로 실행한 뒤 완성된 HTML을 가져온다. 실패하면 null.
async function renderWithHeadlessBrowser(url: string): Promise<string | null> {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 900 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (compatible; SellScoreBot/1.0; +https://sellscore-app.web.app)'
    );
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    // 렌더링 마무리 여유 (지연 로딩되는 콘텐츠 대비)
    await new Promise((r) => setTimeout(r, 1500));
    return await page.content();
  } catch (err) {
    console.warn('[headless] 렌더링 실패:', (err as Error).message);
    return null;
  } finally {
    if (browser) await browser.close().catch(() => undefined);
  }
}

const MIN_BODY_CHARS = 200;

function normalizeUrl(rawUrl: string): { normalizedUrl: string; domain: string } {
  const normalizedUrl = /^https?:\/\//.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  const domain = new URL(normalizedUrl).hostname.replace(/^www\./, '');
  return { normalizedUrl, domain };
}

async function extractPageContent(rawUrl: string): Promise<PageContent> {
  const { normalizedUrl, domain } = normalizeUrl(rawUrl);

  // 1단계: 빠른 정적 fetch (서버가 완성된 HTML을 주는 사이트는 여기서 끝)
  const res = await fetch(normalizedUrl, {
    signal: AbortSignal.timeout(12000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SellScoreBot/1.0; +https://sellscore.example)' },
  });
  if (!res.ok) {
    throw new Error(`사이트 응답 오류 (HTTP ${res.status})`);
  }
  const staticHtml = await res.text();
  let page = parseHtml(staticHtml, normalizedUrl, domain);

  // 2단계: 본문이 비어있으면(CSR) 헤드리스 브라우저로 조립 실행 후 다시 읽기
  if (page.bodyText.length < MIN_BODY_CHARS) {
    console.log(`[extractPageContent] 정적 본문 ${page.bodyText.length}자 → 헤드리스 렌더링 시도`);
    const renderedHtml = await renderWithHeadlessBrowser(normalizedUrl);
    if (renderedHtml) {
      page = parseHtml(renderedHtml, normalizedUrl, domain);
    }
  }

  // 두 방식 모두 실패하면 지어내지 않고 정직하게 거절한다
  if (page.bodyText.length < MIN_BODY_CHARS) {
    throw new Error(
      '브라우저 렌더링까지 시도했지만 이 사이트에서 읽을 수 있는 본문 텍스트를 찾지 못했습니다. 사이트가 봇 접근을 차단하고 있거나 콘텐츠가 아직 없는 상태일 수 있습니다.'
    );
  }

  // 3단계: robots.txt / sitemap.xml — 홈페이지가 아니라 도메인 루트 기준이라 별도 요청.
  // 둘 다 없거나 실패해도 전체 진단을 막지 않는다(있는 게 좋을 뿐 필수는 아님).
  const origin = new URL(normalizedUrl).origin;
  const [robotsResult, sitemapResult] = await Promise.allSettled([
    fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(6000) }),
    fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(6000), method: 'HEAD' }),
  ]);

  let robotsBlocksAll = false;
  if (robotsResult.status === 'fulfilled' && robotsResult.value.ok) {
    const robotsTxt = await robotsResult.value.text();
    // User-agent: * 아래에 Disallow: / 만 있으면 사이트 전체 차단으로 본다.
    robotsBlocksAll = /user-agent:\s*\*[\s\S]{0,80}?disallow:\s*\/\s*(\n|$)/i.test(robotsTxt);
  }

  const hasSitemap = sitemapResult.status === 'fulfilled' && sitemapResult.value.ok;

  return { ...page, robotsBlocksAll, hasSitemap };
}

// ── Claude 프롬프트 ──

function buildPrompt(page: PageContent, answers: Record<string, string>): string {
  const rubricLines = FRAMEWORKS.map((f) => {
    const masterNote = f.master ? ` [근거: ${f.master.name} — ${f.master.theory}]` : ` [근거: ${f.evidence}]`;
    return `- ${f.id} (${f.koreanName}): ${f.rubric}${masterNote}`;
  }).join('\n');

  return `당신은 웹사이트 설득력/전환율 진단 전문가입니다. 아래 실제로 크롤링한 사이트 정보를 바탕으로 12개 프레임워크 각각을 0~10점으로 채점하고, 실제 근거에 기반한 구체적인 분석을 작성해주세요. 각 프레임워크의 [근거]에 적힌 실존 마케터의 이론에 실제로 부합하는 관점으로 분석하세요 — 이름만 빌리지 말고 그 이론의 핵심 논리를 적용하세요.

[사이트 정보]
도메인: ${page.domain}
title: ${page.title || '(없음)'}
meta description: ${page.metaDescription || '(없음)'}
주요 heading: ${page.headings.join(' / ') || '(없음)'}
구조화 데이터(JSON-LD) 존재: ${page.hasJsonLd ? '있음' : '없음'}
이미지 ${page.imgCount}개 중 alt 텍스트 있는 이미지 ${page.imgWithAlt}개
본문 텍스트(일부): ${page.bodyText || '(추출 실패 — 정보 부족으로 처리)'}

[사업 맥락]
사이트 목적: ${answers.sitePurpose ?? '알 수 없음'}
타겟 고객: ${answers.targetCustomer ?? '알 수 없음'}
월 방문자: ${answers.monthlyVisitors ?? '알 수 없음'}
가장 큰 고민: ${answers.biggestPain ?? '알 수 없음'}

[채점할 12개 프레임워크]
${rubricLines}

각 프레임워크마다 다음을 작성하세요 (id는 위 목록의 영문 id 그대로 사용):
- score: 0~10 사이 점수 (실제 사이트 정보에 근거, 정보가 부족하면 보수적으로 5점 내외)
- currentState: 이 사이트의 현재 상태를 한 문장으로 (도메인명을 자연스럽게 포함)
- flaw: 구체적으로 무엇이 부족한지 (점수가 높으면 사소한 개선점을 적을 것)
- fixCurrent: 현재 상태를 짧게 요약 (5~15자 내외)
- fixTarget: 목표 상태를 짧게 요약 (10~30자 내외)
- alternatives: 실행 가능한 구체적 대안 정확히 3개
- narrative: 점수가 7 이상이면 칭찬 1문장, 7 미만이면 위험 경고 1문장

반드시 한국어로, 실제 사이트 정보에 근거해서 작성하세요. 크롤링 정보가 부족한 항목은 "정보 부족으로 추정치입니다"라고 명시하세요. 12개 프레임워크 모두 빠짐없이 작성하세요.`;
}

// ── 구조화 출력 스키마 (Claude structured outputs) ──
// 참고: 숫자 범위(minimum/maximum)와 배열 길이 제약은 구조화 출력 스키마에서
// 지원되지 않으므로, 점수/배열 길이는 프롬프트로 유도하고 서버에서 방어적으로 검증한다.

const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    frameworks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', enum: FRAMEWORK_IDS },
          score: { type: 'number' },
          currentState: { type: 'string' },
          flaw: { type: 'string' },
          fixCurrent: { type: 'string' },
          fixTarget: { type: 'string' },
          alternatives: { type: 'array', items: { type: 'string' } },
          narrative: { type: 'string' },
        },
        required: ['id', 'score', 'currentState', 'flaw', 'fixCurrent', 'fixTarget', 'alternatives', 'narrative'],
        additionalProperties: false,
      },
    },
  },
  required: ['frameworks'],
  additionalProperties: false,
} as const;

interface RawFrameworkResult {
  id: string;
  score: number;
  currentState: string;
  flaw: string;
  fixCurrent: string;
  fixTarget: string;
  alternatives: string[];
  narrative: string;
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return (min + max) / 2;
  return Math.min(max, Math.max(min, n));
}

function gradeFromScore(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  if (score >= 45) return 'C';
  return 'D';
}

// ── 하드체크 (LLM 판단 없이 마크업 사실만으로 채점) ──
// 구글/네이버 공식 가이드를 20~30개 체크리스트로 만들어 각 항목에 배점을
// 매기는 게 목표. 1단계는 ① 사이트·기술 구조(35점) — 나머지 ②콘텐츠(30)
// ③이미지(25) ④동영상(10)은 이후 단계에서 추가한다.

interface HardCheckItem {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

function buildHardChecks(page: PageContent): HardCheckItem[] {
  const checks: HardCheckItem[] = [];

  if (page.h1Count === 1) {
    checks.push({ id: 'h1', label: 'H1 제목 태그', status: 'pass', detail: 'H1이 정확히 1개 있습니다.' });
  } else if (page.h1Count === 0) {
    checks.push({
      id: 'h1',
      label: 'H1 제목 태그',
      status: 'fail',
      detail: 'H1 태그가 없습니다. 검색엔진이 페이지 주제를 파악하기 어렵습니다.',
    });
  } else {
    checks.push({
      id: 'h1',
      label: 'H1 제목 태그',
      status: 'warn',
      detail: `H1이 ${page.h1Count}개입니다. 1개로 정리하는 것을 권장합니다.`,
    });
  }

  checks.push(
    page.hasCanonical
      ? { id: 'canonical', label: 'canonical 태그', status: 'pass', detail: '중복 콘텐츠 방지 태그가 있습니다.' }
      : {
          id: 'canonical',
          label: 'canonical 태그',
          status: 'warn',
          detail: 'canonical 태그가 없어 중복 URL로 SEO 점수가 분산될 수 있습니다.',
        }
  );

  if (page.ogCount >= 3) {
    checks.push({
      id: 'og',
      label: 'SNS 공유 미리보기(OG 태그)',
      status: 'pass',
      detail: 'og:title/description/image이 모두 있습니다.',
    });
  } else if (page.ogCount >= 1) {
    checks.push({
      id: 'og',
      label: 'SNS 공유 미리보기(OG 태그)',
      status: 'warn',
      detail: `og 태그가 일부(${page.ogCount}/3)만 있습니다.`,
    });
  } else {
    checks.push({
      id: 'og',
      label: 'SNS 공유 미리보기(OG 태그)',
      status: 'fail',
      detail: '카카오톡·인스타그램에 링크 공유 시 미리보기가 깨집니다.',
    });
  }

  checks.push(
    page.hasViewport
      ? { id: 'viewport', label: '모바일 대응(viewport)', status: 'pass', detail: '모바일 화면에 맞춰 표시됩니다.' }
      : {
          id: 'viewport',
          label: '모바일 대응(viewport)',
          status: 'fail',
          detail: 'viewport 태그가 없어 모바일에서 깨져 보일 수 있습니다.',
        }
  );

  checks.push(
    page.hasFaviconTag
      ? { id: 'favicon', label: '파비콘', status: 'pass', detail: '브라우저 탭 아이콘이 설정되어 있습니다.' }
      : {
          id: 'favicon',
          label: '파비콘',
          status: 'warn',
          detail: '파비콘이 없어 브라우저 탭에서 아이콘 없이 표시됩니다.',
        }
  );

  checks.push(
    page.hasAnalytics
      ? {
          id: 'analytics',
          label: '방문자 추적(애널리틱스)',
          status: 'pass',
          detail: '트래픽 분석 도구가 설치되어 있습니다.',
        }
      : {
          id: 'analytics',
          label: '방문자 추적(애널리틱스)',
          status: 'fail',
          detail: '분석 도구가 없어 몇 명이 방문해서 무엇을 하는지 전혀 알 수 없습니다.',
        }
  );

  checks.push(
    page.naverVerified
      ? {
          id: 'naver',
          label: '네이버 서치어드바이저 등록',
          status: 'pass',
          detail: '네이버 검색 노출 관리가 가능한 상태입니다.',
        }
      : {
          id: 'naver',
          label: '네이버 서치어드바이저 등록',
          status: 'warn',
          detail: '등록되어 있지 않아 네이버 검색 노출 상태를 확인할 수 없습니다.',
        }
  );

  checks.push(
    page.googleVerified
      ? {
          id: 'google',
          label: '구글 서치콘솔 등록',
          status: 'pass',
          detail: '구글 검색 노출 관리가 가능한 상태입니다.',
        }
      : {
          id: 'google',
          label: '구글 서치콘솔 등록',
          status: 'warn',
          detail: '등록되어 있지 않아 구글 검색 성과를 추적할 수 없습니다.',
        }
  );

  checks.push(
    page.snsChannels.length > 0
      ? { id: 'sns', label: 'SNS/채널 연결', status: 'pass', detail: `연결된 채널: ${page.snsChannels.join(', ')}` }
      : { id: 'sns', label: 'SNS/채널 연결', status: 'warn', detail: '사이트에 연결된 SNS·채널 링크가 없습니다.' }
  );

  checks.push(
    page.hasContactChannel
      ? {
          id: 'contact',
          label: '연락 채널(전화/이메일/카카오)',
          status: 'pass',
          detail: '방문자가 바로 연락할 수 있는 채널이 있습니다.',
        }
      : {
          id: 'contact',
          label: '연락 채널(전화/이메일/카카오)',
          status: 'warn',
          detail: '전화·이메일·카카오채널 등 즉시 연락 가능한 채널이 없습니다.',
        }
  );

  checks.push(
    page.mixedContentCount === 0
      ? { id: 'https', label: 'HTTPS 혼합 콘텐츠 없음', status: 'pass', detail: '모든 리소스가 안전하게(HTTPS) 로드됩니다.' }
      : {
          id: 'https',
          label: 'HTTPS 혼합 콘텐츠 없음',
          status: 'warn',
          detail: `http://로 직접 불러오는 리소스가 ${page.mixedContentCount}개 있어 브라우저가 "안전하지 않음" 경고를 표시할 수 있습니다.`,
        }
  );

  checks.push(
    page.hasSitemap
      ? { id: 'sitemap', label: 'XML 사이트맵', status: 'pass', detail: '/sitemap.xml이 정상적으로 제공됩니다.' }
      : { id: 'sitemap', label: 'XML 사이트맵', status: 'warn', detail: '/sitemap.xml을 찾지 못해 구글에 새 페이지를 알리기 어렵습니다.' }
  );

  checks.push(
    page.robotsBlocksAll
      ? { id: 'robots', label: 'robots.txt 크롤링 허용', status: 'fail', detail: 'robots.txt가 사이트 전체(Disallow: /)를 차단하고 있습니다.' }
      : { id: 'robots', label: 'robots.txt 크롤링 허용', status: 'pass', detail: '검색엔진의 크롤링을 막고 있지 않습니다.' }
  );

  checks.push(
    page.hasWebsiteSchema
      ? { id: 'website_schema', label: '사이트 이름 구조화 데이터', status: 'pass', detail: 'WebSite 구조화 데이터가 있어 검색결과에 정확한 사이트명이 표시될 수 있습니다.' }
      : { id: 'website_schema', label: '사이트 이름 구조화 데이터', status: 'warn', detail: 'WebSite 구조화 데이터가 없어 구글이 임의로 사이트 이름을 추정합니다.' }
  );

  checks.push(
    page.hasBreadcrumbSchema
      ? { id: 'breadcrumb_schema', label: '탐색경로(breadcrumb) 구조화 데이터', status: 'pass', detail: '검색결과에 URL 대신 탐색경로가 표시될 수 있습니다.' }
      : { id: 'breadcrumb_schema', label: '탐색경로(breadcrumb) 구조화 데이터', status: 'warn', detail: 'breadcrumb 구조화 데이터가 없어 검색결과에 긴 URL이 그대로 노출됩니다.' }
  );

  if (page.descriptiveUrlRatio === null) {
    checks.push({ id: 'url_structure', label: 'URL 구조', status: 'warn', detail: '내부 링크 표본을 찾지 못해 URL 구조를 판단할 수 없습니다.' });
  } else if (page.descriptiveUrlRatio >= 0.7) {
    checks.push({ id: 'url_structure', label: 'URL 구조', status: 'pass', detail: '대부분의 내부 링크가 의미를 알 수 있는 경로로 되어 있습니다.' });
  } else {
    checks.push({
      id: 'url_structure',
      label: 'URL 구조',
      status: 'warn',
      detail: `내부 링크 중 ${Math.round((1 - page.descriptiveUrlRatio) * 100)}%가 숫자·파라미터 위주라 사람과 검색엔진이 내용을 짐작하기 어렵습니다.`,
    });
  }

  return checks;
}

const OFFICIAL_LINKS = [
  { id: 'naver', label: '네이버 서치어드바이저 등록', url: 'https://searchadvisor.naver.com/' },
  { id: 'google', label: '구글 서치콘솔 등록', url: 'https://search.google.com/search-console/welcome' },
  { id: 'daum', label: '다음(Daum) 검색등록', url: 'https://register.search.daum.net/index.daum' },
] as const;

interface OfficialLink {
  id: string;
  label: string;
  url: string;
  recommended: boolean;
}

function buildOfficialLinks(page: PageContent): OfficialLink[] {
  return OFFICIAL_LINKS.map((link) => ({
    ...link,
    recommended: link.id === 'naver' ? !page.naverVerified : link.id === 'google' ? !page.googleVerified : true,
  }));
}

interface TrafficInfra {
  hasAnalytics: boolean;
  naverVerified: boolean;
  googleVerified: boolean;
  snsChannels: string[];
  hasContactChannel: boolean;
  missingCount: number;
}

function buildTrafficInfra(page: PageContent): TrafficInfra {
  const flags = [
    !page.hasAnalytics,
    !page.naverVerified,
    !page.googleVerified,
    page.snsChannels.length === 0,
    !page.hasContactChannel,
  ];
  return {
    hasAnalytics: page.hasAnalytics,
    naverVerified: page.naverVerified,
    googleVerified: page.googleVerified,
    snsChannels: page.snsChannels,
    hasContactChannel: page.hasContactChannel,
    missingCount: flags.filter(Boolean).length,
  };
}

// ── SEO·기술 최적화 점수 ──
// "AI가 판단한 설득력 점수"와 완전히 분리된, 구글/네이버 공식 가이드
// 기준의 객관적 점수. 하드체크 사실(마크업)과 PageSpeed 공식 실측을
// 가중합산해서 하나의 숫자로 만든다 — 근거(출처)를 항목마다 명시한다.

type ChecklistCategory = 'site' | 'content' | 'image' | 'video';

interface ChecklistItemMeta {
  category: ChecklistCategory;
  /** 이 항목의 만점 — 카테고리 배점(①사이트 35 / ②콘텐츠 30 / ③이미지 25 / ④동영상 10) 안에서 분배 */
  maxPoints: number;
  source: string;
  sourceUrl?: string;
  /** 구글/네이버 공식 가이드 핵심 설명 2~3줄 — 고객이 "진짜 가이드에 근거했구나"를 느끼는 부분 */
  guideline: string;
  goodExample?: string;
  badExample?: string;
}

// ① 사이트·기술 구조 — 35점. 배점 합: 3+3+2+2+2+2+2+2+1.5+1.5+3+3+3+3+3 = 35
const CHECKLIST_META: Record<string, ChecklistItemMeta> = {
  h1: {
    category: 'site',
    maxPoints: 3,
    source: '구글 Search Essentials',
    sourceUrl: 'https://developers.google.com/search/docs/essentials',
    guideline:
      '검색엔진이 페이지의 핵심 주제를 파악하는 가장 중요한 단서가 H1 제목입니다. 한 페이지에 H1이 여러 개거나 없으면 주제가 무엇인지 모호해집니다.',
    goodExample: '<h1>암호화폐 세금 신고 대행 서비스</h1> (페이지당 정확히 1개)',
    badExample: 'H1이 아예 없거나, 로고·배너 문구까지 전부 H1로 되어 있는 경우',
  },
  canonical: {
    category: 'site',
    maxPoints: 3,
    source: '구글 Search Essentials',
    sourceUrl: 'https://developers.google.com/search/docs/essentials',
    guideline:
      '동일한 콘텐츠에 여러 URL(www 유무, http/https 등)로 접근 가능하면 canonical 태그로 대표 URL을 명시해야 검색 점수가 여러 URL로 분산되지 않습니다.',
    goodExample: '<link rel="canonical" href="https://example.com/page" />',
    badExample: 'canonical 태그가 없어 http/https, www/non-www 버전이 각각 별개 페이지로 색인됨',
  },
  og: {
    category: 'site',
    maxPoints: 2,
    source: 'OG 프로토콜 (카카오톡·페이스북 공유 표준)',
    sourceUrl: 'https://ogp.me/',
    guideline:
      'og:title, og:description, og:image이 없으면 카카오톡·인스타그램 등에 링크를 공유했을 때 미리보기가 깨지거나 아예 안 뜹니다.',
  },
  viewport: {
    category: 'site',
    maxPoints: 2,
    source: '구글 모바일 친화성 가이드',
    sourceUrl: 'https://developers.google.com/search/docs/appearance/mobile-friendly',
    guideline: 'viewport 메타 태그가 없으면 모바일에서 레이아웃이 깨지고, 구글은 모바일 우선으로 색인합니다.',
    goodExample: '<meta name="viewport" content="width=device-width, initial-scale=1">',
  },
  favicon: {
    category: 'site',
    maxPoints: 2,
    source: '구글 Search Essentials — 파비콘 가이드라인',
    sourceUrl: 'https://developers.google.com/search/docs/appearance/favicon-in-search',
    guideline:
      '"파비콘은 정사각형(가로세로 비율 1:1)이어야 하며 크기는 8x8픽셀 이상이어야 합니다" — 구글 공식 가이드 원문. 검색결과 목록에서 사이트를 빠르게 식별하는 데 쓰입니다.',
  },
  analytics: {
    category: 'site',
    maxPoints: 2,
    source: '마케팅 인프라 기본 요건',
    guideline: '방문자 분석 도구가 없으면 몇 명이 들어와서 무엇을 했는지 전혀 알 수 없어, 어떤 개선이 효과 있었는지도 측정할 수 없습니다.',
  },
  naver: {
    category: 'site',
    maxPoints: 2,
    source: '네이버 서치어드바이저 가이드',
    sourceUrl: 'https://searchadvisor.naver.com/guide',
    guideline: '네이버 서치어드바이저에 등록해야 네이버 검색 노출 현황을 확인하고 색인 요청을 직접 할 수 있습니다.',
  },
  google: {
    category: 'site',
    maxPoints: 2,
    source: '구글 Search Console 가이드',
    sourceUrl: 'https://search.google.com/search-console/about',
    guideline: '구글 서치콘솔에 등록해야 실제 검색 노출·클릭 데이터를 확인하고, URL 검사·재크롤링 요청을 할 수 있습니다.',
  },
  sns: { category: 'site', maxPoints: 1.5, source: '마케팅 인프라 기본 요건', guideline: '연결된 SNS·채널이 없으면 사이트 밖에서의 신뢰 신호가 부족합니다.' },
  contact: {
    category: 'site',
    maxPoints: 1.5,
    source: '전환 UX 기본 요건',
    guideline: '전화·이메일·카카오채널처럼 즉시 연락 가능한 채널이 없으면 방문자가 문의 없이 이탈합니다.',
  },
  https: {
    category: 'site',
    maxPoints: 2,
    source: '구글 Search Essentials — 기술 요구사항',
    sourceUrl: 'https://developers.google.com/search/docs/essentials/technical',
    guideline:
      'HTTPS 페이지 안에서 이미지·스크립트를 http://로 직접 불러오면(혼합 콘텐츠) 브라우저가 보안 경고를 띄우고, 신뢰도와 접근성 점수가 함께 떨어집니다.',
  },
  sitemap: {
    category: 'site',
    maxPoints: 2,
    source: '구글 Search Essentials — 사이트맵 가이드',
    sourceUrl: 'https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap',
    guideline: '"Google에 변경사항을 계속 알리려면 사이트맵을 제출하는 것이 좋습니다" — 구글 공식 가이드 원문. 새 페이지를 구글이 더 빨리 찾게 해줍니다.',
  },
  robots: {
    category: 'site',
    maxPoints: 2,
    source: '구글 Search Essentials — 크롤링 제어',
    sourceUrl: 'https://developers.google.com/search/docs/crawling-indexing/robots/intro',
    guideline: '홈페이지가 robots.txt로 차단되어 Google에서 콘텐츠에 액세스할 수 없으면 사이트 이름도, 검색 노출도 아예 생성될 수 없습니다.',
    badExample: 'User-agent: *\nDisallow: / (사이트 전체를 검색엔진에서 숨기는 설정 — 실수로 넣는 경우가 많음)',
  },
  website_schema: {
    category: 'site',
    maxPoints: 3,
    source: '구글 Search Essentials — 사이트 이름 가이드',
    sourceUrl: 'https://developers.google.com/search/docs/appearance/site-names',
    guideline:
      '홈페이지에 구조화된 WebSite 데이터를 추가하면 검색결과에 표시되는 "사이트 이름"을 직접 지정할 수 있습니다. 없으면 구글이 title 태그 등에서 임의로 추정합니다.',
    goodExample: '{"@context":"https://schema.org","@type":"WebSite","name":"세일즈스코어","url":"https://example.com/"}',
  },
  breadcrumb_schema: {
    category: 'site',
    maxPoints: 2,
    source: '구글 검색 시각적 요소 갤러리',
    sourceUrl: 'https://developers.google.com/search/docs/appearance/structured-data/breadcrumb',
    guideline: '구조화된 탐색경로(breadcrumb) 데이터를 지정하면 검색결과에 긴 URL 대신 "홈 > 카테고리 > 페이지" 형태의 탐색경로가 표시됩니다.',
  },
  url_structure: {
    category: 'site',
    maxPoints: 3,
    source: '구글 Search Essentials — 사이트 구성 가이드',
    sourceUrl: 'https://developers.google.com/search/docs/crawling-indexing/url-structure',
    guideline: '설명적인 URL은 사용자와 검색엔진 모두 페이지 내용을 예측하기 쉽게 합니다. 의미 없는 숫자·세션ID로만 이루어진 URL은 지양해야 합니다.',
    goodExample: 'example.com/guide/crypto-tax-filing',
    badExample: 'example.com/page?id=8823&sess=a91f2&ref=x',
  },
};

interface TechSeoScoreItem {
  id: string;
  label: string;
  category: ChecklistCategory;
  source: string;
  sourceUrl?: string;
  guideline: string;
  goodExample?: string;
  badExample?: string;
  status: 'pass' | 'warn' | 'fail';
  points: number;
  maxPoints: number;
}

interface TechSeoScore {
  score: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  items: TechSeoScoreItem[];
  /** 현재까지 구현된 카테고리 — 나머지는 순차적으로 추가된다 */
  implementedCategories: ChecklistCategory[];
}

function earnedPoints(status: 'pass' | 'warn' | 'fail', maxPoints: number): number {
  if (status === 'pass') return maxPoints;
  if (status === 'warn') return maxPoints * 0.5;
  return 0;
}

// PSI 실측(성능/접근성/권장사항)은 이미 별도의 performance 카드로 보여주고 있어
// 여기서는 섞지 않는다 — 이 점수는 순수하게 "구글/네이버 공식 체크리스트를
// 몇 점 만점 중 몇 점 이행했는지"만 나타낸다.
function buildTechSeoScore(hardChecks: HardCheckItem[]): TechSeoScore {
  const items: TechSeoScoreItem[] = hardChecks.map((c) => {
    const meta = CHECKLIST_META[c.id];
    const maxPoints = meta?.maxPoints ?? 0;
    return {
      id: c.id,
      label: c.label,
      category: meta?.category ?? 'site',
      source: meta?.source ?? '공식 가이드 기준',
      sourceUrl: meta?.sourceUrl,
      guideline: meta?.guideline ?? '',
      goodExample: meta?.goodExample,
      badExample: meta?.badExample,
      status: c.status,
      points: earnedPoints(c.status, maxPoints),
      maxPoints,
    };
  });

  const earned = items.reduce((sum, i) => sum + i.points, 0);
  const max = items.reduce((sum, i) => sum + i.maxPoints, 0);
  const score = max > 0 ? Math.round((earned / max) * 100) : 0;

  return { score, grade: gradeFromScore(score), items, implementedCategories: ['site'] };
}

// ── Cloud Function ──

export const analyzeSite = onCall(
  // 헤드리스 크롬 실행을 위해 메모리 2GiB, 인스턴스당 동시 1건으로 제한
  // (한 인스턴스에서 크롬 여러 개가 동시에 뜨면 메모리 초과로 죽는다)
  {
    secrets: [anthropicApiKey, pagespeedApiKey],
    // 콜드 스타트(퍼펫티어+크로미움 모듈 로딩) + 헤드리스 렌더링 + Claude 채점 +
    // PSI 실측이 겹치면 120초를 넘는 경우가 있어 여유 있게 잡는다.
    timeoutSeconds: 240,
    memory: '2GiB',
    concurrency: 1,
    cors: true,
  },
  async (request) => {
    const { url, answers } = (request.data ?? {}) as { url?: string; answers?: Record<string, string> };

    if (!url || typeof url !== 'string') {
      throw new HttpsError('invalid-argument', 'url이 필요합니다.');
    }

    // 캐시 히트면 크롤링·PSI·Claude를 전부 건너뛴다 — 비용이 거의 0원이므로
    // IP 무료 횟수도 차감하지 않고 즉시 돌려준다.
    let normalizedUrlForCache: string;
    try {
      normalizedUrlForCache = normalizeUrl(url).normalizedUrl;
    } catch {
      throw new HttpsError('invalid-argument', '올바른 URL 형식이 아닙니다.');
    }
    const cached = await getCachedReport(normalizedUrlForCache);
    if (cached) {
      console.log('[analyzeSite] 캐시 히트:', normalizedUrlForCache);
      return cached;
    }

    // 비로그인 사용자: IP당 무료 3회 제한 (크롤링·AI 비용이 들기 전에 먼저 확인)
    let usageRef: FirebaseFirestore.DocumentReference | null = null;
    if (!request.auth) {
      const forwarded = request.rawRequest.headers['x-forwarded-for'];
      const ip =
        (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded?.[0]) ||
        request.rawRequest.ip ||
        'unknown';
      usageRef = db.collection('usageByIp').doc(hashIp(ip));
      const snap = await usageRef.get();
      const count = snap.exists ? ((snap.data()?.count as number) ?? 0) : 0;
      if (count >= FREE_LIMIT_PER_IP) {
        throw new HttpsError(
          'resource-exhausted',
          `무료 진단 ${FREE_LIMIT_PER_IP}회를 모두 사용하셨습니다. 무료 회원가입하시면 계속 진단할 수 있고, 진단 내역도 저장됩니다.`
        );
      }
    }

    let page: PageContent;
    try {
      page = await extractPageContent(url);
    } catch (err) {
      throw new HttpsError('unavailable', `사이트를 불러올 수 없습니다: ${(err as Error).message}`);
    }

    // PageSpeed 실측은 오래 걸리므로(20~45초) Claude 채점과 병렬로 돌린다
    const psiPromise = fetchPageSpeed(page.normalizedUrl, pagespeedApiKey.value());

    const client = new Anthropic({ apiKey: anthropicApiKey.value() });
    const prompt = buildPrompt(page, answers ?? {});

    let response;
    try {
      // 설치된 @anthropic-ai/sdk(0.70.x) 버전에서는 구조화 출력이 client.beta.messages
      // 네임스페이스의 output_format 필드로 제공된다 (client.messages.create의
      // output_config.format이 아님 — SDK 버전에 따라 API 표면이 다르다).
      response = await client.beta.messages.create({
        model: 'claude-sonnet-5',
        // 12개 프레임워크 + 마스터 인용까지 출력량이 많아 사이트에 따라
        // 12000도 부족한 경우가 있었다(실사이트 테스트에서 확인) — 여유를 더 둔다.
        max_tokens: 20000,
        betas: ['structured-outputs-2025-11-13'],
        output_format: { type: 'json_schema', schema: REPORT_SCHEMA },
        messages: [{ role: 'user', content: prompt }],
      });
    } catch (err) {
      throw new HttpsError('internal', `AI 분석 요청 실패: ${(err as Error).message}`);
    }

    if (response.stop_reason === 'refusal') {
      throw new HttpsError('internal', 'AI가 이 요청을 처리할 수 없습니다.');
    }
    if (response.stop_reason === 'max_tokens') {
      console.error('[analyzeSite] max_tokens 도달로 응답이 중간에 잘림:', {
        url: page.normalizedUrl,
        usage: response.usage,
      });
      throw new HttpsError('internal', 'AI 응답이 너무 길어 중간에 잘렸습니다. 다시 시도해주세요.');
    }

    const textBlock = response.content.find(
      (b): b is Anthropic.Beta.Messages.BetaTextBlock => b.type === 'text'
    );
    if (!textBlock) {
      throw new HttpsError('internal', 'AI 응답을 파싱할 수 없습니다.');
    }

    let parsed: { frameworks: RawFrameworkResult[] };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch (err) {
      console.error('[analyzeSite] JSON 파싱 실패:', {
        url: page.normalizedUrl,
        stopReason: response.stop_reason,
        textLength: textBlock.text.length,
        textTail: textBlock.text.slice(-300),
        parseError: (err as Error).message,
      });
      throw new HttpsError('internal', 'AI 응답이 올바른 JSON이 아닙니다.');
    }

    const frameworks = FRAMEWORKS.map((meta) => {
      const raw = parsed.frameworks.find((f) => f.id === meta.id);
      const score = raw ? Math.round(clamp(raw.score, 0, 10) * 10) / 10 : 5;
      const isStrength = score >= 7;
      const fixCurrent = raw?.fixCurrent ?? '정보 부족';
      const fixTarget = raw?.fixTarget ?? '정보 보강 필요';
      const alternatives = raw?.alternatives?.slice(0, 3) ?? [];

      return {
        id: meta.id,
        name: meta.technique,
        koreanName: meta.koreanName,
        score,
        free: false,
        currentState: raw?.currentState ?? `${page.domain}에 대한 정보가 충분하지 않습니다.`,
        evidence: meta.evidence,
        flaw: raw?.flaw ?? '분석에 필요한 정보가 부족합니다.',
        fixPrompt: {
          current: fixCurrent,
          target: fixTarget,
          alternatives,
          copyPasteInstruction: `[${page.domain} 수정 지시문] 현재: "${fixCurrent}" → 목표: "${fixTarget}". 아래 대안 중 하나를 선택해 실제 카피로 작성해줘: ${alternatives.join(' / ')}`,
        },
        technique: meta.technique,
        narrative: raw?.narrative ?? '',
        isStrength,
        promptCategory: meta.promptCategory,
        master: meta.master,
        weight: meta.weight,
      };
    });

    // 단순 평균이 아니라 방법론 페이지에 공개한 가중치대로 합산한다 —
    // 가중치 12개 합은 100이므로 Σ(score×weight)/10이 그대로 0~100점이 된다.
    const overallScore = Math.round(
      frameworks.reduce((sum, f) => sum + f.score * f.weight, 0) / 10
    );
    const grade = gradeFromScore(overallScore);
    const weakest = [...frameworks].sort((a, b) => a.score - b.score)[0];
    const oneLiner = `가장 치명적인 병목은 '${weakest.koreanName}'입니다. ${weakest.flaw}`;

    // 분석이 성공했을 때만 무료 사용량을 차감한다 (크롤링 실패 등은 횟수 소진 안 함)
    if (usageRef) {
      await usageRef
        .set(
          { count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() },
          { merge: true }
        )
        .catch((err) => console.error('[analyzeSite] 사용량 기록 실패:', err));
    }

    const performance = await psiPromise;
    const hardChecks = buildHardChecks(page);
    const officialLinks = buildOfficialLinks(page);
    const trafficInfra = buildTrafficInfra(page);
    const techSeoScore = buildTechSeoScore(hardChecks);

    const reportPayload = {
      domain: page.domain,
      overallScore,
      grade,
      oneLiner,
      frameworks,
      performance,
      hardChecks,
      officialLinks,
      trafficInfra,
      techSeoScore,
    };

    // 다음 요청부터는 캐시로 응답 — await 없이 흘려보내 응답 지연을 만들지 않는다.
    setCachedReport(page.normalizedUrl, reportPayload).catch((err) =>
      console.error('[analyzeSite] 캐시 저장 실패:', err)
    );

    return reportPayload;
  }
);

// ── 결제 승인 공통 후처리: 구독/에이전시면 플랜 부여, 리포트 단건이면 해당
// 리포트를 영구 언락 — 토스/페이팔 둘 다 승인 성공 후 이 로직을 그대로 쓴다.
async function applyPurchaseSideEffects(
  uid: string,
  pending: FirebaseFirestore.DocumentData
): Promise<void> {
  const productId = pending.productId as string | undefined;
  if (productId && PLAN_PRODUCT_IDS.has(productId)) {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    await db.collection('users').doc(uid).set(
      { plan: productId, planExpiresAt: expiresAt.toISOString() },
      { merge: true }
    );
  }

  const reportId = pending.reportId as string | undefined;
  if (reportId) {
    const reportRef = db.collection('reports').doc(reportId);
    const reportSnap = await reportRef.get();
    if (reportSnap.exists && reportSnap.data()?.userId === uid) {
      await reportRef.update({ paidUnlocked: true });
    } else {
      console.warn('[applyPurchaseSideEffects] reportId 소유자 불일치, 언락 건너뜀:', reportId);
    }
  }
}

// ============================================================
// confirmTossPayment — 토스페이먼츠 결제 승인
// ============================================================
// 토스 결제창은 카드 입력만 받고, 실제 승인(청구 확정)은 서버가
// paymentKey로 토스 승인 API를 호출해야 완료된다. 이 호출이 없으면
// 결제창을 다 채워도 승인 대기 상태로 남아 실제로 청구되지 않는다.
//
// 클라이언트(TossCheckoutButton)가 결제창을 열기 직전에
// payments/{orderId} 문서를 status:'pending'으로 미리 만들어두고,
// 이 함수는 그 문서에서 productId를 찾아 승인 후 상태를 갱신한다.
// ============================================================

export const confirmTossPayment = onCall(
  { secrets: [tossSecretKey], cors: true, timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    const { paymentKey, orderId, amount } = (request.data ?? {}) as {
      paymentKey?: string;
      orderId?: string;
      amount?: number;
    };
    if (!paymentKey || !orderId || typeof amount !== 'number') {
      throw new HttpsError('invalid-argument', 'paymentKey, orderId, amount가 필요합니다.');
    }

    const paymentRef = db.collection('payments').doc(orderId);
    const paymentSnap = await paymentRef.get();
    if (!paymentSnap.exists) {
      throw new HttpsError('not-found', '결제 대기 기록을 찾을 수 없습니다.');
    }
    const pending = paymentSnap.data()!;
    if (pending.userId !== request.auth.uid) {
      throw new HttpsError('permission-denied', '본인 결제만 승인할 수 있습니다.');
    }
    if (pending.amount !== amount) {
      throw new HttpsError('invalid-argument', '결제 금액이 일치하지 않습니다.');
    }
    if (pending.status === 'approved') {
      // 이미 승인 처리된 주문 — 중복 호출(새로고침 등) 시 그대로 성공 반환
      return { success: true, orderId, alreadyApproved: true };
    }

    const basicAuth = Buffer.from(`${tossSecretKey.value()}:`).toString('base64');
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    const tossResult = (await tossRes.json()) as Record<string, unknown>;

    if (!tossRes.ok) {
      await paymentRef.update({
        status: 'failed',
        failReason: tossResult,
        updatedAt: FieldValue.serverTimestamp(),
      });
      throw new HttpsError(
        'aborted',
        (tossResult.message as string) || '결제 승인에 실패했습니다.'
      );
    }

    await paymentRef.update({
      status: 'approved',
      paymentKey,
      method: tossResult.method ?? null,
      receiptUrl: (tossResult.receipt as { url?: string } | undefined)?.url ?? null,
      approvedAt: FieldValue.serverTimestamp(),
    });

    await applyPurchaseSideEffects(request.auth.uid, pending);

    return {
      success: true,
      orderId,
      receiptUrl: (tossResult.receipt as { url?: string } | undefined)?.url ?? null,
    };
  }
);

// ============================================================
// capturePayPalOrder — 페이팔 결제 승인(capture)
// ============================================================
// 예전엔 클라이언트가 PayPal JS SDK로 직접 actions.order.capture()를 호출하고
// 그 결과를 곧이곧대로 믿었다 — 이러면 devtools에서 onSuccess를 그냥 호출해
// 결제 없이 "성공"으로 위장할 수 있다. 이제 client는 주문 승인(approve)까지만
// 하고, 실제 청구(capture)는 서버가 PayPal API를 직접 불러 수행 + 확인한다.
// ============================================================

async function getPayPalAccessToken(): Promise<string> {
  const basic = Buffer.from(`${paypalClientId.value()}:${paypalClientSecret.value()}`).toString(
    'base64'
  );
  const res = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    throw new Error(`PayPal OAuth 토큰 발급 실패: ${res.status}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export const capturePayPalOrder = onCall(
  { secrets: [paypalClientId, paypalClientSecret], cors: true, timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    const { orderId } = (request.data ?? {}) as { orderId?: string };
    if (!orderId) {
      throw new HttpsError('invalid-argument', 'orderId가 필요합니다.');
    }

    const paymentRef = db.collection('payments').doc(orderId);
    const paymentSnap = await paymentRef.get();
    if (!paymentSnap.exists) {
      throw new HttpsError('not-found', '결제 대기 기록을 찾을 수 없습니다.');
    }
    const pending = paymentSnap.data()!;
    if (pending.userId !== request.auth.uid) {
      throw new HttpsError('permission-denied', '본인 결제만 승인할 수 있습니다.');
    }
    if (pending.status === 'approved') {
      return { success: true, orderId, alreadyApproved: true };
    }

    const accessToken = await getPayPalAccessToken();
    const captureRes = await fetch(`${paypalApiBase()}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const captureResult = (await captureRes.json()) as Record<string, unknown>;

    if (!captureRes.ok || captureResult.status !== 'COMPLETED') {
      await paymentRef.update({
        status: 'failed',
        failReason: captureResult,
        updatedAt: FieldValue.serverTimestamp(),
      });
      throw new HttpsError('aborted', 'PayPal 결제 승인에 실패했습니다.');
    }

    await paymentRef.update({
      status: 'approved',
      method: 'paypal',
      approvedAt: FieldValue.serverTimestamp(),
    });

    await applyPurchaseSideEffects(request.auth.uid, pending);

    return { success: true, orderId };
  }
);
