import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LOADING_FRAMEWORK_NAMES, LOADING_MESSAGES } from '../../config/sellscore';
import { FloatingFormulaOrb } from './FloatingFormulaOrb';

interface AnalyzingScreenProps {
  domain: string;
}

// 실제 분석(크롤링 + Claude 호출)은 소요 시간이 일정하지 않으므로, 이 화면은
// 고정 타이머로 스스로 넘어가지 않는다 — 부모(DiagnoseFlow)가 리포트가
// 준비되는 시점에 맞춰 다음 화면으로 전환한다. 여기서는 애니메이션만 재생한다.
export function AnalyzingScreen({ domain }: AnalyzingScreenProps) {
  const [frameworkIndex, setFrameworkIndex] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const frameworkTimer = setInterval(() => {
      setFrameworkIndex((i) => (i + 1) % LOADING_FRAMEWORK_NAMES.length);
    }, 350);
    const messageTimer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1300);

    return () => {
      clearInterval(frameworkTimer);
      clearInterval(messageTimer);
    };
  }, []);

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
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
          className="relative z-10 text-[#7bd6ff]/80 text-[13px] font-mono font-medium"
        >
          {LOADING_FRAMEWORK_NAMES[frameworkIndex]}
        </motion.p>
      </AnimatePresence>
    </section>
  );
}
