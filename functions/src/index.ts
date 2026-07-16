// ============================================================
// analyzeSite — 실제 URL을 크롤링해서 Claude로 10개 프레임워크를 채점하는
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

initializeApp();
const db = getFirestore();

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');
const pagespeedApiKey = defineSecret('PAGESPEED_API_KEY');

// ── Google PageSpeed Insights 실측 ──
// 실패하면 null을 반환하고 리포트에서 해당 카드를 아예 숨긴다 —
// 추정치를 실측인 것처럼 보여주지 않는다.

export interface PerformanceSnapshot {
  score: number | null; // Lighthouse 성능 점수 0~100
  lcpMs: number | null;
  cls: number | null;
  tbtMs: number | null;
  fcpMs: number | null;
}

async function fetchPageSpeed(url: string, apiKey: string): Promise<PerformanceSnapshot | null> {
  try {
    const endpoint =
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed' +
      `?url=${encodeURIComponent(url)}&key=${apiKey}&category=PERFORMANCE&strategy=mobile`;
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(50000) });
    if (!res.ok) {
      console.warn('[fetchPageSpeed] HTTP', res.status);
      return null;
    }
    const data = (await res.json()) as {
      lighthouseResult?: {
        categories?: { performance?: { score?: number } };
        audits?: Record<string, { numericValue?: number }>;
      };
    };
    const lh = data.lighthouseResult;
    if (!lh) return null;
    const num = (id: string) => lh.audits?.[id]?.numericValue ?? null;
    return {
      score:
        lh.categories?.performance?.score != null
          ? Math.round(lh.categories.performance.score * 100)
          : null,
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

// ── 10개 프레임워크 메타데이터 (프론트엔드 scoreEngine.ts와 동일하게 유지할 것) ──

interface FrameworkMeta {
  id: string;
  koreanName: string;
  technique: string;
  evidence: string;
  promptCategory: 'sales' | 'seo';
  rubric: string;
}

const FRAMEWORKS: FrameworkMeta[] = [
  {
    id: 'preeminence',
    koreanName: '권위 포지셔닝 & 리스크 리버설',
    technique: '리스크 리버설(Risk Reversal)',
    evidence: '설득 심리학 — 신뢰 신호와 손실 회피 이론',
    promptCategory: 'sales',
    rubric: '환불 보장, 후기, 실적 지표 등 리스크 리버설 요소가 있는지, CTA와 얼마나 가까이 배치되어 있는지 평가',
  },
  {
    id: 'value_ladder',
    koreanName: '가치 사다리 & 훅-스토리-오퍼',
    technique: '가치 사다리(Value Ladder)',
    evidence: '다이렉트 리스폰스 마케팅 — 오퍼 구조 이론',
    promptCategory: 'sales',
    rubric: '무료/저가 진입 오퍼부터 본상품까지 단계가 있는지, 훅 문장이 첫 화면에 있는지 평가',
  },
  {
    id: 'sideways',
    koreanName: '측면 세일즈 레터 구조',
    technique: '사이드웨이 세일즈 레터(Sideways Sales Letter)',
    evidence: '스토리텔링 기반 설득 카피 구조',
    promptCategory: 'sales',
    rubric: '문제→시도와 실패→발견→결과 순서의 스토리 구조가 있는지, 스토리가 CTA로 자연스럽게 이어지는지 평가',
  },
  {
    id: 'positioning',
    koreanName: '포지셔닝 & 다이렉트 리스폰스 카피',
    technique: '다이렉트 리스폰스 카피(Direct Response Copywriting)',
    evidence: '다이렉트 리스폰스 카피라이팅 원칙',
    promptCategory: 'seo',
    rubric: '헤드라인이 회사소개형인지 결과중심형인지, 서브카피가 헤드라인을 구체화하는지 평가',
  },
  {
    id: 'results_in_advance',
    koreanName: '결과 선체험 설계',
    technique: '결과 선체험(Results In Advance)',
    evidence: '전환율 최적화 — 사전 체험 원칙',
    promptCategory: 'sales',
    rubric: '구매 전 결과물 미리보기(샘플/데모/스크린샷)가 있는지, 결제 버튼과 가까운지 평가',
  },
  {
    id: 'attention_rhythm',
    koreanName: '주의력 경제 & 콘텐츠 리듬',
    technique: '주의력 경제 설계(Attention Economy)',
    evidence: 'above-the-fold 구성 원칙 / 시선 흐름 설계',
    promptCategory: 'seo',
    rubric: '첫 화면 정보 밀도, 섹션 간 리듬(텍스트/이미지/숫자 배치) 평가',
  },
  {
    id: 'seo_infra',
    koreanName: '검색 유입 구조',
    technique: '검색 인프라 최적화(SEO Infrastructure)',
    evidence: 'Google Search Essentials / 네이버 서치어드바이저 가이드',
    promptCategory: 'seo',
    rubric: 'title/meta description 품질, 구조화 데이터(JSON-LD), heading 계층 구조 평가',
  },
  {
    id: 'emotional_momentum',
    koreanName: '감정 모멘텀 & 스케일 프레이밍',
    technique: '감정 모멘텀 & 스케일 프레이밍(Scale Framing)',
    evidence: '전환 심리 — 사회적 증거와 숫자 프레이밍',
    promptCategory: 'sales',
    rubric: '누적 고객수/실적 등 사회적 증거 숫자가 있는지, 비교 기준과 함께 제시되는지 평가',
  },
  {
    id: 'challenge_funnel',
    koreanName: '챌린지 퍼널 & 긴급성 설계',
    technique: '챌린지 퍼널 & 긴급성 설계(Urgency Design)',
    evidence: '전환율 최적화 — 긴급성/희소성 원칙',
    promptCategory: 'sales',
    rubric: '마감/한정 수량 등 긴급성 장치가 있는지, 진짜 데이터 기반인지 평가',
  },
  {
    id: 'pricing_ltv',
    koreanName: '가격 구조 & LTV 설계',
    technique: '가격 앵커링(Price Anchoring) & LTV 설계',
    evidence: '가격 심리학 — 앵커링과 선택 구조',
    promptCategory: 'sales',
    rubric: '가격 옵션이 몇 단계인지, 재구매/업셀 유도 문구가 있는지 평가',
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
}

async function extractPageContent(rawUrl: string): Promise<PageContent> {
  const normalizedUrl = /^https?:\/\//.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  const domain = new URL(normalizedUrl).hostname.replace(/^www\./, '');

  const res = await fetch(normalizedUrl, {
    signal: AbortSignal.timeout(12000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SellScoreBot/1.0; +https://sellscore.example)' },
  });
  if (!res.ok) {
    throw new Error(`사이트 응답 오류 (HTTP ${res.status})`);
  }
  const html = await res.text();
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

  $('script, style, noscript, svg').remove();
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 6000);

  // 읽을 콘텐츠가 사실상 없으면(자바스크립트로만 그려지는 CSR 사이트 등) 분석하지 않는다.
  // 빈 내용을 AI에게 넘기면 근거 없는 리포트가 만들어지므로, 정직하게 실패를 반환한다.
  if (bodyText.length < 200) {
    throw new Error(
      '이 사이트는 콘텐츠가 브라우저에서만 그려지는 구조(클라이언트 사이드 렌더링)라 진단 엔진이 본문 텍스트를 읽을 수 없습니다. 현재는 서버에서 HTML로 텍스트를 제공하는 사이트만 진단할 수 있습니다.'
    );
  }

  return { normalizedUrl, domain, title, metaDescription, headings, bodyText, hasJsonLd, imgCount, imgWithAlt };
}

// ── Claude 프롬프트 ──

function buildPrompt(page: PageContent, answers: Record<string, string>): string {
  const rubricLines = FRAMEWORKS.map((f) => `- ${f.id} (${f.koreanName}): ${f.rubric}`).join('\n');

  return `당신은 웹사이트 설득력/전환율 진단 전문가입니다. 아래 실제로 크롤링한 사이트 정보를 바탕으로 10개 프레임워크 각각을 0~10점으로 채점하고, 실제 근거에 기반한 구체적인 분석을 작성해주세요.

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

[채점할 10개 프레임워크]
${rubricLines}

각 프레임워크마다 다음을 작성하세요 (id는 위 목록의 영문 id 그대로 사용):
- score: 0~10 사이 점수 (실제 사이트 정보에 근거, 정보가 부족하면 보수적으로 5점 내외)
- currentState: 이 사이트의 현재 상태를 한 문장으로 (도메인명을 자연스럽게 포함)
- flaw: 구체적으로 무엇이 부족한지 (점수가 높으면 사소한 개선점을 적을 것)
- fixCurrent: 현재 상태를 짧게 요약 (5~15자 내외)
- fixTarget: 목표 상태를 짧게 요약 (10~30자 내외)
- alternatives: 실행 가능한 구체적 대안 정확히 3개
- narrative: 점수가 7 이상이면 칭찬 1문장, 7 미만이면 위험 경고 1문장

반드시 한국어로, 실제 사이트 정보에 근거해서 작성하세요. 크롤링 정보가 부족한 항목은 "정보 부족으로 추정치입니다"라고 명시하세요. 10개 프레임워크 모두 빠짐없이 작성하세요.`;
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

// ── Cloud Function ──

export const analyzeSite = onCall(
  { secrets: [anthropicApiKey, pagespeedApiKey], timeoutSeconds: 120, memory: '512MiB', cors: true },
  async (request) => {
    const { url, answers } = (request.data ?? {}) as { url?: string; answers?: Record<string, string> };

    if (!url || typeof url !== 'string') {
      throw new HttpsError('invalid-argument', 'url이 필요합니다.');
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
        max_tokens: 8000,
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
      };
    });

    const overallScore = Math.round(
      (frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length) * 10
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

    return {
      domain: page.domain,
      overallScore,
      grade,
      oneLiner,
      frameworks,
      performance,
    };
  }
);
