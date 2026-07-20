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

  return page;
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

const HARD_CHECK_SOURCES: Record<string, { source: string; sourceUrl?: string }> = {
  h1: { source: '구글 Search Essentials', sourceUrl: 'https://developers.google.com/search/docs/essentials' },
  canonical: { source: '구글 Search Essentials', sourceUrl: 'https://developers.google.com/search/docs/essentials' },
  og: { source: 'OG 프로토콜 (카카오·페이스북 공유 표준)', sourceUrl: 'https://ogp.me/' },
  viewport: {
    source: '구글 모바일 친화성 가이드',
    sourceUrl: 'https://developers.google.com/search/docs/appearance/mobile-friendly',
  },
  favicon: { source: '구글 Search Essentials', sourceUrl: 'https://developers.google.com/search/docs/essentials' },
  analytics: { source: '마케팅 인프라 기본 요건' },
  naver: { source: '네이버 서치어드바이저 가이드', sourceUrl: 'https://searchadvisor.naver.com/guide' },
  google: {
    source: '구글 Search Console 가이드',
    sourceUrl: 'https://search.google.com/search-console/about',
  },
  sns: { source: '마케팅 인프라 기본 요건' },
  contact: { source: '전환 UX 기본 요건' },
};

interface TechSeoScoreItem {
  id: string;
  label: string;
  source: string;
  sourceUrl?: string;
  status: 'pass' | 'warn' | 'fail';
  points: number;
}

interface TechSeoScore {
  score: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  items: TechSeoScoreItem[];
}

function statusPoints(status: 'pass' | 'warn' | 'fail'): number {
  return status === 'pass' ? 100 : status === 'warn' ? 50 : 0;
}

function buildTechSeoScore(
  hardChecks: HardCheckItem[],
  performance: PerformanceSnapshot | null
): TechSeoScore {
  const items: TechSeoScoreItem[] = hardChecks.map((c) => {
    const meta = HARD_CHECK_SOURCES[c.id] ?? { source: '공식 가이드 기준' };
    return {
      id: c.id,
      label: c.label,
      source: meta.source,
      sourceUrl: meta.sourceUrl,
      status: c.status,
      points: statusPoints(c.status),
    };
  });

  const hardCheckAvg = items.reduce((sum, i) => sum + i.points, 0) / items.length;

  // PSI 실측이 있으면 구글 공식 점수(SEO/접근성/권장사항)까지 가중합산,
  // 실측이 없으면(측정 실패) 하드체크만으로 채점한다.
  const hasPsi =
    performance &&
    performance.seoScore != null &&
    performance.accessibilityScore != null &&
    performance.bestPracticesScore != null;

  const score = hasPsi
    ? Math.round(
        0.4 * hardCheckAvg +
          0.3 * performance!.seoScore! +
          0.15 * performance!.accessibilityScore! +
          0.15 * performance!.bestPracticesScore!
      )
    : Math.round(hardCheckAvg);

  return { score, grade: gradeFromScore(score), items };
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
        // 10개→12개 프레임워크로 늘면서 출력량도 늘어 8000으로는 중간에 잘려
        // JSON 파싱이 깨졌다 — 여유 있게 잡는다.
        max_tokens: 12000,
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

    const textBlock = response.content.find(
      (b): b is Anthropic.Beta.Messages.BetaTextBlock => b.type === 'text'
    );
    if (!textBlock) {
      throw new HttpsError('internal', 'AI 응답을 파싱할 수 없습니다.');
    }

    let parsed: { frameworks: RawFrameworkResult[] };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
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
    const techSeoScore = buildTechSeoScore(hardChecks, performance);

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
