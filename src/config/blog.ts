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

export interface BlogPost {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  hasArticle?: boolean;
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
