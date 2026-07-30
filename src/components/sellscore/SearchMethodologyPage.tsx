import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Section, Em } from './Section';
import { Icon, IconBadge } from './Icon';
import { useSeo } from '../../hooks/useSeo';

const SEARCH_AXES = [
  {
    title: 'SEO 기본 구조',
    desc: '검색 결과에 노출되기 위한 제목, 설명, 헤딩, 색인, 링크 구조를 확인합니다.',
    items: ['title/meta', 'H1/H2', 'sitemap', 'robots.txt'],
  },
  {
    title: 'AEO 답변 구조',
    desc: '질문형 검색과 AI 답변에서 바로 이해될 수 있도록 문답형 정보 구조를 봅니다.',
    items: ['FAQ', '명확한 답변', '요약 문장', '문단 구조'],
  },
  {
    title: 'GEO 신뢰 구조',
    desc: '생성형 AI가 참고하기 좋은 출처성, 전문성, 일관된 주제 신호를 점검합니다.',
    items: ['전문성', '출처성', '구조화 데이터', '브랜드 신호'],
  },
];

const PUBLIC_CHECKS = [
  '검색 봇이 읽을 수 있는 title/meta 구조',
  '페이지마다 하나의 명확한 H1과 정리된 H2 흐름',
  '이미지 alt, 영상 주변 텍스트, 콘텐츠 설명 신호',
  'sitemap.xml, robots.txt, canonical 기본 연결',
  '모바일 대응, 접근성, Core Web Vitals 실측 신호',
  'FAQ·Article·Breadcrumb 등 구조화 데이터 활용 여부',
];

const PRIVATE_SIGNALS = [
  '검색 신호와 세일즈 신호를 함께 해석하는 가중치',
  'SEO/AEO/GEO 항목 간 충돌을 보정하는 우선순위 모델',
  '업종·목적·고객 유형에 따라 감점 해석을 바꾸는 내부 기준',
  'AI 수정 지시문으로 바꾸기 위한 문장 변환 로직',
];

const STANDARDS = [
  {
    name: 'Google Search Central',
    desc: '크롤링, 색인, 제목, 링크, 구조화 데이터의 기본 기준을 참고합니다.',
    url: 'https://developers.google.com/search/docs',
  },
  {
    name: '네이버 서치어드바이저',
    desc: '한국 검색 환경에서 수집·노출·사이트 구조 기준을 확인합니다.',
    url: 'https://searchadvisor.naver.com/',
  },
  {
    name: 'Bing Webmaster Guidelines',
    desc: '빙 검색과 AI 검색 환경에서 필요한 품질·접근성 신호를 참고합니다.',
    url: 'https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a',
  },
];

const PROCESS = [
  ['1', '봇 접근성 확인', '검색 봇이 페이지를 발견하고 읽을 수 있는 기본 상태인지 확인합니다.'],
  ['2', '검색 문맥 해석', '제목, 설명, 헤딩, 본문이 어떤 검색 의도를 가리키는지 분석합니다.'],
  ['3', '답변 가능성 평가', '질문형 검색과 AI 답변에 쓰일 만큼 정보가 명확한지 봅니다.'],
  ['4', '전환 구조 결합', '검색 유입 이후 고객이 행동으로 이어질 수 있는 세일즈 구조와 함께 해석합니다.'],
];


const PLATFORM_SIGNALS = [
  {
    platform: 'Google 검색 최적화',
    desc: 'Google Search Central의 기본 원칙을 바탕으로 검색 봇이 페이지를 발견, 크롤링, 색인, 이해할 수 있는지 봅니다.',
    checks: ['크롤링 가능성', '색인 가능성', 'title/meta', '모바일 사용성', 'Core Web Vitals', '이미지·동영상 검색 신호'],
  },
  {
    platform: 'Naver 사이트 최적화',
    desc: '네이버 서치어드바이저의 사이트 진단 관점처럼 사이트 제목, 설명문, robots.txt, HTML 마크업, 검색 반영 상태를 확인합니다.',
    checks: ['사이트 제목', '설명문', 'robots.txt', 'HTML 마크업', '검색 수집 상태', '네이버 소유확인'],
  },
  {
    platform: 'Bing·AI 검색 최적화',
    desc: 'Bing Webmaster Guidelines와 AI 검색 환경을 고려해 접근성, 명확한 정보 구조, 신뢰 가능한 출처 신호를 함께 봅니다.',
    checks: ['접근성', '명확한 본문', '내부 링크', '구조화 데이터', '브랜드 신뢰', 'AI 답변 적합성'],
  },
];

const CONTENT_ASSETS = [
  {
    label: '사이트 구조',
    public: ['sitemap.xml', 'robots.txt', 'canonical', '내부링크', '모바일 구조'],
    private: '페이지 중요도와 전환 흐름을 함께 보는 내부 우선순위 보정',
  },
  {
    label: '텍스트 콘텐츠',
    public: ['title', 'meta description', 'H1/H2', '본문 분량', 'FAQ 답변 구조'],
    private: '검색 의도와 구매전환 문맥을 동시에 해석하는 문장 평가 로직',
  },
  {
    label: '이미지 최적화',
    public: ['alt 텍스트', '파일명', '주변 문맥', '이미지 크기', 'OG 이미지'],
    private: '이미지가 검색 신호와 설득 신뢰 신호에 기여하는 정도의 가중치',
  },
  {
    label: '동영상 최적화',
    public: ['영상 주변 설명', '썸네일', '안정적인 URL', 'VideoObject', '전용 시청 페이지'],
    private: '영상이 단순 장식인지 전환 설득 자산인지 구분하는 내부 판단 기준',
  },
];


const SEO_CHECKLIST_ROWS = [
  { name: 'title/meta', focus: '검색 결과에서 페이지 주제와 클릭 이유가 명확한지 봅니다.', weight: 95 },
  { name: 'H1/H2 구조', focus: '검색 봇과 사람이 한눈에 이해하는 제목 계층인지 확인합니다.', weight: 90 },
  { name: '본문 텍스트 충분성', focus: '검색 의도에 답할 만큼 정보량과 문단 구조가 있는지 봅니다.', weight: 88 },
  { name: '내부링크 구조', focus: '중요한 페이지가 고립되지 않고 자연스럽게 연결되는지 확인합니다.', weight: 84 },
  { name: 'sitemap.xml / robots.txt', focus: '수집 허용과 URL 발견 경로가 정리되어 있는지 점검합니다.', weight: 86 },
  { name: 'canonical / URL 구조', focus: '중복 페이지와 대표 URL 신호가 정리되어 있는지 봅니다.', weight: 82 },
  { name: '이미지 alt / 파일명', focus: '이미지가 장식이 아니라 검색 문맥 자산으로 읽히는지 확인합니다.', weight: 76 },
  { name: '동영상 설명 / 썸네일', focus: '영상 주변 텍스트와 썸네일이 검색 신호를 주는지 봅니다.', weight: 74 },
  { name: '구조화 데이터', focus: 'FAQ, Article, Breadcrumb, Organization 신호가 실제 내용과 맞는지 점검합니다.', weight: 80 },
  { name: '모바일 / Core Web Vitals', focus: '모바일 화면과 로딩 경험이 검색 품질 기준을 해치지 않는지 확인합니다.', weight: 78 },
  { name: '네이버 소유확인 / 검색 수집', focus: '한국 검색 환경에서 네이버가 사이트를 확인하고 수집할 수 있는지 봅니다.', weight: 72 },
  { name: 'AEO/GEO 답변 적합성', focus: 'AI 답변에 인용될 만큼 문답 구조와 신뢰 신호가 명확한지 확인합니다.', weight: 85 },
];

const SEGMENT_COLORS = ['#0064ff', '#5b9bff', '#7bd6ff', '#a389ff', '#00c2a8'];

export function SearchMethodologyPage() {
  useSeo({
    title: 'SEO AEO GEO 검색 최적화 원리 — 검색 봇과 AI가 읽는 구조 | 세일즈스코어',
    description:
      '세일즈스코어가 SEO, AEO, GEO 관점에서 사이트 검색 최적화 점수를 계산하는 방식입니다. 공개 기준과 내부 알고리즘 범위를 분리해 설명합니다.',
    path: '/seo-aeo-geo',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'SEO AEO GEO 검색 최적화 원리',
      description:
        '세일즈스코어가 검색 봇과 AI 답변 엔진이 이해할 수 있는 사이트 구조를 어떻게 평가하는지 설명합니다.',
      author: { '@type': 'Organization', name: '세일즈스코어' },
    },
  });

  return (
    <main className="bg-black text-white overflow-hidden">
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 pt-14 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_58%_42%_at_50%_18%,rgba(0,100,255,0.22),transparent_72%),radial-gradient(ellipse_42%_35%_at_82%_70%,rgba(123,214,255,0.1),transparent_70%)]" />
        <motion.div
          className="relative z-10 w-full max-w-3xl"
          initial={{ opacity: 0, y: 52 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[#7bd6ff]/75 text-[13px] tracking-[0.24em] font-extrabold mb-5 uppercase">
            SEO · AEO · GEO
          </p>
          <h1
            className="text-white font-black tracking-tight leading-[1.13] mb-5 text-balance"
            style={{ fontSize: 'clamp(32px, 6.8vw, 66px)' }}
          >
            검색 봇에게는 발견되고,
            <span className="block gradient-text-static">AI에게는 인용되는 구조</span>
          </h1>
          <p className="text-[#86868b] text-[14px] sm:text-[19px] leading-[1.32] sm:leading-[1.5] max-w-2xl mx-auto font-medium mb-9 text-balance">
            사람은 사이트를 보고 판단하지만, 검색 포털과 AI 답변 엔진은 먼저 구조를 읽습니다.
            Salesscore는 <Em>SEO·AEO·GEO 검색 최적화</Em> 관점으로 사이트가 발견되고 이해될 수 있는지 점수화합니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-9">
            {['검색 노출 구조', 'AI 답변 구조', '비공개 가중치 엔진'].map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-white/65 text-[12px] font-bold">
                {item}
              </span>
            ))}
          </div>
          <Link
            to="/diagnose"
            className="inline-flex h-14 px-9 rounded-full bg-[#0064ff] text-white font-bold items-center justify-center no-underline hover:brightness-110"
          >
            내 사이트 검색 점수 확인하기 →
          </Link>
        </motion.div>
      </section>

      <Section
        tossMotion
        eyebrow="검색 최적화 원리"
        heading={
          <>
            봇이 이해해야 <span className="gradient-text-static">사람에게 노출됩니다</span>
          </>
        }
        sub={
          <>
            좋은 디자인만으로는 부족합니다. 제목, 설명, 헤딩, 링크, 이미지, 구조화 데이터가 정리되어야
            검색 포털과 AI가 이 페이지를 어떤 주제의 답으로 볼지 판단할 수 있습니다.
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {SEARCH_AXES.map((axis, i) => (
            <motion.div
              key={axis.title}
              className="rounded-3xl border border-white/[0.14] bg-white/[0.035] p-6 text-left"
              initial={{ opacity: 0, y: 40, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <IconBadge name={i === 0 ? 'search' : i === 1 ? 'spark' : 'shield'} tint="blue" />
              <p className="text-white font-bold text-[20px] mt-5 mb-2 tracking-tight">{axis.title}</p>
              <p className="text-[#86868b] text-[14px] sm:text-[15px] leading-relaxed font-medium mb-5">{axis.desc}</p>
              <div className="flex flex-wrap gap-2">
                {axis.items.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-white/65 text-[12px] font-semibold">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section
        tossMotion
        eyebrow="공식 플랫폼 기준"
        heading={
          <>
            구글·네이버·빙은 <span className="gradient-text-static">보는 지점이 다릅니다</span>
          </>
        }
        sub={
          <>
            Salesscore는 하나의 SEO 체크리스트만 보지 않습니다. Google, Naver, Bing의 공개 기준을 나눠 보고,
            한국 사이트 운영자가 실제로 놓치기 쉬운 검색 신호를 함께 정리합니다.
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {PLATFORM_SIGNALS.map((signal, i) => (
            <motion.div
              key={signal.platform}
              className="rounded-3xl border border-white/[0.14] bg-white/[0.035] p-6 text-left"
              initial={{ opacity: 0, y: 40, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-white font-bold text-[20px] mb-3 tracking-tight">{signal.platform}</p>
              <p className="text-[#86868b] text-[14px] sm:text-[15px] leading-relaxed font-medium mb-5">{signal.desc}</p>
              <div className="flex flex-wrap gap-2">
                {signal.checks.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-white/65 text-[12px] font-semibold">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section
        tossMotion
        eyebrow="콘텐츠 자산 최적화"
        heading={
          <>
            텍스트·이미지·동영상까지
            <span className="block gradient-text-static">검색 자산으로 평가합니다</span>
          </>
        }
        sub={
          <>
            검색 최적화는 코드만 보는 일이 아닙니다. 사이트 구조, 텍스트, 이미지, 동영상이 검색 봇과 AI 답변 엔진에게
            어떤 의미로 읽히는지 함께 봐야 합니다.
          </>
        }
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CONTENT_ASSETS.map((asset, i) => (
            <motion.div
              key={asset.label}
              className="rounded-3xl border border-white/[0.14] bg-white/[0.035] p-6 text-left"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-white text-[20px] font-bold mb-4">{asset.label}</p>
              <p className="text-[#7bd6ff] text-[12px] font-black tracking-[0.14em] mb-3">공개 점검 항목</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {asset.public.map((item) => (
                  <span key={item} className="rounded-full border border-[#7bd6ff]/20 bg-[#0064ff]/[0.06] px-3 py-1.5 text-white/70 text-[12px] font-semibold">
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-white/45 text-[12px] font-black tracking-[0.14em] mb-2">내부 기술</p>
              <p className="text-white/62 text-[14px] leading-relaxed font-medium">{asset.private}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section
        tossMotion
        eyebrow="SEO 체크리스트"
        heading={
          <>
            검색 최적화 항목마다 <span className="gradient-text-static">확인하는 기준</span>이 다릅니다
          </>
        }
        sub={
          <>
            공개 가능한 체크 항목은 표로 보여드립니다. 다만 항목 간 가중치와 감점 보정 방식은
            Salesscore Dual Engine™ 내부 로직으로 계산합니다.
          </>
        }
      >
        <div className="max-w-5xl mx-auto rounded-3xl border border-white/15 overflow-hidden bg-white/[0.02]">
          <div className="hidden md:grid grid-cols-[1.15fr_1.8fr_minmax(150px,0.9fr)] gap-4 px-6 py-4 bg-white/[0.06] text-white/50 text-[11px] font-semibold tracking-[0.08em] uppercase divide-x divide-white/10">
            <span>SEO 체크리스트</span>
            <span className="pl-4">측정 초점</span>
            <span className="text-right pl-4">중요도</span>
          </div>
          {SEO_CHECKLIST_ROWS.map((row, i) => (
            <motion.div
              key={row.name}
              className="grid grid-cols-1 md:grid-cols-[1.15fr_1.8fr_minmax(150px,0.9fr)] gap-3 md:gap-0 px-4 sm:px-6 py-5 border-t border-white/15 md:divide-x md:divide-white/10 items-stretch"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
            >
              <div className="flex items-center gap-2.5 md:px-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                />
                <span className="text-white text-[14px] font-bold leading-snug">{row.name}</span>
              </div>
              <div className="text-white/60 text-[13px] leading-relaxed md:px-4 flex items-start md:items-center">
                {row.focus}
              </div>
              <div className="flex flex-col gap-2 md:items-end md:px-4">
                <div className="flex items-center justify-between md:justify-end gap-3 w-full">
                  <span className="text-white/45 text-[11px] font-semibold uppercase tracking-[0.08em] md:hidden">
                    중요도
                  </span>
                  <span className="text-white/75 text-[12px] font-bold tabular-nums">{row.weight}%</span>
                </div>
                <span className="w-full md:w-32 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${row.weight}%`,
                      background: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                    }}
                  />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section
        tossMotion
        eyebrow="Salescore Dual Engine™"
        heading={
          <>
            일부 기준은 공개하고,
            <span className="block gradient-text-static">핵심 알고리즘은 보호합니다</span>
          </>
        }
        sub={
          <>
            Salesscore는 공개 가이드만 나열하는 도구가 아닙니다. 공식 기준으로 확인 가능한 항목은 공개하고,
            신호를 결합해 우선순위를 만드는 내부 로직은 비공개로 유지합니다.
          </>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl mx-auto">
          <div className="rounded-3xl border border-[#7bd6ff]/30 bg-[#0064ff]/[0.05] p-6 sm:p-8 text-left">
            <p className="text-[#7bd6ff] text-[12px] font-black tracking-[0.18em] mb-5">공개하는 기준</p>
            <ul className="grid gap-3">
              {PUBLIC_CHECKS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/78 text-[14px] sm:text-[15px] font-semibold leading-relaxed">
                  <Icon name="check" size={15} className="text-[#7bd6ff] mt-1 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8 text-left">
            <p className="text-white/55 text-[12px] font-black tracking-[0.18em] mb-5">비공개 내부 기술</p>
            <ul className="grid gap-3">
              {PRIVATE_SIGNALS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/64 text-[14px] sm:text-[15px] font-semibold leading-relaxed">
                  <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-white/35 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section
        tossMotion
        eyebrow="공식 기준"
        heading={
          <>
            검색 최적화는 <span className="gradient-text-static">감이 아니라 기준</span>입니다
          </>
        }
        sub={
          <>
            Google, 네이버, Bing이 공개한 검색 문서의 큰 원칙을 참고합니다. 단, 세부 배점과 결합 방식은
            Salesscore Dual Engine™의 내부 모델로 계산합니다.
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {STANDARDS.map((standard, i) => (
            <motion.a
              key={standard.name}
              href={standard.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-3xl border border-white/[0.14] bg-white/[0.03] p-6 text-left no-underline hover:border-white/25 transition-colors"
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-white font-bold text-[18px] mb-2 tracking-tight">{standard.name}</p>
              <p className="text-[#86868b] text-[14px] leading-relaxed font-medium">{standard.desc}</p>
            </motion.a>
          ))}
        </div>
      </Section>

      <Section
        tossMotion
        eyebrow="진단 흐름"
        heading={
          <>
            검색 점수는 <span className="gradient-text-static">4단계</span>로 해석합니다
          </>
        }
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROCESS.map(([num, title, desc], i) => (
            <motion.div
              key={title}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-left"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[#7bd6ff] text-[13px] font-black mb-5">STEP {num}</p>
              <p className="text-white text-[20px] font-bold mb-3">{title}</p>
              <p className="text-white/55 text-[14px] leading-relaxed font-medium">{desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <section className="relative px-6 py-28 sm:py-36 text-center overflow-hidden">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2
            className="text-white font-bold tracking-tight leading-[1.12] mb-6"
            style={{ fontSize: 'clamp(26px, 5vw, 44px)' }}
          >
            검색에 발견되고,
            <span className="block gradient-text-static">고객에게 설득되는지 확인하세요</span>
          </h2>
          <p className="text-[#86868b] text-[17px] sm:text-[19px] leading-[1.55] max-w-lg mx-auto mb-9 font-medium">
            SEO/AEO/GEO 구조와 세일즈 전환 구조를 따로 보지 않고 함께 진단합니다.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/diagnose" className="inline-flex h-14 px-9 rounded-full bg-[#0064ff] text-white font-bold items-center justify-center no-underline">
              무료로 검색 점수 확인하기 →
            </Link>
            <Link to="/methodology" className="inline-flex h-14 px-9 rounded-full border border-white/15 text-white/80 font-bold items-center justify-center no-underline">
              설득 채점 원리 보기
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
