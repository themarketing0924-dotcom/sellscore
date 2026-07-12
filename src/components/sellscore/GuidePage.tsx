import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BRAND, LOADING_FRAMEWORK_NAMES } from '../../config/sellscore';
import { Icon, IconBadge } from './Icon';
import { Section, HeadlineLine, Em, FaqAccordion } from './Section';
import { VideoBackground } from './VideoBackground';
import type { ComponentProps, ReactNode } from 'react';

type IconName = ComponentProps<typeof Icon>['name'];

const REPORT_CONTENTS: { icon: IconName; title: string; desc: ReactNode }[] = [
  {
    icon: 'chart',
    title: '설득 전환 지수 100점 채점표',
    desc: (
      <>
        10개 프레임워크 점수를 <Em>막대·레이더 차트</Em>로 한눈에 보여드립니다.
      </>
    ),
  },
  {
    icon: 'search',
    title: '왜 감점됐는지 공식 기준 근거',
    desc: (
      <>
        <Em>WCAG 2.2, Google Search Essentials, 네이버 서치어드바이저 가이드</Em>를 인용합니다.
      </>
    ),
  },
  {
    icon: 'spark',
    title: '한국형 적용 예시가 붙은 수정 지시문',
    desc: (
      <>
        현재 → 목표, 대안 2~3개까지 정리해 <Em>Claude·Cursor·GPT</Em>에 바로 붙여넣습니다.
      </>
    ),
  },
  {
    icon: 'check',
    title: '지금 / 1주 내 / 1개월 내 실행 로드맵',
    desc: (
      <>
        무엇부터 손대야 하는지 <Em>우선순위</Em>까지 정리해드립니다.
      </>
    ),
  },
];

const USE_CASES: { icon: IconName; text: ReactNode }[] = [
  {
    icon: 'spark',
    text: (
      <>
        퇴근 후 <Em>1인 창업</Em>을 준비하며 홈페이지를 직접 만든 분
      </>
    ),
  },
  {
    icon: 'target',
    text: (
      <>
        동네 가게, <Em>예약·시술·상담형 서비스</Em>를 운영하는 소상공인
      </>
    ),
  },
  {
    icon: 'chart',
    text: (
      <>
        AI로 사이트는 만들었지만 <Em>문의·결제가 늘지 않는</Em> 분
      </>
    ),
  },
  {
    icon: 'users',
    text: (
      <>
        고객사 홈페이지를 만들어주고 <Em>성과를 근거로 보고</Em>해야 하는 제작 대행 서비스
      </>
    ),
  },
];

const FUNNEL_STEPS: { title: string; desc: ReactNode }[] = [
  {
    title: '1. 무료 진단',
    desc: (
      <>
        URL과 질문 5개만 답하면 <Em>10초 안에</Em> 점수가 나옵니다.
      </>
    ),
  },
  {
    title: '2. 리포트 잠금 해제',
    desc: (
      <>
        <Em>9,900원</Em>으로 전체 진단과 수정 지시문을 받습니다.
      </>
    ),
  },
  {
    title: '3. 재진단으로 확인',
    desc: (
      <>
        개선 후 <Em>30일 내 재진단은 무료</Em>, 점수 변화를 바로 봅니다.
      </>
    ),
  },
  {
    title: '4. 구독 · 에이전시',
    desc: '계속 확인하고 싶다면 월 구독이나 에이전시 플랜으로 이어갑니다.',
  },
];

const FAQ_ITEMS: { q: string; a: ReactNode }[] = [
  {
    q: '왜 무료로 먼저 보여주나요?',
    a: (
      <>
        점수와 차트를 먼저 직접 보고 판단하셔야 <Em>신뢰가 생기기</Em> 때문입니다. 무료 진단은
        진입점이고, 필요하면 유료 리포트로 이어집니다.
      </>
    ),
  },
  {
    q: '마케팅을 잘 몰라도 이해할 수 있나요?',
    a: (
      <>
        네. 전문 용어 대신 <Em>"현재 → 목표"</Em>처럼 바로 실행할 수 있는 형태로 정리해드립니다.
      </>
    ),
  },
  {
    q: '제 업종에도 맞나요?',
    a: (
      <>
        이커머스, 강의·코칭, 상담·예약형 서비스, 제작 대행업 등 <Em>업종별 예시</Em>를 반영해
        진단합니다.
      </>
    ),
  },
  {
    q: '결제 후 무엇이 달라지나요?',
    a: (
      <>
        잠겨있던 <Em>7개 프레임워크 상세 진단</Em>, Before/After 수정 문구, 실행 로드맵이 전부
        열립니다.
      </>
    ),
  },
  {
    q: '재진단하면 점수가 바로 반영되나요?',
    a: (
      <>
        네. 수정한 사이트를 <Em>다시 URL로 입력</Em>하면 새로 채점되고, 이전 점수와 나란히 비교해
        볼 수 있습니다.
      </>
    ),
  },
  {
    q: '환불이 가능한가요?',
    a: (
      <>
        리포트를 받고 개선한 뒤 <Em>30일 이내 재진단은 무료</Em>로 제공되어, 결과에 대한 부담을
        낮췄습니다. 별도 환불 문의는 고객센터로 연락 주세요.
      </>
    ),
  },
  {
    q: '랜딩페이지와 상세페이지를 한 번에 진단할 수 있나요?',
    a: (
      <>
        한 번에 한 URL 기준으로 채점됩니다. <Em>페이지별로 각각 진단</Em>하시면 더 정확한 결과를
        받아보실 수 있습니다.
      </>
    ),
  },
  {
    q: '입력한 사이트 정보는 안전하게 보관되나요?',
    a: (
      <>
        진단을 위해 <Em>공개된 페이지 정보만</Em> 사용하며, 결제·개인정보는 별도로 암호화해
        보관합니다.
      </>
    ),
  },
];

export function GuidePage() {
  const navigate = useNavigate();
  const goDiagnose = () => navigate('/diagnose');

  return (
    <div>
      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-[62dvh] sm:min-h-[70dvh] flex flex-col items-center justify-center px-6 pt-28 pb-16 overflow-hidden text-center">
        <VideoBackground variant="aurora" overlay="strong" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 45% at 50% 18%, rgba(0,100,255,0.18), transparent 70%)',
          }}
        />
        <motion.div
          className="relative z-10 w-full max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-white/45 text-[12px] tracking-[0.3em] uppercase mb-7 font-semibold">
            무료 진단 가이드
          </p>
          <h1
            className="text-white font-black leading-[1.1] tracking-[-0.04em] mb-6"
            style={{ fontSize: 'clamp(32px, 6.8vw, 66px)' }}
          >
            변하지 않는 판매 전환 원리를
            <br />
            <span className="gradient-text-animated">내 사이트 기준</span>으로 확인하세요
          </h1>
          <p className="text-white/60 text-[18px] sm:text-[21px] font-medium mb-11 max-w-xl mx-auto leading-[1.7]">
            <Em>10명의 마케팅 대가</Em>가 검증해온 설득 원리를 한국 소상공인·1인 창업가 기준으로
            재구성해, <Em>당신 사이트에 직접 대입한 점수와 실행 지시문</Em>으로 드립니다.
          </p>
          <button
            onClick={goDiagnose}
            className="h-14 px-9 rounded-full font-semibold text-[15px] text-white border-none cursor-pointer whitespace-nowrap transition-transform active:scale-[0.97] hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
              boxShadow: '0 8px 24px -8px rgba(0,100,255,0.55)',
            }}
          >
            무료로 내 사이트 진단받기 →
          </button>
        </motion.div>
      </section>

      {/* ══════════ 문제 제기 ══════════ (역삼각형: 좁게 시작해 넓게 펼침) */}
      <Section
        eyebrow="문제 제기"
        heading={
          <>
            <span className="block mx-auto max-w-[7em]">AI로 사이트는 만들었는데,</span>
            <HeadlineLine>
              왜 <span className="gradient-text-static">매출</span>은 그대로일까요?
            </HeadlineLine>
          </>
        }
      >
        <p className="text-white/60 text-[17px] sm:text-[19px] leading-[1.7] max-w-2xl mx-auto text-center">
          <span className="block">랜딩페이지도 만들고, 상세페이지도 채워봤지만</span>
          <span className="block">실제 문의와 결제로는 잘 이어지지 않는 경우가 많습니다.</span>
          <span className="block">
            <Em>문제는 도구가 아니라 구조입니다.</Em>
          </span>
        </p>
      </Section>

      {/* ══════════ 핵심 약속 ══════════ */}
      <Section
        eyebrow="핵심 약속"
        heading={
          <>
            우리는 사이트 만드는 법이 아니라,{' '}
            <span className="gradient-text-static">팔리는 구조</span>를 진단합니다
          </>
        }
        sub={
          <>
            이미 만든 사이트를 새로 만들라고 하지 않습니다. <Em>무엇이 새고 있는지</Em>부터
            찾습니다.
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
          {[
            <>
              <Em>설득 구조</Em>부터 채점한다
            </>,
            <>
              <Em>공식 기준</Em>(WCAG·Search Essentials)을 근거로 든다
            </>,
            <>
              바로 붙여넣는 <Em>수정 지시문</Em>을 준다
            </>,
            <>
              개선 후 재진단으로 <Em>변화를 증명</Em>한다
            </>,
          ].map((item, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex items-start gap-3">
              <Icon name="check" size={16} className="text-[#5b9bff] mt-0.5 shrink-0" />
              <span className="text-white/75 text-[14px] leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════ 거장 원리 소개 (신뢰) ══════════ */}
      <Section
        icon="shield"
        eyebrow="신뢰 증거"
        heading={
          <>
            10명의 <span className="gradient-text-static">글로벌 마케터가 검증한</span>{' '}
            프레임워크로 채점합니다
          </>
        }
        sub={
          <>
            감이 아니라, <Em>반복적으로 검증된 설득 프레임워크</Em> 위에서 점수를 매깁니다.
          </>
        }
      >
        <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
          {LOADING_FRAMEWORK_NAMES.map((name) => (
            <span
              key={name}
              className="text-white/60 text-[12px] font-medium bg-white/[0.04] border border-white/10 rounded-full px-4 py-2"
            >
              {name}
            </span>
          ))}
        </div>
      </Section>

      {/* ══════════ 리포트 구성 ══════════ */}
      <Section
        eyebrow="무료 진단에 포함된 것"
        heading={
          <>
            <HeadlineLine>받는 즉시</HeadlineLine>
            <HeadlineLine>
              <span className="gradient-text-static">바로 쓸 수 있게</span> 만들었습니다
            </HeadlineLine>
          </>
        }
        sub={
          <>
            추상적인 조언이 아니라, <Em>랜딩페이지에 바로 적용하는 형태</Em>로 드립니다.
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {REPORT_CONTENTS.map((item, i) => (
            <motion.div
              key={item.title}
              className="border border-white/10 rounded-3xl p-6 bg-white/[0.02] text-left"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <IconBadge name={item.icon} tint="blue" />
              <p className="text-white font-bold text-[15px] sm:text-[16px] mt-4 mb-1.5">
                {item.title}
              </p>
              <p className="text-white/50 text-[13px] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════ 적용 예시 (이런 분께 맞습니다) ══════════ */}
      <Section
        eyebrow="이런 분께 맞습니다"
        heading={
          <>
            한국 <span className="gradient-text-static">1인 창업가와 소상공인</span>을 기준으로
            만들었습니다
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
          {USE_CASES.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex items-start gap-3"
            >
              <IconBadge name={item.icon} tint="blue" size="sm" />
              <span className="text-white/70 text-[13px] leading-relaxed pt-1.5">{item.text}</span>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button
            onClick={goDiagnose}
            className="h-12 px-7 rounded-full font-semibold text-[14px] text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            내 업종에 적용하기
          </button>
        </div>
      </Section>

      {/* ══════════ 전환 흐름 ══════════ */}
      <Section
        eyebrow="전환 흐름"
        heading={
          <>
            <span className="gradient-text-static">무료 진단에서 구독까지</span> 자연스럽게
            이어집니다
          </>
        }
        sub={
          <>
            먼저 <Em>무료로 점수를 보고</Em>, 필요하면 확장하는 구조입니다.
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          {FUNNEL_STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <IconBadge name="target" tint="blue" size="sm" />
              <p className="text-white font-bold text-[14px] mt-4 mb-1.5">{step.title}</p>
              <p className="text-white/50 text-[13px] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════ FAQ ══════════ */}
      <Section eyebrow="자주 묻는 질문" heading="궁금하신 점">
        <FaqAccordion items={FAQ_ITEMS} />
      </Section>

      {/* ══════════ 최종 CTA ══════════ */}
      <section className="relative px-6 py-20 sm:py-24 md:py-28 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(0,100,255,0.14), transparent 70%)' }}
        />
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-white font-bold tracking-[-0.03em] mb-8"
            style={{ fontSize: 'clamp(24px, 5vw, 40px)' }}
          >
            <span className="block mx-auto max-w-[10em]">지금 필요한 건 더 많은 정보가 아니라,</span>
            <span className="block gradient-text-static">바로 팔리는 구조입니다</span>
          </h2>
          <button
            onClick={goDiagnose}
            className="h-14 px-9 rounded-full font-semibold text-[15px] text-white border-none cursor-pointer whitespace-nowrap transition-transform active:scale-[0.97] hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
              boxShadow: '0 8px 24px -8px rgba(0,100,255,0.55)',
            }}
          >
            무료로 내 사이트 진단받기 →
          </button>
        </motion.div>
      </section>

      <footer className="px-6 py-10 border-t border-white/[0.06] text-center">
        <p className="text-white/30 text-[12px] mb-2 font-semibold">{BRAND.name}</p>
        <p className="text-white/20 text-[11px] max-w-md mx-auto leading-relaxed">
          {BRAND.footerNote}
        </p>
      </footer>
    </div>
  );
}
