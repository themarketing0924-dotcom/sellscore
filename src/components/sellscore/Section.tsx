import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
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
}: {
  eyebrow: string;
  heading: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  align?: 'center' | 'left';
  /** 애플 "강력한 개인정보 보호" 섹션처럼 헤드라인 위에 중앙 아이콘을 둔다 */
  icon?: ComponentProps<typeof Icon>['name'];
}) {
  const isCenter = align === 'center';
  return (
    <section className="relative px-6 py-20 sm:py-24 md:py-28">
      <motion.div
        className={`mb-12 sm:mb-14 max-w-2xl ${isCenter ? 'text-center mx-auto' : 'text-left'}`}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {icon && (
          <div className="w-14 h-14 rounded-2xl bg-[#0064ff]/10 border border-[#0064ff]/20 flex items-center justify-center mx-auto mb-6">
            <Icon name={icon} size={26} className="text-[#7bd6ff]" />
          </div>
        )}
        <p className="text-[#7bd6ff]/70 text-[13px] tracking-[0.25em] uppercase mb-4 font-extrabold">
          {eyebrow}
        </p>
        <h2
          className="text-white font-black tracking-[-0.035em] leading-[1.12] mb-4"
          style={{ fontSize: 'clamp(30px, 6.2vw, 58px)' }}
        >
          {heading}
        </h2>
        {sub && (
          <p className="text-white/60 text-[17px] sm:text-[19px] leading-[1.7] max-w-lg mx-auto font-medium">
            {sub}
          </p>
        )}
      </motion.div>
      {children}
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
