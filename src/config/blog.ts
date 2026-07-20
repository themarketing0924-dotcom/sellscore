// ============================================================
// 블로그 카테고리 & 포스트 목록
// ============================================================
// 검색 SEO 유입을 위한 콘텐츠 구조. 실제 본문이 작성된 글은
// hasArticle: true 로 표시하고 /blog/[slug] 로 연결한다.
// 나머지는 목록에 노출은 되지만 "곧 공개"로 표시해 죽은 링크를 만들지 않는다.
// ============================================================

export interface BlogCategory {
  id: string;
  label: string;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: 'all', label: '전체' },
  { id: 'side-hustle', label: '온라인 부업 · 재테크' },
  { id: 'landing-diagnosis', label: '랜딩페이지 진단' },
  { id: 'copywriting', label: '카피라이팅' },
  { id: 'conversion', label: '전환율 개선' },
  { id: 'design', label: '디자인 구조' },
  { id: 'seo', label: 'SEO / AEO' },
  { id: 'case-study', label: '사례 분석' },
  { id: 'benchmark', label: '업종별 벤치마크' },
];

// ── 아티클 본문 구조 ──
// 글마다 이 구조로 데이터만 채우면 BlogPostPage가 자동으로 렌더링한다
// (배너·요약박스·목차·체크리스트·FAQ·CTA·관련글은 공용, 본문만 글마다 다름).
// body 문단 안에서 **강조할 구절**은 굵게 렌더링된다.

export interface BlogSectionVisual {
  /** table: 비교표 / bars: 막대그래프(수평) — 둘 다 이미지 파일 없이 데이터로 렌더링한다 */
  kind: 'table' | 'bars';
  caption?: string;
  table?: { headers: string[]; rows: string[][] };
  bars?: { label: string; value: number; valueLabel?: string }[]; // value: 0~100
}

export interface BlogSection {
  id: string;
  heading: string;
  body: string[];
  visual?: BlogSectionVisual;
}

export interface BlogPost {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  hasArticle?: boolean;
  /** AEO(답변엔진 최적화)용 핵심 요약 박스 불릿 */
  summary?: string[];
  sections?: BlogSection[];
  checklist?: string[];
  faq?: { q: string; a: string }[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'side-hustle-site-no-sales',
    category: 'side-hustle',
    title: '온라인 부업 사이트, 방문자는 있는데 왜 수익이 안 날까?',
    excerpt: '퇴근 후 부업으로 시작한 사이트에 트래픽은 들어오는데 매출로 안 이어지는 5가지 이유와 점검 체크리스트.',
    date: '2026-07-08',
    readMinutes: 7,
    hasArticle: true,
    summary: [
      '트래픽과 전환은 별개의 문제입니다.',
      '매출이 안 나는 이유는 대부분 오퍼·신뢰·결제 단계 셋 중 하나입니다.',
      '어디가 문제인지는 사이트를 진단해보면 10초 안에 알 수 있습니다.',
    ],
    sections: [
      {
        id: 'why',
        heading: '왜 방문은 있는데 수익이 없을까',
        body: [
          '온라인 부업으로 사이트나 스마트스토어, 블로그를 운영하시는 분들이 가장 많이 하는 착각이 "트래픽만 늘리면 매출도 따라온다"는 것입니다. 하지만 방문자 수와 전환율은 완전히 다른 지표입니다. 사람들이 들어오긴 하는데 사지 않는다면, 문제는 유입이 아니라 **페이지 안에서 설득이 끊기는 지점**에 있습니다.',
        ],
        visual: {
          kind: 'bars',
          caption: '방문자 100명 중 실제로 결제까지 가는 비율 — 단계별 이탈',
          bars: [
            { label: '방문', value: 100, valueLabel: '100명' },
            { label: '상품/오퍼 확인', value: 62, valueLabel: '62명' },
            { label: '신뢰 신호 확인', value: 31, valueLabel: '31명' },
            { label: '결제 시도', value: 9, valueLabel: '9명' },
            { label: '결제 완료', value: 3, valueLabel: '3명' },
          ],
        },
      },
      {
        id: 'reason-1',
        heading: '1. 오퍼가 명확하지 않다',
        body: [
          '"이걸 사면 정확히 무엇을 얻는지"가 3초 안에 전달되지 않으면 방문자는 그대로 이탈합니다. 특히 부업으로 시작한 사이트는 상품 설명에 공을 들이는 대신, 정작 가장 중요한 "왜 지금 이걸 사야 하는지"는 비어있는 경우가 많습니다.',
        ],
      },
      {
        id: 'reason-2',
        heading: '2. 신뢰 신호가 없다',
        body: [
          '후기, 실적, 환불 보장 같은 신뢰 신호가 없으면 아무리 좋은 상품이라도 결제 직전에 망설이게 됩니다. 특히 개인이 운영하는 부업 사이트는 브랜드 신뢰가 낮기 때문에 이 부분을 더 신경 써야 합니다.',
        ],
      },
      {
        id: 'reason-3',
        heading: '3. 결제 단계가 복잡하다',
        body: [
          '결제 버튼을 누르기까지 클릭이 많거나, 회원가입을 먼저 요구하면 그 사이에 방문자는 이탈합니다. 결제까지 가는 경로는 짧고 단순할수록 좋습니다.',
        ],
      },
    ],
    checklist: [
      '헤드라인만 보고 3초 안에 "뭘 파는지" 알 수 있는가',
      '후기나 실적 같은 신뢰 신호가 CTA 근처에 있는가',
      '결제까지 3클릭 이내로 끝나는가',
      '가격이 비교 기준(앵커) 없이 단독으로만 표시되어 있진 않은가',
    ],
    faq: [
      {
        q: '방문자는 늘었는데 왜 매출은 그대로일까요?',
        a: '트래픽과 전환은 완전히 다른 문제입니다. 유입 채널을 아무리 늘려도 페이지 안에서 설득이 끊기면 매출로 이어지지 않습니다.',
      },
      {
        q: '부업 사이트도 진단이 필요한가요?',
        a: '네. 오히려 예산과 시간이 적은 부업일수록 어디를 먼저 고쳐야 하는지 우선순위를 아는 게 더 중요합니다.',
      },
      {
        q: '지금 바로 확인할 수 있는 방법이 있나요?',
        a: '세일즈스코어에 URL을 입력하면 10초 안에 설득 전환 지수와 병목 지점을 확인할 수 있습니다.',
      },
    ],
  },
  {
    slug: 'side-hustle-first-3-months',
    category: 'side-hustle',
    title: '온라인 부업 시작 전 3개월, 사이트보다 먼저 봐야 할 것들',
    excerpt: '재테크·부업 사이트를 만들기 전에 먼저 점검해야 하는 시장성과 오퍼 구조.',
    date: '2026-07-02',
    readMinutes: 6,
  },
  {
    slug: 'landing-first-3-seconds',
    category: 'landing-diagnosis',
    title: '랜딩페이지 첫 화면에서 이탈이 나는 진짜 이유',
    excerpt: '3초 안에 방문자가 떠나는 랜딩페이지의 공통점과 above-the-fold 점검법.',
    date: '2026-06-28',
    readMinutes: 5,
  },
  {
    slug: 'cta-not-clicked',
    category: 'copywriting',
    title: 'CTA 버튼이 안 눌리는 이유, 문구보다 위치가 먼저다',
    excerpt: '카피를 아무리 바꿔도 클릭이 안 늘어난다면 버튼 문구가 아니라 배치를 의심해야 합니다.',
    date: '2026-06-20',
    readMinutes: 6,
  },
  {
    slug: 'risk-reversal-copy',
    category: 'copywriting',
    title: '리스크 리버설 문구, 이렇게 쓰면 결제 직전 이탈이 줄어든다',
    excerpt: '환불 보장·무료 체험 문구를 어디에, 어떻게 배치해야 실제로 효과가 있는지.',
    date: '2026-06-14',
    readMinutes: 5,
  },
  {
    slug: 'conversion-price-display',
    category: 'conversion',
    title: '가격 표시 방식만 바꿔도 전환율이 오르는 이유',
    excerpt: '단일 가격 vs 3단 비교 가격, 앵커링 효과를 실제 사이트에 적용하는 법.',
    date: '2026-06-08',
    readMinutes: 6,
  },
  {
    slug: 'design-above-the-fold',
    category: 'design',
    title: 'above-the-fold, 얼마나 비워야 할까',
    excerpt: '첫 화면에 정보를 얼마나 담아야 이탈을 줄이면서도 필요한 정보를 전달할 수 있는지.',
    date: '2026-06-01',
    readMinutes: 5,
  },
  {
    slug: 'seo-title-meta-2026',
    category: 'seo',
    title: '2026년 검색에 걸리는 title·meta 작성법',
    excerpt: 'Google Search Essentials 기준으로 다시 정리하는 title, meta description 작성 원칙.',
    date: '2026-05-24',
    readMinutes: 7,
  },
  {
    slug: 'aeo-faq-schema',
    category: 'seo',
    title: 'AI 검색에 노출되는 FAQ 구조화 데이터 넣는 법',
    excerpt: 'ChatGPT, Perplexity 같은 AI 검색에서 인용되기 쉬운 FAQPage 스키마 작성법.',
    date: '2026-05-18',
    readMinutes: 6,
  },
  {
    slug: 'case-study-before-after',
    category: 'case-study',
    title: '사례: 설득 전환 지수 47점 → 79점, 무엇을 바꿨나',
    excerpt: '실제 진단 후 개선한 사이트의 Before/After 비교와 재진단 결과.',
    date: '2026-05-10',
    readMinutes: 8,
  },
  {
    slug: 'benchmark-ecommerce',
    category: 'benchmark',
    title: '이커머스 업종 평균 설득 전환 지수는 몇 점일까',
    excerpt: '업종별 평균 점수 벤치마크와 우리 사이트가 어디쯤 있는지 가늠하는 법.',
    date: '2026-05-02',
    readMinutes: 5,
  },
  {
    slug: 'benchmark-coaching',
    category: 'benchmark',
    title: '강의·코칭 업종, 어떤 프레임워크에서 가장 많이 감점될까',
    excerpt: '강의·코칭 사이트에서 반복적으로 낮게 나오는 프레임워크 top 3.',
    date: '2026-04-26',
    readMinutes: 5,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function categoryLabel(id: string): string {
  return BLOG_CATEGORIES.find((c) => c.id === id)?.label || id;
}

// 작성자 정보 — neilpatel.com처럼 카드/아티클에 작성자 배지를 노출하기 위한 공용 프로필
export const BLOG_AUTHOR = {
  name: '세일즈스코어팀',
  role: '전환율 데이터 분석',
  initials: 'S',
};

// BLOG_POSTS는 date 기준 최신순으로 정렬되어 있으므로, 앞의 N개를 "NEW"로 표시한다.
const NEW_COUNT = 2;
export function isNewPost(slug: string): boolean {
  return BLOG_POSTS.slice(0, NEW_COUNT).some((p) => p.slug === slug);
}
