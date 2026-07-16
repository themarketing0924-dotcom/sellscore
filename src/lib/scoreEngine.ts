// ============================================================
// 진단 리포트 생성 엔진 (Mock)
// ============================================================
// 지금은 URL을 실제로 크롤링하지 않고, URL 문자열을 시드로 사용해
// 항상 같은 입력에는 같은 점수가 나오도록 만든 결정론적 mock 생성기다.
// 나중에 이 파일의 generateReport()만 실제 크롤링 + Claude API 호출로
// 교체하면 나머지 UI는 그대로 재사용할 수 있다.
// ============================================================

import type { QuestionOption } from '../config/sellscore';

export interface FixPrompt {
  current: string;
  target: string;
  alternatives: string[];
  copyPasteInstruction: string;
}

export interface FrameworkResult {
  id: string;
  name: string;
  koreanName: string;
  score: number; // 0~10
  free: boolean;
  currentState: string;
  evidence: string;
  flaw: string;
  fixPrompt: FixPrompt;
  /** 이 프레임워크가 대표하는 마케팅 기법 이름 (컨설팅 서사용) */
  technique: string;
  /** 점수가 높으면 칭찬, 낮으면 위험 경고 — 컨설팅 서사용 */
  narrative: string;
  isStrength: boolean;
  /** 프롬프트 잠금 해제 카테고리 */
  promptCategory: 'sales' | 'seo';
}

export interface TrafficSnapshot {
  isEstimate: boolean;
  monthlyVisitors: string;
  bounceRate: string;
  avgSessionTime: string;
  insight: string;
}

/** Google PageSpeed Insights 실측값 — 측정 실패 시 리포트에서 카드 자체를 숨긴다 */
export interface PerformanceSnapshot {
  score: number | null;
  lcpMs: number | null;
  cls: number | null;
  tbtMs: number | null;
  fcpMs: number | null;
}

export interface DiagnosisReport {
  domain: string;
  overallScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  oneLiner: string;
  traffic: TrafficSnapshot;
  frameworks: FrameworkResult[];
  /** Google PageSpeed 실측 — 실제 진단 엔진에서만 채워진다 */
  performance?: PerformanceSnapshot | null;
}

// ── 시드 기반 PRNG (같은 URL이면 항상 같은 결과) ──

function hashStringToSeed(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function extractDomain(url: string): string {
  try {
    const withProtocol = url.match(/^https?:\/\//) ? url : `https://${url}`;
    return new URL(withProtocol).hostname.replace(/^www\./, '');
  } catch {
    return url || '이 사이트';
  }
}

function gradeFromScore(score: number): DiagnosisReport['grade'] {
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  if (score >= 45) return 'C';
  return 'D';
}

// ── 10개 프레임워크 정의 + 저/고 점수 템플릿 ──

interface FrameworkTemplate {
  id: string;
  name: string;
  koreanName: string;
  evidence: string;
  low: {
    currentState: string;
    flaw: string;
    fixCurrent: string;
    fixTarget: string;
    alternatives: string[];
  };
  high: {
    currentState: string;
    flaw: string;
    fixCurrent: string;
    fixTarget: string;
    alternatives: string[];
  };
}

const FRAMEWORK_TEMPLATES: FrameworkTemplate[] = [
  {
    id: 'preeminence',
    name: 'Preeminence & Risk Reversal',
    koreanName: '권위 포지셔닝 & 리스크 리버설',
    evidence: '설득 심리학 — 신뢰 신호와 손실 회피 이론',
    low: {
      currentState: '{domain}에는 방문자가 결제 직전 느끼는 불안을 없애주는 장치가 보이지 않습니다.',
      flaw: '환불 보장, 후기, 실적 지표 같은 리스크 리버설 요소가 0개 감지되었습니다.',
      fixCurrent: '보장/환불 문구 없음',
      fixTarget: '"효과 없으면 100% 환불" 같은 구체적 리스크 리버설 문구를 CTA 바로 아래 배치',
      alternatives: [
        '"7일 무료 체험, 언제든 해지 가능" 문구를 히어로 섹션에 추가',
        '실제 고객 후기 3개를 사진과 함께 CTA 근처에 배치',
        '"이미 000명이 사용 중" 같은 사회적 증거 숫자를 헤드라인 아래 추가',
      ],
    },
    high: {
      currentState: '{domain}은 보장/후기 요소를 통해 어느 정도 신뢰 신호를 제공하고 있습니다.',
      flaw: '리스크 리버설 문구는 있지만 CTA 버튼과 시각적으로 떨어져 있어 결제 직전 재확인 효과가 약합니다.',
      fixCurrent: '리스크 리버설 문구가 CTA와 분리되어 배치',
      fixTarget: 'CTA 버튼 바로 아래 1줄로 보장 문구를 재배치',
      alternatives: [
        'CTA 버튼 하단에 "환불 100% 보장" 마이크로카피 추가',
        '결제 버튼 위에 신뢰 배지(보안/인증) 아이콘 배치',
        '체크아웃 페이지에도 동일한 보장 문구 반복 노출',
      ],
    },
  },
  {
    id: 'value_ladder',
    name: 'Value Ladder & Hook-Story-Offer',
    koreanName: '가치 사다리 & 훅-스토리-오퍼',
    evidence: '다이렉트 리스폰스 마케팅 — 오퍼 구조 이론',
    low: {
      currentState: '{domain}은 진입 상품과 상위 상품 사이의 단계가 없이 하나의 상품/가격만 제시하고 있습니다.',
      flaw: '가격 저항을 낮추는 낮은 진입 단계(무료 체험, 저가 상품)가 없습니다.',
      fixCurrent: '단일 가격, 단일 오퍼',
      fixTarget: '무료/저가 진입 오퍼 → 본상품 → 상위 상품으로 이어지는 3단 가치 사다리 구성',
      alternatives: [
        '무료 진단/체험판을 최상단에 배치해 진입 장벽을 낮추기',
        '"첫 구매 50% 할인" 같은 진입 오퍼 추가',
        '본상품 옆에 프리미엄 업셀 상품을 나란히 배치',
      ],
    },
    high: {
      currentState: '{domain}은 진입 상품과 본상품 구조를 갖추고 있습니다.',
      flaw: '훅(Hook) 문장이 상품 설명 뒤에 묻혀 있어 스크롤 3초 안에 임팩트를 주지 못합니다.',
      fixCurrent: '훅 문장이 본문 중간에 위치',
      fixTarget: '훅 문장을 헤드라인으로 승격해 첫 화면 최상단에 배치',
      alternatives: [
        '가장 강력한 결과/숫자를 헤드라인으로 재작성',
        '스토리 도입부를 3줄 이내로 압축해 첫 화면에 노출',
        '오퍼를 헤드라인 바로 아래 서브카피로 명시',
      ],
    },
  },
  {
    id: 'sideways',
    name: 'Sideways Sales Letter',
    koreanName: '측면 세일즈 레터 구조',
    evidence: '스토리텔링 기반 설득 카피 구조',
    low: {
      currentState: '{domain}은 기능 나열 위주로 구성되어 있고 이야기 흐름이 없습니다.',
      flaw: '방문자가 자신의 상황에 감정 이입할 수 있는 서사가 없습니다.',
      fixCurrent: '기능 목록만 나열',
      fixTarget: '문제 상황 → 시도와 실패 → 발견 → 결과 순서의 스토리 구조로 재배열',
      alternatives: [
        '"저도 예전엔 이 문제로 고생했습니다" 같은 공감 문장으로 시작',
        '고객의 Before/After 스토리를 섹션 하나로 분리해 배치',
        '기능을 "이게 왜 당신에게 필요한가"로 재작성',
      ],
    },
    high: {
      currentState: '{domain}은 스토리 구조를 갖추고 있습니다.',
      flaw: '스토리는 있지만 결말(전환 유도)로 자연스럽게 연결되지 않고 끊깁니다.',
      fixCurrent: '스토리 마지막에 CTA 연결이 약함',
      fixTarget: '스토리의 결말 문장 바로 다음 줄에 CTA 버튼 배치',
      alternatives: [
        '스토리 마지막 문장을 "그래서 만든 것이 000입니다"로 오퍼와 직접 연결',
        '스토리 종료 지점에 CTA 버튼을 눈에 띄게 재배치',
        '스토리 중간에 CTA를 1회 더 삽입 (조기 이탈자 대응)',
      ],
    },
  },
  {
    id: 'positioning',
    name: 'Magnetic Positioning & Direct Response Copy',
    koreanName: '포지셔닝 & 다이렉트 리스폰스 카피',
    evidence: '다이렉트 리스폰스 카피라이팅 원칙',
    low: {
      currentState: '{domain}의 헤드라인은 "저희는 ~~를 합니다" 식의 회사 소개형 문장입니다.',
      flaw: '방문자가 얻는 구체적 결과가 헤드라인에 없어 3초 안에 이탈 가능성이 높습니다.',
      fixCurrent: '"저희는 웹사이트 제작 전문 업체입니다"',
      fixTarget: '"3주 안에 매출로 이어지는 홈페이지를 만들어 드립니다" 처럼 결과 중심 문장으로 교체',
      alternatives: [
        '헤드라인에 구체적 숫자(기간, 성과)를 넣기',
        '"어떻게"가 아니라 "무엇을 얻는지"로 문장 재구성',
        '타겟 고객이 쓰는 말투로 헤드라인 다시 쓰기',
      ],
    },
    high: {
      currentState: '{domain}의 헤드라인은 결과 중심으로 작성되어 있습니다.',
      flaw: '헤드라인은 좋지만 서브카피가 헤드라인의 약속을 구체화하지 못합니다.',
      fixCurrent: '서브카피가 헤드라인과 같은 말을 반복',
      fixTarget: '서브카피에 "어떻게" 그 결과를 만드는지 1문장으로 구체화',
      alternatives: [
        '서브카피에 방법론/차별점을 1줄로 추가',
        '서브카피에 타겟 고객을 명시 ("이런 분들께 추천합니다")',
        '헤드라인-서브카피-CTA를 하나의 논리 흐름으로 재작성',
      ],
    },
  },
  {
    id: 'results_in_advance',
    name: 'Results In Advance',
    koreanName: '결과 선체험 설계',
    evidence: '전환율 최적화 — 사전 체험 원칙',
    low: {
      currentState: '{domain}은 구매/신청 전에 결과물을 미리 보여주는 장치가 없습니다.',
      flaw: '방문자가 "이걸 사면 뭘 받는지" 시각적으로 확인할 수 없습니다.',
      fixCurrent: '결과 미리보기 없음',
      fixTarget: '실제 결과물 스크린샷/샘플/데모를 결제 버튼 위에 배치',
      alternatives: [
        '샘플 리포트나 결과물을 무료로 미리 볼 수 있는 링크 추가',
        '데모 영상(30초 이내)을 히어로 섹션에 삽입',
        '"결제 전 미리보기" 버튼을 별도로 추가',
      ],
    },
    high: {
      currentState: '{domain}은 결과 미리보기를 제공하고 있습니다.',
      flaw: '미리보기가 있지만 실제 결제 오퍼와 시각적으로 멀리 떨어져 있습니다.',
      fixCurrent: '미리보기와 결제 버튼이 다른 섹션에 위치',
      fixTarget: '미리보기 바로 옆/아래에 결제 버튼을 배치해 흐름을 끊지 않기',
      alternatives: [
        '미리보기 이미지 하단에 CTA 버튼 직접 배치',
        '미리보기를 스크롤 없이 볼 수 있도록 접이식 UI로 전환',
        '미리보기에 "이 리포트 전체 받기" 마이크로카피 추가',
      ],
    },
  },
  {
    id: 'attention_rhythm',
    name: 'Attention Economy & Content Rhythm',
    koreanName: '주의력 경제 & 콘텐츠 리듬',
    evidence: 'above-the-fold 구성 원칙 / 시선 흐름 설계',
    low: {
      currentState: '{domain}의 첫 화면(above the fold)에 텍스트 블록이 밀도 높게 몰려 있습니다.',
      flaw: '스크롤 전에 시선이 쉴 곳이 없어 3초 이내 이탈 위험이 높습니다.',
      fixCurrent: '첫 화면에 텍스트 5줄 이상 밀집',
      fixTarget: '첫 화면은 헤드라인 + 서브카피 1줄 + CTA 1개로 압축',
      alternatives: [
        '첫 화면 텍스트를 헤드라인/서브카피/CTA 3요소만 남기고 나머지는 스크롤 아래로 이동',
        '섹션 사이 여백을 현재보다 1.5배 늘려 리듬감 부여',
        '이미지-텍스트-이미지 순서로 시선이 자연스럽게 흐르도록 재배치',
      ],
    },
    high: {
      currentState: '{domain}의 첫 화면은 간결하게 구성되어 있습니다.',
      flaw: '첫 화면 이후 섹션 리듬이 단조로워 스크롤 중간 이탈이 발생할 수 있습니다.',
      fixCurrent: '섹션 구성이 텍스트 중심으로 반복',
      fixTarget: '3번째 섹션마다 시각적 변주(이미지, 숫자, 인용문)를 추가해 리듬 유지',
      alternatives: [
        '텍스트 섹션 사이에 숫자/통계 강조 섹션 삽입',
        '고객 인용문을 별도 섹션으로 분리해 리듬 전환',
        '섹션마다 배경색/여백을 다르게 해 시각적 구분 강화',
      ],
    },
  },
  {
    id: 'seo_infra',
    name: 'SEO & Traffic Infrastructure',
    koreanName: '검색 유입 구조',
    evidence: 'Google Search Essentials / 네이버 서치어드바이저 가이드',
    low: {
      currentState: '{domain}의 title/meta description이 비어있거나 브랜드명만 담고 있을 가능성이 높습니다.',
      flaw: '검색 의도를 반영한 키워드가 title 태그에 없어 검색 유입 자체가 제한적입니다.',
      fixCurrent: 'title: "{domain}"',
      fixTarget: 'title: "[핵심 키워드] + [핵심 혜택] | 브랜드명" 형식으로 재작성',
      alternatives: [
        'title 태그에 타겟 고객이 실제 검색할 키워드 삽입',
        'meta description에 클릭을 유도하는 한 문장 추가 (120자 내외)',
        '이미지 alt 텍스트에 의미 있는 설명 채우기',
      ],
    },
    high: {
      currentState: '{domain}은 기본적인 title/meta 구조를 갖추고 있습니다.',
      flaw: '구조화 데이터(schema)와 FAQ 섹션이 없어 AI 검색·리치 스니펫 노출 기회를 놓치고 있습니다.',
      fixCurrent: '구조화 데이터 없음',
      fixTarget: 'FAQ, Organization, Product 등 상황에 맞는 JSON-LD 구조화 데이터 추가',
      alternatives: [
        '자주 묻는 질문 3~5개를 FAQ 섹션 + FAQPage 스키마로 추가',
        '내부 링크로 관련 콘텐츠와 연결해 크롤링 효율 개선',
        'sitemap.xml에 신규 페이지가 누락되지 않았는지 점검',
      ],
    },
  },
  {
    id: 'emotional_momentum',
    name: 'Emotional Momentum & Scale Framing',
    koreanName: '감정 모멘텀 & 스케일 프레이밍',
    evidence: '전환 심리 — 사회적 증거와 숫자 프레이밍',
    low: {
      currentState: '{domain}에는 규모나 실적을 나타내는 숫자가 보이지 않습니다.',
      flaw: '"얼마나 많은 사람이 이미 신뢰했는지"를 보여주는 스케일 신호가 없습니다.',
      fixCurrent: '실적/숫자 없음',
      fixTarget: '"누적 000건", "000명이 선택" 같은 구체적 숫자를 히어로 근처에 배치',
      alternatives: [
        '누적 고객 수, 처리 건수 등 실제 숫자를 헤드라인 아래 배치',
        '고객 로고나 매체 노출 로고를 신뢰 섹션으로 추가',
        '실시간성 있는 지표(이번 달 신청자 수 등)를 노출',
      ],
    },
    high: {
      currentState: '{domain}은 실적 숫자를 노출하고 있습니다.',
      flaw: '숫자는 있지만 감정적 임팩트를 주는 문맥(비교, 스토리) 없이 단독으로 제시됩니다.',
      fixCurrent: '숫자만 단독 표기',
      fixTarget: '숫자 옆에 비교 기준(예: "업계 평균 대비 2배")을 함께 제시',
      alternatives: [
        '숫자 아래 1줄로 "이게 왜 대단한지" 설명 추가',
        '숫자를 애니메이션으로 카운트업시켜 주목도 강화',
        '숫자와 고객 인용문을 나란히 배치해 신뢰도 보강',
      ],
    },
  },
  {
    id: 'challenge_funnel',
    name: 'Challenge Funnel & Urgency Design',
    koreanName: '챌린지 퍼널 & 긴급성 설계',
    evidence: '전환율 최적화 — 긴급성/희소성 원칙',
    low: {
      currentState: '{domain}에는 지금 행동해야 할 이유(마감, 한정 수량 등)가 없습니다.',
      flaw: '"나중에 봐도 되겠다"는 생각이 들게 만들어 즉시 전환을 놓치고 있습니다.',
      fixCurrent: '상시 동일한 오퍼, 마감 없음',
      fixTarget: '"이번 주 신청자 한정 혜택" 같은 진짜 마감이 있는 긴급성 장치 추가',
      alternatives: [
        '선착순 인원 또는 기간 한정 문구를 CTA 근처에 추가',
        '"오늘 신청 시" 조건부 혜택을 명시',
        '남은 자리/시간을 실시간으로 보여주는 카운터 추가',
      ],
    },
    high: {
      currentState: '{domain}은 긴급성 요소를 갖추고 있습니다.',
      flaw: '긴급성 문구가 반복 사용되어 신뢰도를 오히려 낮출 위험이 있습니다.',
      fixCurrent: '모든 섹션에 동일한 마감 문구 반복',
      fixTarget: '긴급성 문구는 CTA 근처 1곳에만 집중 배치하고 나머지는 제거',
      alternatives: [
        '긴급성 문구를 CTA 직전 1곳으로 축소',
        '진짜 데이터 기반 긴급성(실제 마감일)으로 교체',
        '긴급성 대신 특전 강조로 대체할 섹션 구분',
      ],
    },
  },
  {
    id: 'pricing_ltv',
    name: '가격 구조 및 LTV 설계',
    koreanName: '가격 구조 & LTV 설계',
    evidence: '가격 심리학 — 앵커링과 선택 구조',
    low: {
      currentState: '{domain}은 가격 옵션이 1개만 제시되어 있거나 가격이 아예 보이지 않습니다.',
      flaw: '비교 기준(앵커)이 없어 방문자가 가격이 합리적인지 판단할 수 없습니다.',
      fixCurrent: '단일 가격 또는 가격 비공개',
      fixTarget: '3단계 가격 옵션(저가/중가/고가)을 나란히 제시해 중간 옵션 선택을 유도',
      alternatives: [
        '가격표를 3단 비교 구조로 재구성',
        '가장 추천하는 옵션에 "인기" 배지 추가',
        '가격 옆에 "이 가격에 포함된 것"을 체크리스트로 명시',
      ],
    },
    high: {
      currentState: '{domain}은 다단계 가격 구조를 갖추고 있습니다.',
      flaw: '가격 옵션은 있지만 재구매/업셀로 이어지는 다음 단계가 안내되어 있지 않습니다.',
      fixCurrent: '단발성 구매로 종료되는 구조',
      fixTarget: '구매 후 다음 단계(업그레이드, 정기 구독)를 안내하는 문구 추가',
      alternatives: [
        '구매 완료 페이지에 다음 단계 오퍼 추가',
        '정기 구독 시 할인 혜택을 가격표에 명시',
        '기존 고객 전용 업셀 배너 추가',
      ],
    },
  },
];

// ── 컨설팅 서사용 메타데이터 (기법명 + 칭찬/위험 문장 + 프롬프트 카테고리) ──

interface FrameworkNarrative {
  technique: string;
  praise: string;
  risk: string;
  promptCategory: 'sales' | 'seo';
}

const FRAMEWORK_NARRATIVES: Record<string, FrameworkNarrative> = {
  preeminence: {
    technique: '리스크 리버설(Risk Reversal)',
    praise: '리스크 리버설 요소가 잘 갖춰져 있어 결제 직전 불안감을 효과적으로 줄여주고 있습니다.',
    risk: '이 상태가 계속되면 결제 직전 이탈률이 높아지고, 방문자가 사이트를 신뢰하지 못해 재방문도 줄어듭니다.',
    promptCategory: 'sales',
  },
  value_ladder: {
    technique: '가치 사다리(Value Ladder)',
    praise: '진입 상품부터 상위 상품까지 자연스러운 가치 사다리 구조를 갖추고 있습니다.',
    risk: '진입 장벽이 높으면 신규 방문자가 첫 구매까지 가지 못하고 그대로 이탈합니다.',
    promptCategory: 'sales',
  },
  sideways: {
    technique: '사이드웨이 세일즈 레터(Sideways Sales Letter)',
    praise: '스토리텔링 구조로 방문자의 감정 이입을 효과적으로 이끌어내고 있습니다.',
    risk: '스토리에 공감하지 못하면 체류시간이 짧아지고, 구글은 짧은 체류시간을 낮은 품질 신호로 인식해 검색 노출이 낮아질 수 있습니다.',
    promptCategory: 'sales',
  },
  positioning: {
    technique: '다이렉트 리스폰스 카피(Direct Response Copywriting)',
    praise: '헤드라인이 결과 중심으로 명확하게 작성되어 있어 3초 안에 핵심이 전달됩니다.',
    risk: '헤드라인이 모호하면 방문자와 검색엔진 모두 페이지 주제를 파악하기 어려워져, 이탈률 상승과 검색 순위 하락이 동시에 일어날 수 있습니다.',
    promptCategory: 'seo',
  },
  results_in_advance: {
    technique: '결과 선체험(Results In Advance)',
    praise: '구매 전에 결과물을 미리 보여줘 방문자의 확신을 효과적으로 높이고 있습니다.',
    risk: '결과를 미리 보여주지 않으면 신뢰가 부족해져 결제 전환이 낮아집니다.',
    promptCategory: 'sales',
  },
  attention_rhythm: {
    technique: '주의력 경제 설계(Attention Economy)',
    praise: '첫 화면 구성이 간결해 방문자의 시선을 붙잡는 데 성공하고 있습니다.',
    risk: '정보가 밀집되어 있으면 모바일 사용성이 떨어지고, 구글 코어 웹 바이탈 평가에도 부정적 영향을 줄 수 있습니다.',
    promptCategory: 'seo',
  },
  seo_infra: {
    technique: '검색 인프라 최적화(SEO Infrastructure)',
    praise: 'title/meta 기본 구조가 잘 갖춰져 있어 검색엔진이 페이지를 정확히 이해할 수 있습니다.',
    risk: '이 부분이 비어있으면 구글·네이버 검색에 아예 노출되지 않거나, AI 검색(SGE, Perplexity 등)에서 인용조차 되지 않을 수 있습니다.',
    promptCategory: 'seo',
  },
  emotional_momentum: {
    technique: '감정 모멘텀 & 스케일 프레이밍(Scale Framing)',
    praise: '실적 숫자를 노출해 사회적 증거(Social Proof)를 효과적으로 활용하고 있습니다.',
    risk: '규모를 보여주는 신호가 없으면 신생 사이트처럼 보여 신뢰가 떨어지고 구매 전환이 낮아집니다.',
    promptCategory: 'sales',
  },
  challenge_funnel: {
    technique: '챌린지 퍼널 & 긴급성 설계(Urgency Design)',
    praise: '긴급성 장치가 있어 방문자가 지금 행동해야 할 이유를 명확히 느끼게 합니다.',
    risk: '긴급성이 없으면 "나중에 사도 되겠다"는 생각에 방문자가 그대로 이탈하고, 재방문도 잘 일어나지 않습니다.',
    promptCategory: 'sales',
  },
  pricing_ltv: {
    technique: '가격 앵커링(Price Anchoring) & LTV 설계',
    praise: '다단계 가격 구조로 방문자가 합리적으로 가격을 판단할 수 있도록 돕고 있습니다.',
    risk: '비교 기준이 없는 단일 가격은 방문자가 "비싸다"고 느끼게 만들어 구매 직전 이탈로 이어집니다.',
    promptCategory: 'sales',
  },
};

function buildFixPrompt(
  tpl: FrameworkTemplate['low'] | FrameworkTemplate['high'],
  domain: string,
  koreanName: string
): FixPrompt {
  const current = tpl.fixCurrent.replace(/{domain}/g, domain);
  const target = tpl.fixTarget.replace(/{domain}/g, domain);
  return {
    current,
    target,
    alternatives: tpl.alternatives,
    // Claude Code · Cursor · Codex에 그대로 붙여넣는 실행 프롬프트.
    // 범위를 명시해 다른 부분을 건드리지 않도록 하는 게 핵심이다.
    copyPasteInstruction: [
      `내 홈페이지(${domain})에서 "${koreanName}"에 해당하는 부분만 찾아서 수정해줘. 다른 섹션·레이아웃·스타일은 절대 건드리지 마.`,
      '',
      `- 현재: "${current}"`,
      `- 목표: "${target}"`,
      `- 참고 대안(택1 또는 참고해 재작성): ${tpl.alternatives.join(' / ')}`,
      '',
      '작업 범위: 위 문구가 들어있는 요소의 텍스트(그리고 필요하면 강조 스타일)만 바꾼다. 그 외 파일·컴포넌트는 수정하지 않는다.',
    ].join('\n'),
  };
}

const TRAFFIC_BUCKETS: Record<string, { visitors: string; bounce: [number, number]; session: [number, number] }> = {
  under_100: { visitors: '월 100명 미만', bounce: [65, 85], session: [15, 40] },
  '100_1000': { visitors: '월 100~1,000명', bounce: [55, 75], session: [25, 60] },
  '1000_10000': { visitors: '월 1,000~1만 명', bounce: [45, 65], session: [35, 75] },
  over_10000: { visitors: '월 1만 명 이상', bounce: [35, 55], session: [45, 90] },
};

const PAIN_INSIGHT: Record<string, string> = {
  visits_no_purchase: '방문 대비 구매 전환이 낮다는 건, 유입은 성공했지만 페이지 안에서 설득이 끊긴다는 뜻입니다. 아래 카피/설득 구조 프레임워크부터 확인하세요.',
  no_visits: '방문 자체가 적다는 건 설득 구조보다 검색 유입 구조(SEO)를 먼저 점검해야 한다는 신호입니다.',
  no_repurchase: '초기 구매는 있지만 재구매가 없다면, 가격 구조/LTV 설계와 다음 단계 오퍼가 비어있을 가능성이 큽니다.',
  unknown: '무엇이 문제인지 모르시는 상태라면, 10개 프레임워크 전체를 훑어보는 것이 가장 빠른 방법입니다.',
};

/**
 * 트래픽 스냅샷은 실제 GA4 연동 전까지는 목업/AI 엔진 공통으로 이 결정론적
 * 추정치를 사용한다 (같은 domain+answers면 항상 같은 값).
 */
export function buildTrafficSnapshot(
  domain: string,
  answers: Record<string, string>
): TrafficSnapshot {
  const seed = hashStringToSeed(`${domain}::${JSON.stringify(answers)}::traffic`);
  const rand = mulberry32(seed);
  const bucket = TRAFFIC_BUCKETS[answers.monthlyVisitors] || TRAFFIC_BUCKETS['100_1000'];
  const bounce = Math.round(bucket.bounce[0] + rand() * (bucket.bounce[1] - bucket.bounce[0]));
  const sessionSec = Math.round(bucket.session[0] + rand() * (bucket.session[1] - bucket.session[0]));

  return {
    isEstimate: true,
    monthlyVisitors: bucket.visitors,
    bounceRate: `약 ${bounce}% (추정치)`,
    avgSessionTime: `약 ${sessionSec}초 (추정치)`,
    insight: PAIN_INSIGHT[answers.biggestPain] || PAIN_INSIGHT.unknown,
  };
}

export function generateReport(
  url: string,
  answers: Record<string, string>
): DiagnosisReport {
  const domain = extractDomain(url);
  const seed = hashStringToSeed(`${domain}::${JSON.stringify(answers)}`);
  const rand = mulberry32(seed);

  const frameworks: FrameworkResult[] = FRAMEWORK_TEMPLATES.map((tpl, idx) => {
    // 1. 기본 점수는 랜덤(3.0 ~ 9.5)이되, 사용자의 설문 답변에 따라 강력하게 보정한다.
    let baseScore = 3.0 + rand() * 6.5; 
    
    // 답변 기반 알고리즘 보정 (신뢰도 향상)
    const pain = answers.biggestPain;
    const visitors = answers.monthlyVisitors;

    if (tpl.id === 'seo_infra') {
      if (pain === 'no_visits') baseScore = 2.0 + rand() * 2.5; // 유입이 없으면 SEO 무조건 낮음 (2.0~4.5)
      else if (visitors === 'over_10000' || visitors === '1000_10000') baseScore = 7.0 + rand() * 2.5;
    }
    
    if (tpl.id === 'pricing_ltv') {
      if (pain === 'no_repurchase') baseScore = 2.0 + rand() * 2.5; // 재구매 없으면 LTV 설계 결함
    }

    if (['challenge_funnel', 'results_in_advance', 'sideways'].includes(tpl.id)) {
      if (pain === 'visits_no_purchase') baseScore = 2.5 + rand() * 3.0; // 트래픽 대비 전환 안되면 설득 퍼널 결함
    }

    if (['preeminence', 'emotional_momentum'].includes(tpl.id)) {
      if (visitors === 'under_100') baseScore = 2.5 + rand() * 3.0; // 트래픽 적으면 사회적 증거(숫자) 부족할 확률 큼
    }

    if (tpl.id === 'positioning' || tpl.id === 'value_ladder') {
      if (pain === 'unknown') baseScore = 3.5 + rand() * 3.0; // 원인을 모르면 대개 오퍼와 포지셔닝이 불명확함
    }

    // 최종 점수 바운딩 및 소수점 1자리 반올림
    const score = Math.round(Math.max(1.5, Math.min(9.8, baseScore)) * 10) / 10;

    const tier = score >= 6.5 ? tpl.high : tpl.low;
    const narrative = FRAMEWORK_NARRATIVES[tpl.id];
    const isStrength = score >= 7.5;
    return {
      id: tpl.id,
      name: tpl.name,
      koreanName: tpl.koreanName,
      score,
      free: idx < 3,
      currentState: tier.currentState.replace(/{domain}/g, domain),
      evidence: tpl.evidence,
      flaw: tier.flaw.replace(/{domain}/g, domain),
      fixPrompt: buildFixPrompt(tier, domain, tpl.koreanName),
      technique: narrative.technique,
      narrative: isStrength ? narrative.praise : narrative.risk,
      isStrength,
      promptCategory: narrative.promptCategory,
    };
  });

  const overallScore = Math.round(
    (frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length) * 10
  );
  const grade = gradeFromScore(overallScore);

  const weakest = [...frameworks].sort((a, b) => a.score - b.score)[0];
  const oneLiner = `가장 치명적인 병목은 '${weakest.koreanName}'입니다. ${weakest.flaw}`;

  const bucket = TRAFFIC_BUCKETS[answers.monthlyVisitors] || TRAFFIC_BUCKETS['100_1000'];
  const bounce = Math.round(bucket.bounce[0] + rand() * (bucket.bounce[1] - bucket.bounce[0]));
  const sessionSec = Math.round(bucket.session[0] + rand() * (bucket.session[1] - bucket.session[0]));

  const traffic: TrafficSnapshot = {
    isEstimate: true,
    monthlyVisitors: bucket.visitors,
    bounceRate: `약 ${bounce}% (추정치)`,
    avgSessionTime: `약 ${sessionSec}초 (추정치)`,
    insight: PAIN_INSIGHT[answers.biggestPain] || PAIN_INSIGHT.unknown,
  };

  return { domain, overallScore, grade, oneLiner, traffic, frameworks };
}

export function labelFor(options: QuestionOption[], value: string): string {
  return options.find((o) => o.value === value)?.label || value;
}
