import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LOADING_FRAMEWORK_NAMES, LOADING_MESSAGES } from '../../config/sellscore';
import { FloatingFormulaOrb } from './FloatingFormulaOrb';
import { MatrixRain } from './MatrixRain';

interface AnalyzingScreenProps {
  domain: string;
}

// 실제 분석(크롤링 + Claude 호출)은 소요 시간이 일정하지 않으므로, 이 화면은
// 고정 타이머로 스스로 넘어가지 않는다 — 부모(DiagnoseFlow)가 리포트가
// 준비되는 시점에 맞춰 다음 화면으로 전환한다. 여기서는 애니메이션만 재생한다.
// 실제 소요 시간(30~90초)은 예측 불가라, 게이지는 "빠르게 차오르다 점점 느려지며
// 97%에서 대기"하는 곡선을 쓴다 — 리포트가 준비되면 부모가 화면을 통째로 전환한다.
const STAGES = ['페이지 수집', '기준 대조', '항목 채점', '리포트 정리'] as const;

export function AnalyzingScreen({ domain }: AnalyzingScreenProps) {
  const [frameworkIndex, setFrameworkIndex] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const frameworkTimer = setInterval(() => {
      setFrameworkIndex((i) => (i + 1) % LOADING_FRAMEWORK_NAMES.length);
    }, 350);
    const messageTimer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1300);
    const startedAt = Date.now();
    const progressTimer = setInterval(() => {
      const t = (Date.now() - startedAt) / 1000;
      setProgress(Math.min(97, Math.round(100 * (1 - Math.exp(-t / 30)))));
    }, 300);

    return () => {
      clearInterval(frameworkTimer);
      clearInterval(messageTimer);
      clearInterval(progressTimer);
    };
  }, []);

  const stageIndex = progress < 25 ? 0 : progress < 55 ? 1 : progress < 85 ? 2 : 3;

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      <MatrixRain />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 45% 40% at 50% 45%, rgba(0,100,255,0.14), transparent 70%)',
        }}
      />

      <div className="relative z-10 mb-9">
        <div className="block sm:hidden">
          <FloatingFormulaOrb size={230} />
        </div>
        <div className="hidden sm:block">
          <FloatingFormulaOrb size={300} />
        </div>
      </div>

      <p className="relative z-10 text-white/35 text-[12px] tracking-[0.2em] uppercase mb-4 font-semibold">
        {domain}
      </p>

      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 text-white text-[17px] sm:text-[19px] font-semibold mb-7 max-w-md"
        >
          {LOADING_MESSAGES[messageIndex]}
        </motion.p>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.p
          key={frameworkIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 text-[#7bd6ff]/80 text-[13px] font-mono font-medium mb-10"
        >
          {LOADING_FRAMEWORK_NAMES[frameworkIndex]}
        </motion.p>
      </AnimatePresence>

      {/* ── 진행 게이지 ── */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-[12px] font-semibold">
            {STAGES[stageIndex]} 중…
          </span>
          <span className="text-[#7bd6ff] text-[13px] font-mono font-bold tabular-nums">
            {progress}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-white/[0.07] border border-white/[0.08] overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #0064ff, #7bd6ff)',
              boxShadow: '0 0 12px rgba(0,100,255,0.6)',
            }}
          />
        </div>
        <div className="flex justify-between mt-3">
          {STAGES.map((s, i) => (
            <span
              key={s}
              className={`text-[11px] font-medium transition-colors ${
                i < stageIndex
                  ? 'text-emerald-300/80'
                  : i === stageIndex
                    ? 'text-white/80'
                    : 'text-white/25'
              }`}
            >
              {i < stageIndex ? '✓ ' : ''}
              {s}
            </span>
          ))}
        </div>
        <p className="text-white/30 text-[11px] text-center mt-5">
          실제 페이지를 읽고 채점하는 중이라 30초~1분 정도 걸립니다
        </p>
      </div>
    </section>
  );
}
