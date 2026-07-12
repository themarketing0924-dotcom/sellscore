import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';
import { BarChart, type BarChartItem } from '../charts/BarChart';

// ============================================================
// 히어로용 "진단 결과 미리보기" 카드
// ============================================================
// 실제 스크린샷 대신, 제품의 핵심 가치(점수 + 프레임워크별 채점)를
// 그 자리에서 애니메이션으로 보여주는 목업 카드.
// ============================================================

const SAMPLE_ITEMS: BarChartItem[] = [
  { label: '리스크 리버설', score: 3.2 },
  { label: '헤드라인 명확성', score: 8.6 },
  { label: '신뢰 신호', score: 5.4 },
  { label: 'CTA 배치', score: 7.1 },
];

export function HeroScoreCard() {
  const score = useCountUp(68, 1400);

  return (
    <motion.div
      className="relative max-w-sm mx-auto text-left"
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-7"
        style={{ boxShadow: '0 24px 60px -20px rgba(0,100,255,0.35)' }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex items-center justify-between mb-5">
          <span className="text-white/40 text-[11px] font-mono truncate max-w-[140px]">
            example.co.kr
          </span>
          <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-1 whitespace-nowrap">
            진단 완료
          </span>
        </div>

        <div className="flex items-end gap-3 mb-6">
          <span className="text-white font-extrabold text-[52px] leading-none tracking-tight tabular-nums">
            {score}
          </span>
          <div className="pb-1.5">
            <span className="text-white/40 text-[13px]">/100</span>
            <p className="text-[#7bd6ff] text-[13px] font-bold">등급 C+</p>
          </div>
        </div>

        <BarChart items={SAMPLE_ITEMS} />

        <p className="text-white/30 text-[11px] mt-5 text-center">
          10명의 마케팅 대가 프레임워크로 10초 안에 분석
        </p>
      </motion.div>
    </motion.div>
  );
}
