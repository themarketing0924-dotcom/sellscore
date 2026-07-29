import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { VideoBackground } from './VideoBackground';
import type { ComponentProps } from 'react';

// ============================================================
// 공용 섹션 헤더
// ============================================================
// heading은 문자열도 되고, 줄마다 폭을 다르게 준 JSX도 된다.
// 애플처럼 섹션마다 헤드라인이 삼각형/역삼각형/대칭 블록 등
// 다른 "모양"으로 끊기게 하려면 heading에 <HeadlineLine> 여러 줄을 넘긴다.
// ============================================================

export function HeadlineLine({
  children,
  gradient,
}: {
  children: ReactNode;
  gradient?: boolean;
}) {
  return (
    <span className={`block ${gradient ? 'gradient-text-animated' : ''}`}>{children}</span>
  );
}

/** 본문 문단 안에서 핵심 구절만 흰색 볼드로 강조할 때 쓴다 (애플 본문 카피 패턴) */
export function Em({ children }: { children: ReactNode }) {
  return <strong className="text-white font-semibold">{children}</strong>;
}

export function Section({
  eyebrow,
  heading,
  sub,
  children,
  align = 'center',
  icon,
  bgVideo,
  bgVideoBlur = 18,
  bgVideoSpeed = 0.6,
  bgImage,
  tightEyebrow = false,
  headingSize = 'default',
  tossMotion = false,
}: {
  eyebrow: string;
  heading: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  align?: 'center' | 'left';
  /** 애플 "강력한 개인정보 보호" 섹션처럼 헤드라인 위에 중앙 아이콘을 둔다 */
  icon?: ComponentProps<typeof Icon>['name'];
  /** 섹션 전체에 은은하게 깔리는 블러 처리된 배경 영상 (텍스트가 박힌 영상도 블러로 무늬처럼만 보이게) */
  bgVideo?: string;
  bgVideoBlur?: number;
  bgVideoSpeed?: number;
  /** 정적 배경 이미지 — bgVideo와 동시에 쓰지 않는다(영상이 우선) */
  bgImage?: string;
  /** eyebrow-헤드라인 간격을 좁힌다 — 페이지 최상단에 바로 오는 Section 등 일부에서만 opt-in */
  tightEyebrow?: boolean;
  /** 페이지의 대표 타이틀 역할을 하는 Section(예: 요금제 상단)에 히어로급 크기(66px, font-black)를 준다 */
  headingSize?: 'default' | 'hero';
  /** 토스식 섹션 진입 모션: 홈 랜딩 섹션처럼 부드럽게 뜨는 효과가 필요할 때만 켠다 */
  tossMotion?: boolean;
}) {
  const isCenter = align === 'center';
  const isHero = headingSize === 'hero';
  return (
    <section className="relative px-6 py-28 sm:py-36 md:py-48 overflow-hidden">
      {bgVideo && (
        <VideoBackground videoUrl={bgVideo} overlay="strong" blur={bgVideoBlur} speed={bgVideoSpeed} />
      )}
      {!bgVideo && bgImage && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 55%, #000 100%)',
            }}
          />
        </div>
      )}
      <motion.div
        className={`relative z-10 mb-16 sm:mb-20 max-w-2xl ${isCenter ? 'text-center mx-auto' : 'text-left'}`}
        initial={tossMotion ? { opacity: 0, y: 72, scale: 0.985, filter: 'blur(10px)' } : { opacity: 0, y: 60 }}
        whileInView={tossMotion ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } : { opacity: 1, y: 0 }}
        viewport={tossMotion ? { once: true, amount: 0.32 } : { once: true }}
        transition={{ duration: tossMotion ? 0.95 : 1.0, ease: [0.16, 1, 0.3, 1] }}
      >
        {icon && (
          <div className="w-14 h-14 rounded-2xl bg-[#0064ff]/10 border border-[#0064ff]/20 flex items-center justify-center mx-auto mb-6">
            <Icon name={icon} size={26} className="text-[#7bd6ff]" />
          </div>
        )}
        <p
          className={`text-[#7bd6ff]/70 text-[13px] tracking-[0.25em] uppercase font-extrabold ${tightEyebrow ? 'mb-1' : 'mb-4'}`}
        >
          {eyebrow}
        </p>
        <h2
          className={`text-white tracking-tight leading-[1.15] mb-5 ${isHero ? 'font-black' : 'font-bold'}`}
          style={{ fontSize: isHero ? 'clamp(32px, 6.8vw, 66px)' : 'clamp(30px, 6.2vw, 58px)' }}
        >
          {heading}
        </h2>
        {sub && (
          <p
            className={`text-[#86868b] leading-[1.35] sm:leading-[1.5] max-w-lg mx-auto font-medium ${isHero ? 'text-[18px] sm:text-[21px]' : 'text-[17px] sm:text-[19px]'}`}
          >
            {sub}
          </p>
        )}
      </motion.div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

// ============================================================
// FAQ 아코디언
// ============================================================

export function FaqAccordion({ items }: { items: { q: string; a: ReactNode }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-3">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <motion.div
            key={item.q}
            className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className="w-full flex items-center justify-between gap-4 text-left p-5 sm:p-6 bg-transparent border-none cursor-pointer"
              aria-expanded={open}
            >
              <span className="text-white font-bold text-[14px] sm:text-[15px]">{item.q}</span>
              <motion.span
                animate={{ rotate: open ? 45 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-white/40 text-[20px] leading-none shrink-0"
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="text-white/50 text-[13px] leading-relaxed px-5 sm:px-6 pb-5 sm:pb-6">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
