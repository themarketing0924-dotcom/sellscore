import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TRUST_BADGES } from '../../config/sellscore';
import { Icon, IconBadge } from './Icon';
import { VideoBackground } from './VideoBackground';
import { Section, HeadlineLine, Em, FaqAccordion } from './Section';
import { HeroScoreCard } from './HeroScoreCard';
import { SiteFooter } from './SiteFooter';
import { useSeo } from '../../hooks/useSeo';
import type { ComponentProps, ReactNode } from 'react';

type IconName = ComponentProps<typeof Icon>['name'];

interface MarketingPageProps {
  onStart: () => void;
}

const PAIN_POINTS: { icon: IconName; title: string; desc: ReactNode }[] = [
  {
    icon: 'target',
    title: '방문은 있는데 구매로 안 이어진다',
    desc: (
      <>
        트래픽은 만들었는데 <Em>어디서 이탈하는지</Em>, 뭘 먼저 고쳐야 하는지 감이 안 옵니다.
      </>
    ),
  },
  {
    icon: 'spark',
    title: 'AI로 사이트는 만들었는데 그다음이 없다',
    desc: (
      <>
        클로드·GPT로 뚝딱 만들긴 했는데, 이게 실제로 <Em>설득력 있는 구조인지</Em>는 아무도 안
        알려줍니다.
      </>
    ),
  },
  {
    icon: 'users',
    title: '고객사에 뭐라고 보고해야 할지 모르겠다',
    desc: (
      <>
        홈페이지를 만들어드리고 나면, <Em>성과를 숫자와 근거로</Em> 설명할 방법이 마땅치
        않습니다.
      </>
    ),
  },
  {
    icon: 'clock',
    title: '디자이너·마케터를 따로 구할 여력이 없다',
    desc: (
      <>
        전문가에게 맡기자니 비용과 시간이 부담되고, <Em>혼자 판단하자니 기준이 없습니다.</Em>
      </>
    ),
  },
];

const DELIVERABLES: { icon: IconName; title: string; desc: ReactNode }[] = [
  {
    icon: 'chart',
    title: '설득 전환 지수 100점 점수화',
    desc: (
      <>
        <Em>10명의 마케팅 대가 프레임워크</Em>로 사이트를 교차 채점합니다.
      </>
    ),
  },
  {
    icon: 'search',
    title: '무엇이, 왜 감점됐는지 근거 제시',
    desc: (
      <>
        <Em>WCAG, Google Search Essentials, 네이버 가이드</Em> 등 공식 기준을 근거로 듭니다.
      </>
    ),
  },
  {
    icon: 'spark',
    title: '그대로 붙여넣는 수정 지시문',
    desc: (
      <>
        현재 → 목표, 대안 2~3개까지 정리된 프롬프트를 <Em>Claude·Cursor·GPT</Em>에 바로
        붙여넣습니다.
      </>
    ),
  },
  {
    icon: 'check',
    title: '실행 우선순위 로드맵',
    desc: (
      <>
        <Em>지금 당장 / 1주 내 / 1개월 내</Em>로 나눠, 뭐부터 손대야 할지 순서를 정해줍니다.
      </>
    ),
  },
];

const STEPS: { icon: IconName; title: string; desc: ReactNode }[] = [
  {
    icon: 'search',
    title: 'URL 입력',
    desc: (
      <>
        사이트 주소와 목적·타겟 같은 <Em>질문 5개</Em>에 답합니다.
      </>
    ),
  },
  {
    icon: 'spark',
    title: 'AI 교차 진단',
    desc: (
      <>
        <Em>10개 설득 프레임워크</Em>로 카피·디자인·SEO를 채점합니다.
      </>
    ),
  },
  {
    icon: 'check',
    title: '바로 실행',
    desc: (
      <>
        수정 지시문을 복사해 <Em>AI 툴에 붙여넣고</Em> 바로 고칩니다.
      </>
    ),
  },
];

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: '이 점수를 어떻게 믿을 수 있나요?',
    a: (
      <>
        채점 기준(WCAG 2.2, Google Search Essentials, 네이버 서치어드바이저 가이드)을 그대로
        공개합니다. <Em>같은 사이트는 언제 다시 진단해도 같은 점수</Em>가 나오도록 설계되어
        있습니다.
      </>
    ),
  },
  {
    q: '제 사이트가 아니라 고객사 사이트도 진단할 수 있나요?',
    a: (
      <>
        네. 홈페이지 제작을 대행하시는 분들을 위해 <Em>다중 사이트 관리와 화이트라벨 리포트</Em>
        를 제공하는 에이전시 플랜이 별도로 있습니다.
      </>
    ),
  },
  {
    q: '결제하면 바로 확인할 수 있나요?',
    a: (
      <>
        결제 즉시 잠겨있던 <Em>7개 프레임워크 상세 진단</Em>과 Before/After 수정 문구, 실행
        로드맵이 바로 열립니다.
      </>
    ),
  },
  {
    q: '리포트를 산 뒤 사이트를 고치면요?',
    a: (
      <>
        리포트를 받고 개선한 뒤 <Em>30일 이내 재진단은 무료</Em>입니다. 점수가 실제로 올랐는지
        바로 확인할 수 있습니다.
      </>
    ),
  },
  {
    q: '무료로도 충분한가요, 꼭 결제해야 하나요?',
    a: (
      <>
        무료로도 <Em>종합 점수와 3개 프레임워크 상세 진단</Em>은 전부 확인할 수 있습니다. 나머지
        7개와 수정 지시문이 필요할 때만 결제하시면 됩니다.
      </>
    ),
  },
  {
    q: '카드 등록 없이 무료 진단을 받을 수 있나요?',
    a: (
      <>
        네. <Em>URL과 질문 5개</Em>만 입력하면 카드 등록이나 회원가입 없이 바로 점수를 확인할 수
        있습니다.
      </>
    ),
  },
  {
    q: '에이전시 플랜은 몇 개 사이트까지 관리할 수 있나요?',
    a: (
      <>
        <Em>사이트 다중 등록</Em>에 제한이 없고, 클라이언트별로 화이트라벨 PDF 리포트와 공유
        링크를 따로 관리할 수 있습니다.
      </>
    ),
  },
  {
    q: '진단에 걸리는 시간은 얼마나 되나요?',
    a: (
      <>
        URL 입력부터 결과 확인까지 <Em>보통 10~15초</Em>입니다. 질문 5개에 답하는 시간까지
        합쳐도 1분이 채 걸리지 않습니다.
      </>
    ),
  },
];

export function MarketingPage({ onStart }: MarketingPageProps) {
  useSeo({
    title: '세일즈스코어 — 당신 사이트, 팔리는 구조입니까?',
    description:
      '10초 만에 우리 사이트의 설득 전환 지수를 무료로 진단하고, Claude Code·Cursor·GPT에 바로 붙여넣는 실행 프롬프트를 받아보세요.',
    path: '/',
  });

  return (
    <div className="relative">
      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 overflow-hidden text-center">
        <VideoBackground variant="aurora" overlay="strong" />
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
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-semibold text-[#7bd6ff] bg-[#0064ff]/10 border border-[#0064ff]/25 rounded-full px-4 py-1.5 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Icon name="spark" size={13} />
            무료로 시작하는 유료 컨설팅급 사이트 분석
          </motion.span>

          <h1
            className="text-white font-black leading-[1.1] tracking-[-0.04em] mb-6"
            style={{ fontSize: 'clamp(32px, 6.8vw, 66px)' }}
          >
            10초 만에 이 사이트가
            <br />
            <span className="gradient-text-animated">안 팔리는 이유</span>를 보여드립니다
          </h1>

          <p className="text-white/60 text-[18px] sm:text-[21px] font-medium mb-11 max-w-xl mx-auto leading-[1.7]">
            소상공인, 1인 창업가, 홈페이지 제작 대행 서비스를 운영하신다면 —{' '}
            <Em>어디서 고객이 이탈하는지</Em>, 무엇부터 고쳐야 하는지 10초 안에 확인하세요.
          </p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
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
            <span className="text-white/35 text-[12px] font-medium">
              카드 등록 없이 · 10초 안에 결과 확인
            </span>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
            {TRUST_BADGES.map((badge, i) => (
              <span
                key={badge}
                className="text-white/45 text-[11px] sm:text-[12px] font-medium flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full pl-2 pr-3.5 py-1.5"
              >
                <Icon
                  name={(['shield', 'search', 'check'] as const)[i % 3]}
                  size={13}
                  className="text-[#5b9bff]"
                />
                {badge}
              </span>
            ))}
          </div>

          <HeroScoreCard />
        </motion.div>
      </section>

      {/* ══════════ PAIN POINTS ══════════ (삼각형: 넓게 시작해 좁게 마무리) */}
      <Section
        eyebrow="이런 고민 있으신가요"
        heading={
          <>
            <HeadlineLine>사이트는 있는데,</HeadlineLine>
            <span className="block mx-auto max-w-[9em]">
              정작 <span className="gradient-text-static">뭘 고쳐야 할지</span> 모르겠다면
            </span>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {PAIN_POINTS.map((p, i) => (
            <motion.div
              key={p.title}
              className="border border-white/10 rounded-3xl p-6 bg-white/[0.02] text-left"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <IconBadge name={p.icon} tint="rose" />
              <p className="text-white font-bold text-[15px] sm:text-[16px] mt-4 mb-1.5">
                {p.title}
              </p>
              <p className="text-white/50 text-[13px] leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════ 리스크 리버설 ══════════ (FAQ에 묻혀있던 정책을 전면에 배치) */}
      <section className="px-6 pb-20 sm:pb-24">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: 'unlock' as const, text: '카드 등록 없이 무료로 시작' },
            { icon: 'refresh' as const, text: '개선 후 30일 내 재진단 무료' },
            { icon: 'shield' as const, text: '동일 URL, 언제 진단해도 같은 점수' },
          ].map((item) => (
            <span
              key={item.text}
              className="flex items-center gap-2 text-white/70 text-[13px] sm:text-[14px] font-semibold bg-white/[0.04] border border-white/10 rounded-full px-4 py-2"
            >
              <Icon name={item.icon} size={14} className="text-emerald-300" />
              {item.text}
            </span>
          ))}
        </div>
      </section>

      {/* ══════════ WHAT YOU GET ══════════ */}
      <Section
        eyebrow="무엇을 받게 되나요"
        heading={
          <>
            <span className="block mx-auto max-w-[6em]">컨설턴트에게</span>
            <HeadlineLine>
              물어볼 질문을, <span className="gradient-text-static">AI 10명</span>이 먼저
            </HeadlineLine>
            <span className="block mx-auto max-w-[7em]">답해드립니다</span>
          </>
        }
        sub={
          <>
            추상적인 조언이 아니라, <Em>지금 바로 복사해서 쓸 수 있는 결과물</Em>입니다.
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {DELIVERABLES.map((d, i) => (
            <motion.div
              key={d.title}
              className="border border-white/10 rounded-3xl p-6 bg-white/[0.02] text-left"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <IconBadge name={d.icon} tint="blue" />
              <p className="text-white font-bold text-[15px] sm:text-[16px] mt-4 mb-1.5">
                {d.title}
              </p>
              <p className="text-white/50 text-[13px] leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <Section
        eyebrow="어떻게 진행되나요"
        heading={
          <>
            3단계, <span className="gradient-text-static">1분이면 끝납니다</span>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-white/25 text-[13px] font-bold tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <IconBadge name={s.icon} tint="blue" size="sm" />
              </div>
              <p className="text-white font-bold text-[15px] mb-1.5">{s.title}</p>
              <p className="text-white/45 text-[13px] leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════ 채점 원리로 신뢰 연결 ══════════ (FAQ 직전, "이 점수 믿을 수 있나" 시점에 배치) */}
      <Section eyebrow="이 점수를 믿을 수 있나요" heading="감이 아니라 공개된 기준으로 채점합니다">
        <motion.div
          className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/[0.02] p-7 sm:p-9 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <IconBadge name="shield" tint="blue" />
          <p className="text-white/70 text-[14px] sm:text-[15px] leading-relaxed mt-4 mb-6 max-w-md mx-auto">
            10개 프레임워크가 각각 무엇을 보는지, 어떤 4단계를 거쳐 100점 만점으로 환산되는지{' '}
            <Em>전부 공개</Em>합니다. 같은 사이트는 언제 재진단해도 같은 점수가 나옵니다.
          </p>
          <Link
            to="/methodology"
            className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full font-semibold text-[13px] text-white/90 border border-white/15 bg-white/5 hover:bg-white/10 no-underline transition-colors"
          >
            채점 원리 보러가기 →
          </Link>
        </motion.div>
      </Section>

      {/* ══════════ FAQ ══════════ */}
      <Section eyebrow="자주 묻는 질문" heading="궁금하신 점">
        <FaqAccordion items={FAQ} />
      </Section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="relative px-6 py-28 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(0,100,255,0.14), transparent 70%)',
          }}
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
            <span className="block mx-auto max-w-[5em]">지금 내</span>
            <span className="block">
              <span className="gradient-text-static">사이트 점수</span>, 궁금하지 않으세요?
            </span>
          </h2>
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
      </section>

      <SiteFooter />
    </div>
  );
}
