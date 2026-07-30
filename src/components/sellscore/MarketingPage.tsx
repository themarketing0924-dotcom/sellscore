import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Icon, IconBadge } from './Icon';
import { VideoBackground } from './VideoBackground';
import { Section, HeadlineLine, Em, FaqAccordion } from './Section';
import { useSeo } from '../../hooks/useSeo';
import type { ComponentProps, ReactNode } from 'react';

type IconName = ComponentProps<typeof Icon>['name'];

interface MarketingPageProps {
  onStart: () => void;
}

const PAIN_POINTS: { icon: IconName; title: string; desc: ReactNode }[] = [
  {
    icon: 'target',
    title: '광고비는 쓰는데 결제가 일어나지 않습니다',
    desc: (
      <>
        트래픽은 늘었지만 <Em>고객이 어느 지점에서 이탈하는지</Em> 알 수 없습니다. 광고를 더
        집행하기 전에 사이트 안에서 매출이 새어나가는 지점부터 확인해야 합니다.
      </>
    ),
  },
  {
    icon: 'spark',
    title: 'AI로 사이트는 만들었는데, 그다음이 없습니다',
    desc: (
      <>
        Claude나 ChatGPT로 홈페이지를 만들었지만 실제 고객이 <Em>이해하고 신뢰하고 구매하는 구조인지</Em>는
        확인하기 어렵습니다. 보기 좋은 사이트와 실제로 팔리는 사이트는 다릅니다.
      </>
    ),
  },
  {
    icon: 'users',
    title: '고객사에 성과를 설명할 근거가 없습니다',
    desc: (
      <>
        홈페이지를 제작한 뒤 무엇이 개선됐는지 숫자와 객관적인 기준으로 설명하기 어렵습니다.
        Salesscore를 활용하면 <Em>진단 전후 점수와 수정 항목</Em>을 고객에게 명확하게 제시할 수 있습니다.
      </>
    ),
  },
  {
    icon: 'clock',
    title: '전문가에게 맡기기에는 비용과 시간이 부담됩니다',
    desc: (
      <>
        대행사나 컨설턴트에게 수백만 원을 지불하기 전에 무엇이 문제인지부터 확인할 수 있습니다.
        <Em>무엇을 요청해야 하는지</Em> 알고 맡기면 불필요한 수정 비용과 시간을 줄일 수 있습니다.
      </>
    ),
  },
];

const SCORE_AXES: {
  icon: IconName;
  title: string;
  desc: ReactNode;
  bullets: string[];
}[] = [
  {
    icon: 'search',
    title: '검색 최적화 점수',
    desc: (
      <>
        구글·네이버·AEO·GEO에서 <Em>검색 봇이 발견하고 이해할 수 있는 구조</Em>인지 봅니다.
        콘텐츠와 기술 요소를 함께 평가합니다.
      </>
    ),
    bullets: ['title/meta', 'H1/H2 구조', '이미지·영상 최적화', '색인/크롤링', '내부링크/구조화 데이터'],
  },
  {
    icon: 'chart',
    title: '세일즈 최적화 점수',
    desc: (
      <>
        클릭한 고객을 <Em>3초 안에 붙잡고</Em>, 신뢰를 만들고, 행동으로 이끄는 구조인지 봅니다.
      </>
    ),
    bullets: ['후킹력', '카피 구조', 'CTA 흐름', '신뢰 신호', '리드/구매 전환'],
  },
];

const PRICE_COMPARISON_ROWS = [
  {
    label: 'A사',
    service: 'SEO/AEO 전문 에이전시',
    type: '프로젝트 견적형',
    price: '약 210만~3,400만원+',
    scope: 'SEO·AEO 진단 + 구축 프로젝트',
    note: '공개 사례 190만~2,850만원 기준, 실제 견적 변동분 반영',
    features: ['전문가 분석·구축 중심', '수정 범위가 커질수록 비용 증가', '초기 상담부터 고비용'],
  },
  {
    label: 'B사',
    service: 'XEO·GEO 관리 서비스',
    type: '월 구독·대행형',
    price: '월 36만~240만원+',
    scope: 'XEO·GEO 운영·관리 중심',
    note: '공개가 월 30만·50만·200만원 기준, 운영 범위 확대분 반영',
    features: ['매월 비용 누적', '최소 3개월 이상 운영 전제', '분석보다 실행 대행 중심'],
  },
  {
    label: 'Salesscore',
    service: '세일즈스코어',
    type: '자동화 진단형',
    price: '12,900원부터',
    scope: '44개 항목 + AI 수정 지시문',
    note: '검색 최적화와 세일즈 전환 문제를 동시에 먼저 확인',
    features: ['44개 항목 자동 진단', 'SEO·AEO·GEO+세일즈 구조 동시 분석', '낮은 비용으로 우선순위 확인'],
    highlight: true,
  },
];

const DELIVERABLES: { icon: IconName; title: string; desc: ReactNode }[] = [
  {
    icon: 'chart',
    title: '설득 전환 지수 100점 점수화',
    desc: (
      <>
        사이트가 방문자의 관심을 붙잡고 신뢰를 만들고 <Em>행동을 유도하는 구조</Em>인지 항목별로
        평가합니다. 단순한 디자인 점수가 아니라 실제 전환을 방해하는 요소를 기준으로 분석합니다.
      </>
    ),
  },
  {
    icon: 'search',
    title: '무엇이, 왜 감점됐는지 근거 제시',
    desc: (
      <>
        어떤 문구와 구조가 고객의 행동을 막고 있는지 구체적으로 설명합니다.{' '}
        <Em>공개된 웹 접근성·검색 품질 가이드와 Salesscore 평가 기준</Em>을 바탕으로 판단 근거를
        함께 제공합니다.
      </>
    ),
  },
  {
    icon: 'spark',
    title: '그대로 복사해 사용하는 수정 지시문',
    desc: (
      <>
        현재 문제, 수정 목표, 추천 문구, 적용 방법을 정리해 제공합니다.{' '}
        <Em>Claude Code, Cursor, ChatGPT</Em> 등 사용 중인 AI 개발 도구에 그대로 붙여넣어 수정할
        수 있습니다.
      </>
    ),
  },
  {
    icon: 'check',
    title: '실행 우선순위 로드맵',
    desc: (
      <>
        문제를 한꺼번에 나열하지 않습니다. <Em>점수가 가장 낮은, 즉 가장 시급한 문제</Em>부터
        순서대로 정리해 효과가 큰 작업부터 먼저 확인할 수 있습니다.
      </>
    ),
  },
];

const STEPS: { icon: IconName; title: string; desc: ReactNode }[] = [
  {
    icon: 'search',
    title: '01. 사이트 정보 입력',
    desc: (
      <>
        분석할 사이트 주소와 <Em>사이트 목적, 주요 고객, 판매 상품</Em> 등 간단한 질문에 답합니다.
      </>
    ),
  },
  {
    icon: 'spark',
    title: '02. 다각도 교차 진단',
    desc: (
      <>
        설득 구조, 카피, 사용자 경험, 검색 최적화, 접근성, 신뢰 요소를{' '}
        <Em>여러 기준으로 분석</Em>하고 항목별 점수를 계산합니다.
      </>
    ),
  },
  {
    icon: 'check',
    title: '03. 결과 확인 및 바로 수정',
    desc: (
      <>
        감점 이유와 우선순위를 확인하고 제공된 수정 지시문을 복사해{' '}
        <Em>Claude Code, Cursor, ChatGPT</Em> 등에 붙여넣습니다. 수정 후 다시 진단해 점수가
        어떻게 달라졌는지 확인할 수 있습니다.
      </>
    ),
  },
];

const TRUST_POINTS: { icon: IconName; title: string; desc: ReactNode }[] = [
  {
    icon: 'search',
    title: '평가 항목 공개',
    desc: (
      <>
        어떤 요소를 평가하는지 숨기지 않습니다. 각 프레임워크가 확인하는 질문과{' '}
        <Em>주요 배점 기준을 공개</Em>합니다.
      </>
    ),
  },
  {
    icon: 'chart',
    title: '감점 근거 제공',
    desc: (
      <>
        점수만 낮게 표시하지 않습니다. <Em>어떤 요소가 왜 문제인지</Em> 해당 화면과 문구를
        기준으로 설명합니다.
      </>
    ),
  },
  {
    icon: 'check',
    title: '수정 전후 비교',
    desc: (
      <>
        사이트를 수정한 뒤 다시 진단해 <Em>어떤 항목이 개선됐고 어떤 문제가 남았는지</Em>{' '}
        비교할 수 있습니다.
      </>
    ),
  },
  {
    icon: 'shield',
    title: '도메인 안전 진단 포함',
    desc: (
      <>
        Google Safe Browsing으로 피싱·악성코드 블랙리스트 등재 여부를{' '}
        <Em>실시간으로 함께 조회</Em>합니다.
      </>
    ),
  },
];

const FREE_INCLUDES = [
  '종합 설득 전환 점수',
  'SEO·기술 최적화 점수 (구글·네이버 공식 기준)',
  '가장 큰 핵심 문제',
  '우선 확인해야 할 주요 감점 항목',
  '기본 개선 방향',
];

const PAID_INCLUDES = [
  '세부 항목별 전체 점수',
  '감점된 위치와 구체적인 판단 근거',
  '교체 가능한 헤드카피와 서브카피',
  'AI 개발 도구에 붙여넣는 수정 지시문',
  '점수 낮은 순 실행 우선순위',
  '수정 전후 비교와 재진단',
];

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'Salesscore 점수를 어떻게 믿을 수 있나요?',
    a: (
      <>
        Salesscore는 AI에게 즉흥적으로 판단을 맡기지 않습니다. 설득, 카피, 사용자 경험, 검색
        최적화, 접근성, 신뢰 요소 각각에 대해 <Em>공개된 웹 접근성·검색 품질 가이드와 자체 배점
        기준</Em>을 적용해 항목별로 평가합니다. 동일한 사이트, 동일한 조건이라면 일관된 점수가
        나오도록 설계되어 있습니다. 다만 Google, 네이버, W3C의 공식 인증이나 제휴를 받은
        서비스는 아니라는 점을 분명히 말씀드립니다.
      </>
    ),
  },
  {
    q: '제 사이트가 아니라 고객사 사이트도 진단할 수 있나요?',
    a: (
      <>
        네, 가능합니다. 에이전시나 대행사, 프리랜서 디자이너분들이 고객사 사이트 주소를 입력해
        진단을 진행하는 경우가 많습니다. 다만 해당 사이트를 진단하고{' '}
        <Em>그 결과를 활용하는 것에 대해 고객사의 동의</Em>를 받아두시는 것을 권장합니다.
      </>
    ),
  },
  {
    q: '결제하면 결과를 바로 확인할 수 있나요?',
    a: (
      <>
        네, 결제가 완료되면 곧바로 전체 리포트가 열립니다.{' '}
        <Em>세부 항목별 점수, 감점 위치와 근거, 교체 가능한 카피, AI 개발 도구에 붙여넣을 수정
        지시문</Em>까지 별도의 대기 시간 없이 바로 확인할 수 있습니다.
      </>
    ),
  },
  {
    q: '리포트를 받은 뒤 사이트를 수정하면 어떻게 되나요?',
    a: (
      <>
        제공된 수정 지시문을 <Em>Claude Code, Cursor, ChatGPT</Em> 등 사용 중인 AI 도구에
        붙여넣어 수정한 뒤, 같은 사이트 주소로 다시 진단을 요청하시면 됩니다. 수정 전과 수정
        후의 점수를 나란히 비교해 어떤 항목이 개선됐고 어떤 문제가 아직 남아 있는지 확인할 수
        있습니다.
      </>
    ),
  },
  {
    q: '무료 진단만 받아도 도움이 되나요?',
    a: (
      <>
        네, 무료 진단만으로도 <Em>종합 설득 전환 점수와 SEO·기술 최적화 점수, 가장 큰 핵심
        문제와 기본 개선 방향</Em>까지 확인할 수 있습니다. 다만 교체 가능한 카피 문구나 AI
        도구용 수정 지시문처럼 바로 실행에 옮길 수 있는 세부 내용은 전체 리포트에서 제공됩니다.
      </>
    ),
  },
  {
    q: '무료 진단에 카드 등록이 필요한가요?',
    a: (
      <>
        아니요, 필요하지 않습니다. 사이트 주소와 몇 가지 기본 정보만 입력하면{' '}
        <Em>카드 등록 없이 무료 진단 결과</Em>를 확인할 수 있습니다.
      </>
    ),
  },
  {
    q: '에이전시·대행사도 쓸 수 있나요?',
    a: (
      <>
        네, 오히려 에이전시나 대행사에서 활용도가 높습니다. 홈페이지 제작이나 리뉴얼 후 무엇이
        개선됐는지 숫자와 근거로 설명하기 어려운 경우,{' '}
        <Em>진단 전후 점수와 수정 항목을 고객에게 명확한 자료</Em>로 제시할 수 있습니다.
      </>
    ),
  },
  {
    q: '진단에는 얼마나 걸리나요?',
    a: (
      <>
        기본 진단은 사이트 주소와 정보를 입력한 뒤 빠르게 확인할 수 있습니다. 사이트 상태, 페이지
        분량, 네트워크 환경에 따라 <Em>분석 시간에는 차이</Em>가 있을 수 있습니다.
      </>
    ),
  },
];

export function MarketingPage({ onStart }: MarketingPageProps) {
  useSeo({
    title: '세일즈스코어 — 세일즈 최적화와 검색 최적화를 동시에 점수화',
    description:
      'AI로 사이트는 만들었는데 트래픽 유입도 구매전환도 없다면? 세일즈 구조와 검색 최적화를 함께 점수화하고 수정 프롬프트까지 받아보세요.',
    path: '/',
  });

  return (
    <div className="relative">
      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 overflow-hidden text-center pt-14">
        <VideoBackground videoUrl="/marketing-hero-bg.mp4" overlay="strong" speed={0.5} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 45% at 50% 20%, rgba(0,100,255,0.22), transparent 70%),' +
              'radial-gradient(ellipse 40% 35% at 80% 70%, rgba(88,28,255,0.12), transparent 70%)',
          }}
        />

        <motion.div
          className="relative z-10 w-full max-w-xl sm:max-w-2xl md:max-w-3xl"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-semibold text-[#7bd6ff] bg-[#0064ff]/10 border border-[#0064ff]/25 rounded-full px-4 py-1.5 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Icon name="spark" size={13} />
            전문 컨설팅 수준의 사이트 분석을 무료로 시작하세요
          </motion.span>

          <motion.h1
            className="text-white font-black tracking-tight leading-[1.15] mb-5"
            style={{
              fontSize: 'clamp(32px, 6.8vw, 66px)',
              filter: 'drop-shadow(0 20px 28px rgba(0,100,255,0.28))',
            }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            AI로 사이트는 만들었는데,
            <br />
            <span className="gradient-text-animated">트래픽 유입도 구매전환도 없다면?</span>
          </motion.h1>

          <p className="mx-auto mb-8 max-w-[20.5em] sm:max-w-2xl text-[16px] sm:text-[21px] font-medium leading-[1.18] sm:leading-[1.18] text-[#8d8d93] text-balance">
            <span className="block">광고를 해도 문의와 결제가 늘지 않는다면,</span>
            <span className="block">문제는 방문자 수가 아니라 <Em>사이트의 설득 구조</Em>일 수 있습니다.</span>
            <span className="block">사이트 주소를 입력하면 고객이 어디에서 이탈하는지,</span>
            <span className="block">무엇부터 고쳐야 하는지 <Em>우선순위대로</Em> 확인할 수 있습니다.</span>
          </p>

          <motion.div
            className="flex flex-col items-center justify-center mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <button
              onClick={onStart}
              className="h-14 px-9 rounded-full font-semibold text-[15px] text-white border-none cursor-pointer whitespace-nowrap transition-transform active:scale-[0.97] hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
                boxShadow: '0 8px 24px -8px rgba(0,100,255,0.55)',
              }}
            >
              무료로 내 사이트 진단받기 →
            </button>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-10">
            {['카드 등록 없이', '빠른 결과 확인', '수정 방향까지 제공'].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 md:gap-2.5 bg-[#0064ff]/12 border border-[#0064ff]/35 rounded-2xl pl-2.5 pr-4 py-2 md:pl-3.5 md:pr-6 md:py-3"
              >
                <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#0064ff] flex items-center justify-center shrink-0">
                  <Icon name="check" size={11} className="text-white" />
                </span>
                <span className="text-white/90 text-[12.5px] sm:text-[13px] md:text-[15px] font-semibold whitespace-nowrap">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════ PAIN POINTS ══════════ (삼각형: 넓게 시작해 좁게 마무리) */}
      <Section
        tossMotion
        eyebrow="이런 고민 있으신가요"
        heading={
          <>
            <HeadlineLine>혹시 이런 문제로</HeadlineLine>
            <span className="block mx-auto max-w-[11em]">
              <span className="gradient-text-static">고민하고 계시지 않나요?</span>
            </span>
          </>
        }
        sub={
          <>
            방문자는 들어오는데 문의와 결제가 일어나지 않는 이유를 감으로 찾고 계시지는 않나요?
            Salesscore는 <Em>카피, 설득 구조, 사용자 경험, 검색 노출, 신뢰 요소</Em>를 함께 분석해
            매출을 막는 문제부터 찾아냅니다.
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {PAIN_POINTS.map((p, i) => (
            <motion.div
              key={p.title}
              className="border border-white/[0.18] rounded-3xl p-7 sm:p-9 bg-white/[0.04] text-left transition-colors hover:border-white/30 hover:bg-white/[0.06]"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <IconBadge name={p.icon} tint="rose" />
              <p className="text-white font-bold text-[17px] sm:text-[18px] mt-5 mb-2.5 tracking-tight">
                {p.title}
              </p>
              <p className="text-[#86868b] text-[14px] sm:text-[15px] leading-relaxed font-medium">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════ WHAT YOU GET ══════════ */}
      <Section
        tossMotion
        eyebrow="무엇을 받게 되나요"
        heading={
          <>
            <span className="block mx-auto max-w-[9em]">막연한 조언이 아니라,</span>
            <HeadlineLine>
              무엇을 왜 고쳐야 하는지 <span className="gradient-text-static">실행 가능한 결과</span>
            </HeadlineLine>
            <span className="block">로 보여드립니다</span>
          </>
        }
        sub={
          <>
            <Em>12가지 설득·카피·사용자 경험·검색 최적화</Em> 분석 프레임워크로 사이트를 교차
            평가합니다. 점수만 보여주는 것이 아니라 감점 이유, 수정 방향, 실제 수정에 사용할
            지시문까지 제공합니다.
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 max-w-[420px] sm:max-w-3xl mx-auto">
          {DELIVERABLES.map((d, i) => (
            <motion.div
              key={d.title}
              className="border border-white/[0.18] rounded-3xl p-4 sm:p-9 bg-white/[0.04] text-left transition-colors hover:border-white/30 hover:bg-white/[0.06]"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="origin-top-left scale-90 sm:scale-100">
                <IconBadge name={d.icon} tint="blue" />
              </div>
              <p className="text-white font-bold text-[14px] sm:text-[18px] mt-4 mb-2 tracking-tight leading-tight">
                {d.title}
              </p>
              <p className="text-[#86868b] text-[12px] sm:text-[15px] leading-[1.5] sm:leading-relaxed font-medium line-clamp-4 sm:line-clamp-none">
                {d.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════ 두 가지 점수 ══════════ */}
      <Section
        tossMotion
        eyebrow="점수 구조"
        heading={
          <>
            검색 봇에게는 <span className="gradient-text-static">발견되고</span>,
            <span className="block">고객에게는 <span className="gradient-text-static">설득</span>되어야 합니다</span>
          </>
        }
        sub={
          <>
            구글·네이버에 노출되려면 검색 봇이 이해할 수 있는 <Em>SEO 구조</Em>가 필요합니다. 하지만 클릭 이후에는
            사람의 욕망, 불안, 신뢰, 행동 심리를 움직이는 <Em>세일즈 구조</Em>가 필요합니다.
            Salesscore는 이 두 가지를 함께 진단해 유입과 전환을 막는 문제를 1분 안에 보여드립니다.
          </>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {SCORE_AXES.map((axis, i) => (
            <motion.div
              key={axis.title}
              className="rounded-3xl border border-white/[0.14] bg-white/[0.03] p-6 sm:p-8 text-left"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <IconBadge name={axis.icon} tint="blue" />
              <p className="text-white font-bold text-[18px] sm:text-[20px] mt-5 mb-2 tracking-tight">
                {axis.title}
              </p>
              <p className="text-[#a0a0a8] text-[14px] sm:text-[15px] leading-relaxed font-medium mb-5">
                {axis.desc}
              </p>
              <div className="flex flex-wrap gap-2">
                {axis.bullets.map((bullet) => (
                  <span
                    key={bullet}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-white/75 text-[12px] font-semibold"
                  >
                    {bullet}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════ 가격 비교 ══════════ */}
      <Section
        tossMotion
        eyebrow="가격 비교"
        heading={
          <>
            이런 문제를 따로 맡기면 <span className="gradient-text-static">보통 얼마 들까요?</span>
          </>
        }
        sub={
          <>
            SEO·AEO·GEO 시장의 공개 가격과 비교하면, Salesscore의 비용 경쟁력이 바로 보입니다.
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {PRICE_COMPARISON_ROWS.map((row, i) => (
            <motion.div
              key={row.label}
              className={`relative rounded-2xl border p-5 sm:p-6 text-left bg-white/[0.045] ${
                row.highlight
                  ? 'border-[#d7ff00]/70 shadow-[0_0_0_1px_rgba(215,255,0,0.18),0_22px_70px_rgba(0,0,0,0.42)]'
                  : 'border-white/[0.12]'
              }`}
              initial={{ opacity: 0, y: 34, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {row.highlight && (
                <span className="absolute right-4 top-4 rounded-full border border-[#d7ff00]/50 px-2.5 py-1 text-[10px] font-bold text-[#d7ff00]">
                  가장 저렴
                </span>
              )}
              <p className="text-white/75 text-[13px] font-black mb-1">{row.label}</p>
              <p className="text-white/45 text-[11px] font-bold mb-4">{row.service}</p>
              <h3 className="text-white font-bold text-[19px] sm:text-[21px] tracking-tight mb-2">{row.type}</h3>
              <p className={`font-black tracking-tight mb-3 ${row.highlight ? 'text-[#d7ff00] text-[32px] sm:text-[38px]' : 'text-white text-[25px] sm:text-[28px]'}`}>{row.price}</p>
              <p className={`rounded-full border px-3 py-2 text-[12px] font-bold mb-3 ${row.highlight ? 'border-[#d7ff00]/35 bg-[#d7ff00]/10 text-[#d7ff00]' : 'border-white/10 bg-white/[0.03] text-white/60'}`}>{row.scope}</p>
              <p className="text-white/45 text-[12px] leading-[1.35] mb-4">{row.note}</p>
              <div className="h-px bg-white/10 mb-4" />
              <ul className="flex flex-col gap-2.5">
                {row.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-white/70 text-[12px] leading-snug">
                    <Icon name="check" size={12} className={row.highlight ? 'text-[#d7ff00] mt-0.5 shrink-0' : 'text-[#7bd6ff] mt-0.5 shrink-0'} />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <p className="text-white/35 text-[12px] leading-relaxed max-w-4xl mx-auto mt-5">
          A사·B사처럼 SEO/AEO/GEO를 따로 맡기면 월 수십만원에서 프로젝트 수천만원까지 올라갈 수 있습니다. Salesscore는 44개 항목을 자동 진단해 더 낮은 비용으로 먼저 문제와 우선순위를 확인하게 해줍니다.
        </p>
      </Section>


      {/* ══════════ 샘플 리포트 미리보기 ══════════ */}
      <Section
        tossMotion
        eyebrow="실제 결과 미리보기"
        heading={
          <>
            진단을 받으면 <span className="gradient-text-static">이런 결과</span>를 확인하게
            됩니다
          </>
        }
        sub={
          <>
            설명만 보고 판단하지 마세요. Salesscore가 어떤 문제를 찾고, 어떤 근거를 제시하며,
            무엇부터 수정하라고 안내하는지 <Em>실제 분석 화면</Em>에서 확인해 보세요.
          </>
        }
      >
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rounded-3xl border border-white/[0.14] bg-white/[0.03] p-3 sm:p-4 mb-8">
            <video
              src="/sales-hero.mp4"
              className="w-full rounded-2xl aspect-video object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
            {[
              '종합 설득 전환 점수',
              '가장 큰 감점 원인',
              '우선 수정해야 할 핵심 문제',
              '바로 사용하는 수정 지시문',
              '실행 순서와 재진단 결과',
            ].map((t) => (
              <div
                key={t}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 text-center"
              >
                <p className="text-white/70 text-[12px] font-semibold leading-snug">{t}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-1.5 h-12 px-7 rounded-full font-semibold text-[14px] text-white/90 border border-white/15 bg-white/5 hover:bg-white/10 transition-colors tracking-tight cursor-pointer"
            >
              샘플 분석 결과 자세히 보기 →
            </button>
            <p className="text-white/30 text-[11.5px] mt-3">
              실제 서비스 화면을 바탕으로 구성된 예시입니다.
            </p>
          </div>
        </motion.div>
      </Section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <Section
        tossMotion
        eyebrow="어떻게 진행되나요"
        heading={
          <>
            복잡한 설정 없이, <span className="gradient-text-static">3단계면 진단이 끝납니다</span>
          </>
        }
        sub={
          <>
            전문 용어를 알 필요도, 별도의 프로그램을 설치할 필요도 없습니다. 사이트 주소와 몇
            가지 정보만 입력하면 <Em>분석 결과와 수정 방향</Em>을 바로 확인할 수 있습니다.
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              className="text-center"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-center mb-5">
                <IconBadge name={s.icon} tint="blue" size="sm" />
              </div>
              <p className="text-white font-bold text-[17px] sm:text-[18px] mb-2 tracking-tight">{s.title}</p>
              <p className="text-[#86868b] text-[14px] sm:text-[15px] leading-relaxed font-medium">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════ 평가 기준과 신뢰 ══════════ (FAQ 직전, "이 점수 믿을 수 있나" 시점에 배치) */}
      <Section
        tossMotion
        eyebrow="이 점수를 믿을 수 있나요"
        heading={
          <>
            추측이 아니라, <span className="gradient-text-static">공개된 기준과 일관된 배점</span>으로
            평가합니다
          </>
        }
        sub={
          <>
            Salesscore는 단순히 AI에게 사이트가 좋은지 물어보고 임의의 점수를 보여주는 서비스가
            아닙니다. 설득, 카피, 사용자 경험, 검색 최적화, 접근성, 신뢰 요소를 각각 분리해
            평가하고 항목별 판단 기준과 배점을 적용합니다. 어떤 기준으로 점수가 계산되는지
            공개하며, 동일한 분석 조건에서는 <Em>일관된 평가 결과</Em>가 나오도록 설계했습니다.
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-12">
          {TRUST_POINTS.map((t, i) => (
            <motion.div
              key={t.title}
              className="border border-white/[0.14] rounded-3xl p-7 bg-white/[0.03] text-left"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <IconBadge name={t.icon} tint="blue" size="sm" />
              <p className="text-white font-bold text-[17px] sm:text-[18px] mt-4 mb-2 tracking-tight">{t.title}</p>
              <p className="text-[#86868b] text-[14px] sm:text-[15px] leading-relaxed font-medium">{t.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Link
            to="/methodology"
            className="inline-flex items-center gap-1.5 h-12 px-7 rounded-full font-semibold text-[14px] text-white/90 border border-white/15 bg-white/5 hover:bg-white/10 no-underline transition-colors tracking-tight"
          >
            채점 원리 보러가기 →
          </Link>
          <p className="text-white/25 text-[11px] max-w-md mx-auto mt-6 leading-relaxed">
            Salesscore는 Google, 네이버, W3C와 제휴하거나 공식 인증을 받은 서비스가 아닙니다.
            공개된 가이드와 Salesscore 자체 분석 기준을 바탕으로 진단 결과를 제공합니다.
          </p>
        </motion.div>
      </Section>

      {/* ══════════ 무료 진단과 전체 리포트 비교 ══════════ */}
      <Section
        tossMotion
        eyebrow="무료로 어디까지 확인할 수 있나요"
        heading={
          <>
            먼저 무료로 확인하고,
            <br />
            <span className="gradient-text-static">더 깊은 분석이 필요할 때만</span> 전체 리포트를
            선택하세요
          </>
        }
        sub={
          <>
            카드 등록 없이 무료 결과를 먼저 확인할 수 있습니다. 결제 전에{' '}
            <Em>어떤 방식으로 분석되는지</Em> 충분히 판단하세요.
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto mb-10">
          <motion.div
            className="border border-white/[0.14] rounded-3xl p-7 sm:p-9 bg-white/[0.03] text-left"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-white/50 text-[12px] tracking-[0.12em] uppercase font-bold mb-4">
              무료 진단
            </p>
            <ul className="flex flex-col gap-3">
              {FREE_INCLUDES.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-white/75 text-[14px] leading-relaxed">
                  <Icon name="check" size={14} className="text-[#7bd6ff] mt-0.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            className="border rounded-3xl p-7 sm:p-9 text-left"
            style={{ borderColor: 'rgba(0,100,255,0.35)', background: 'rgba(0,100,255,0.06)' }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[#7bd6ff] text-[12px] tracking-[0.12em] uppercase font-bold mb-4">
              전체 리포트에서 추가로 받는 내용
            </p>
            <ul className="flex flex-col gap-3">
              {PAID_INCLUDES.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-white/85 text-[14px] leading-relaxed">
                  <Icon name="unlock" size={14} className="text-[#7bd6ff] mt-0.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="text-center">
          <button
            onClick={onStart}
            className="h-14 px-9 rounded-full font-semibold text-[15px] text-white border-none cursor-pointer whitespace-nowrap transition-transform active:scale-[0.97] hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
              boxShadow: '0 8px 24px -8px rgba(0,100,255,0.55)',
            }}
          >
            무료 진단부터 시작하기 →
          </button>
        </div>
      </Section>

      {/* ══════════ FAQ ══════════ */}
      <Section
        tossMotion
        eyebrow="자주 묻는 질문"
        heading={
          <>
            진단 전에 <span className="gradient-text-static">가장 많이 묻는 질문</span>을
            정리했습니다
          </>
        }
      >
        <FaqAccordion items={FAQ} />
      </Section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="relative px-6 py-28 sm:py-36 md:py-48 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(0,100,255,0.14), transparent 70%)',
          }}
        />
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2
            className="text-white font-bold tracking-tight leading-[1.12] mb-6"
            style={{ fontSize: 'clamp(26px, 5vw, 44px)' }}
          >
            <span className="block">지금 당신의 사이트에서</span>
            <span className="block">
              <span className="gradient-text-static">매출(구매전환)을 막고 있는</span>
            </span>
            <span className="block">문제부터 확인해 보세요</span>
          </h2>
          <p className="text-[#86868b] text-[17px] sm:text-[19px] leading-[1.55] sm:leading-[1.7] max-w-lg mx-auto mb-9 font-medium">
            광고비를 더 쓰기 전에, 사이트를 다시 만들기 전에, <Em>무엇을 먼저 고쳐야 하는지</Em>{' '}
            확인하세요. 카드 등록 없이 무료로 시작할 수 있습니다.
          </p>
          <button
            onClick={onStart}
            className="h-14 px-9 rounded-full font-semibold text-[15px] text-white border-none cursor-pointer whitespace-nowrap transition-transform active:scale-[0.97] hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
              boxShadow: '0 8px 24px -8px rgba(0,100,255,0.55)',
            }}
          >
            무료로 내 사이트 진단받기 →
          </button>
          <p className="text-white/35 text-[12px] mt-4">
            카드 등록 없이 · 빠른 결과 확인 · 언제든 다시 진단
          </p>
        </motion.div>
      </section>
    </div>
  );
}
