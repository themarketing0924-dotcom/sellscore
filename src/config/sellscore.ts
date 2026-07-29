// ============================================================
// 세일즈스코어 — 브랜드/질문/가격 설정
// ============================================================

export const BRAND = {
  name: '세일즈스코어',
  nameEn: 'Salesscore',
  tagline: '당신 사이트, 팔리는 구조입니까?',
  subTagline: '1분 안에 설득 전환 지수를 확인하세요',
  ctaLabel: '무료로 진단받기',
  footerNote: '이 진단은 AI 기반 참고 자료이며, 실제 전환율은 다양한 요인에 영향을 받습니다.',
};

export const TRUST_BADGES = [
  'WCAG 2.2 주요 접근성 항목 참고',
  'Google Search Essentials 주요 원칙 참고',
  '네이버 서치어드바이저 공개 가이드 참고',
];

// ── 질문 흐름 ──

export interface QuestionOption {
  value: string;
  label: string;
}

export interface QuestionDef {
  id: string;
  title: string;
  emoji: string;
  options: QuestionOption[];
}

export const QUESTIONS: QuestionDef[] = [
  {
    id: 'siteOwner',
    title: '이 사이트는 어떤 관계인가요?',
    emoji: '🤝',
    options: [
      { value: 'own_business', label: '제가 직접 운영하는 사업이에요' },
      { value: 'client_business', label: '제가 만들어드린 고객(의뢰인)의 사업이에요' },
      { value: 'pre_launch', label: '예비 창업 — 제 사업이 될 예정이에요' },
      { value: 'other', label: '취미·학습·비영리 등 그 외' },
    ],
  },
  {
    id: 'sitePurpose',
    title: '이 사이트의 목적은 무엇인가요?',
    emoji: '🎯',
    options: [
      { value: 'instant_sale', label: '즉시 판매' },
      { value: 'lead_gen', label: '리드 수집' },
      { value: 'subscription', label: '구독 전환' },
      { value: 'booking', label: '예약 상담' },
    ],
  },
  {
    id: 'targetCustomer',
    title: '타겟 고객은 누구인가요?',
    emoji: '👥',
    options: [
      { value: 'b2c_low', label: 'B2C 저가' },
      { value: 'b2c_high', label: 'B2C 고가' },
      { value: 'b2b', label: 'B2B' },
      { value: 'solo_founder', label: '1인 창업가 대상' },
    ],
  },
  {
    id: 'monthlyVisitors',
    title: '현재 이 사이트로 월 방문자는 어느 정도인가요?',
    emoji: '📊',
    options: [
      { value: 'under_100', label: '100명 미만' },
      { value: '100_1000', label: '100~1,000명' },
      { value: '1000_10000', label: '1,000~1만 명' },
      { value: 'over_10000', label: '1만 명 이상' },
    ],
  },
  {
    id: 'biggestPain',
    title: '지금 가장 답답한 점은 무엇인가요?',
    emoji: '😩',
    options: [
      { value: 'visits_no_purchase', label: '방문은 있는데 구매가 없다' },
      { value: 'no_visits', label: '방문 자체가 없다' },
      { value: 'no_repurchase', label: '구매는 있는데 재구매가 없다' },
      { value: 'unknown', label: '뭐가 문제인지 모르겠다' },
    ],
  },
];

export const QUESTION_LABELS: Record<string, Record<string, string>> = QUESTIONS.reduce(
  (acc, q) => {
    acc[q.id] = q.options.reduce((o, opt) => {
      o[opt.value] = opt.label;
      return o;
    }, {} as Record<string, string>);
    return acc;
  },
  {} as Record<string, Record<string, string>>
);

// ── 로딩 화면에 스쳐가는 프레임워크 이름 ──

export const LOADING_FRAMEWORK_NAMES = [
  '권위 포지셔닝 및 리스크 리버설',
  '가치 사다리 및 후크-스토리-오퍼',
  '우회형 세일즈 레터',
  '매력적 포지셔닝 및 다이렉트 리스폰스 카피',
  '선(先) 결과 제공 전략',
  '어텐션 이코노미 및 콘텐츠 리듬',
  'SEO 및 트래픽 인프라',
  '감정 모멘텀 및 스케일 프레이밍',
  '챌린지 퍼널 및 긴급성 설계',
  '가격 구조 및 LTV 설계',
  '채널 전략 진단',
  '전문가 신뢰 자산화',
];

// ── 12명 마케팅 거장 (실제 책·매출로 검증된 인물만, 방법론 페이지 소개용) ──

export interface MarketingMaster {
  frameworkId: string;
  name: string;
  theory: string;
  book?: string;
}

export const MARKETING_MASTERS: MarketingMaster[] = [
  {
    frameworkId: 'preeminence',
    name: '제이 에이브러햄',
    theory: 'Preeminence — 판매자가 아니라 "믿을 수 있는 조언자" 위치를 먼저 점유하는 관점 전환',
  },
  {
    frameworkId: 'value_ladder',
    name: '러셀 브런슨',
    theory: '무료→저가→중가→고가로 이어지는 계단형 오퍼. 매 단계마다 훅·스토리·제안 3요소 반복',
    book: 'DotCom Secrets',
  },
  {
    frameworkId: 'sideways',
    name: '게리 할버트',
    theory: '카피보다 타깃 선정이 먼저 — 가장 배고픈 군중(가장 절실한 고객)을 찾는 게 스토리보다 우선',
    book: 'The Boron Letters',
  },
  {
    frameworkId: 'positioning',
    name: '댄 케네디',
    theory: '특정 타깃에게만 말을 거는 정밀 타겟팅 + 위험을 판매자가 대신 지는 역보증 구조',
    book: 'No B.S. Marketing',
  },
  {
    frameworkId: 'results_in_advance',
    name: '프랭크 컨',
    theory: '판매 전에 작은 실제 결과를 먼저 경험시켜 신뢰를 앞당기는 구조',
  },
  {
    frameworkId: 'attention_rhythm',
    name: '라이언 다이스',
    theory: '인지→참여→구독→전환→흥분→상승→옹호→추천, 낯선 사람을 팬으로 전환하는 8단계 지도',
  },
  {
    frameworkId: 'seo_infra',
    name: '닐 파텔',
    theory: '큰 주제의 필러 페이지와 세부 클러스터 콘텐츠를 내부링크로 연결해 검색 권위를 쌓는 구조',
  },
  {
    frameworkId: 'emotional_momentum',
    name: '로버트 치알디니',
    theory: '사람은 확신이 없을 때 타인의 행동을 보고 따라한다 — 숫자·후기·사용자 수가 많을수록 신뢰와 행동 전환이 커진다',
    book: 'Influence: The Psychology of Persuasion',
  },
  {
    frameworkId: 'challenge_funnel',
    name: '제프 워커',
    theory: '사전 콘텐츠로 신뢰를 단계적으로 쌓고, 한정된 판매창(오픈카트)을 여는 시간 압박 구조',
    book: 'Launch',
  },
  {
    frameworkId: 'pricing_ltv',
    name: '알렉스 하모지',
    theory: '가치 = (꿈의 결과 × 성공 확률) ÷ (시간지연 × 노력) — 가격이 아니라 이 4변수를 조정해 저항 없는 제안 설계',
    book: '$100M Offers',
  },
  {
    frameworkId: 'channel_strategy',
    name: '에벤 페이건',
    theory: '사업 단계에 따라 콜드·매스·추천·검색·1대1 중 맞는 채널을 먼저 진단',
  },
  {
    frameworkId: 'expert_authority',
    name: '브렌든 버처드',
    theory: '이미 가진 전문성을 콘텐츠로 체계화해, 팔 수 있는 신뢰 자산으로 만드는 구조',
  },
];

export const LOADING_MESSAGES = [
  '12명의 마케팅 대가가 당신의 사이트를 검토하고 있습니다...',
  '설득 전환 지수를 계산하는 중입니다...',
  '카피 / 디자인 / SEO 기준으로 대조하는 중입니다...',
];

// ── 가격 ──

// ── 재진단 무제한 기간 (일) — standard/pro 결제 시 해당 도메인에 적용 ──
// functions/src/index.ts의 REDIAGNOSIS_WINDOW_DAYS와 값을 반드시 맞출 것.
export const REDIAGNOSIS_WINDOW_DAYS: Record<string, number> = {
  'sellscore-standard': 30,
  'sellscore-pro': 90,
};

export const PRICING = {
  report: { id: 'sellscore-report', name: '세일즈스코어 라이트 리포트', price: 12900 },
  standard: { id: 'sellscore-standard', name: '세일즈스코어 전체 리포트 + 30일 무제한 재진단', price: 49000 },
  pro: { id: 'sellscore-pro', name: '세일즈스코어 프로 + 90일 무제한 재진단', price: 99000 },
};

export interface PricingTier {
  id: string;
  label: string;
  price: number;
  unit: string;
  description: string;
  features: string[];
  cta: 'free-start' | 'toss';
  popular?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: PRICING.report.id,
    label: '라이트',
    price: PRICING.report.price,
    unit: '1회',
    description: '지금 이 사이트가 왜 안 팔리는지 한 번만 확인하고 싶다면',
    features: [
      '12개 프레임워크 전체 Before/After 수정 지시문',
      '실행 우선순위 로드맵',
    ],
    cta: 'free-start',
  },
  {
    id: PRICING.standard.id,
    label: '추천',
    price: PRICING.standard.price,
    unit: '1회',
    description: '고치고, 다시 확인하고, 점수가 오를 때까지',
    features: [
      '12개 프레임워크 전체 Before/After 수정 지시문',
      '이 사이트 30일간 무제한 재진단',
      '수정 후 점수 변화 바로 확인',
    ],
    cta: 'toss',
    popular: true,
  },
  {
    id: PRICING.pro.id,
    label: '프로',
    price: PRICING.pro.price,
    unit: '1회',
    description: '여러 차례 다듬어서 확실하게 끝내고 싶다면',
    features: [
      '12개 프레임워크 전체 Before/After 수정 지시문',
      '이 사이트 90일간 무제한 재진단',
      '1:1 문의 우선 응답',
    ],
    cta: 'toss',
  },
];
