import { motion } from 'framer-motion';
import { Icon } from './Icon';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Icon>['name'];

// ============================================================
// 채점 파이프라인을 "연결된 흐름"으로 보여주는 다이어그램
// ============================================================
// 카드를 나열만 하지 않고, 노드 사이를 잇는 트랙 위로 데이터가
// 흐르는 듯한 애니메이션을 넣어 "AI가 단계적으로 처리한다"는
// 인상을 준다. md 이상에서는 가로 트랙, 이하에서는 세로 트랙.
// ============================================================

interface FlowStep {
  icon: IconName;
  title: string;
  desc: string;
}

export function AlgorithmFlow({ steps }: { steps: FlowStep[] }) {
  const n = steps.length;

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* 가로 트랙 (md 이상) */}
      <div className="hidden md:block absolute left-0 right-0 top-[26px] h-px overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(91,155,255,0.35) 8%, rgba(91,155,255,0.35) 92%, transparent 100%)',
          }}
        />
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{
              background: '#7bd6ff',
              boxShadow: '0 0 8px 2px rgba(123,214,255,0.7)',
            }}
            animate={{ left: ['0%', '100%'] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 1.05,
            }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            className="relative flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          >
            <div
              className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-4 shrink-0"
              style={{
                background: 'radial-gradient(circle, rgba(0,100,255,0.18), rgba(0,100,255,0.04))',
                border: '1px solid rgba(91,155,255,0.35)',
              }}
            >
              <Icon name={step.icon} size={20} className="text-[#7bd6ff]" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#0a0a0e] border border-white/15 text-white/60 text-[9px] font-bold flex items-center justify-center tabular-nums">
                {i + 1}
              </span>
            </div>
            <p className="text-white font-bold text-[14px] mb-1.5">{step.title}</p>
            <p className="text-white/45 text-[12px] leading-relaxed max-w-[15em]">{step.desc}</p>
            {i < n - 1 && (
              <span className="md:hidden text-white/15 text-[16px] my-2">↓</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
