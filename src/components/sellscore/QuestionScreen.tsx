import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QUESTIONS } from '../../config/sellscore';

interface QuestionScreenProps {
  onComplete: (answers: Record<string, string>) => void;
  onBackToLanding: () => void;
}

export function QuestionScreen({ onComplete, onBackToLanding }: QuestionScreenProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleSelect = (value: string) => {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);

    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      onComplete(next);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      onBackToLanding();
    } else {
      setStep(step - 1);
    }
  };

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 15%, rgba(0,100,255,0.12), transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-xl">
        {/* progress */}
        <div className="flex items-center gap-3 mb-12">
          <button
            onClick={handleBack}
            className="text-white/50 hover:text-white/80 transition-colors bg-transparent border-none cursor-pointer text-[15px] font-semibold"
          >
            ← 이전
          </button>
          <div className="flex-1 h-3 bg-white/[0.15] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #0064ff, #7bd6ff)',
                boxShadow: '0 0 12px rgba(123,214,255,0.75)',
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="text-white/60 text-[14px] tabular-nums font-bold">
            {step + 1} / {QUESTIONS.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col items-center sm:items-start gap-3 mb-6">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative w-16 h-16 rounded-[22px] flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,100,255,0.18), rgba(123,214,255,0.10))',
                  boxShadow: '0 8px 24px -8px rgba(0,100,255,0.35)',
                }}
              >
                <span style={{ fontSize: 30 }}>{question.emoji}</span>
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#0064ff] text-white text-[11px] font-bold flex items-center justify-center border-2 border-black">
                  {step + 1}
                </span>
              </motion.div>
            </div>

            <h2
              className="text-white font-black leading-[1.15] tracking-[-0.025em] mb-9 text-center sm:text-left"
              style={{ fontSize: 'clamp(26px, 4.6vw, 38px)' }}
            >
              {question.title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options.map((option, i) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.4 }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-left h-16 px-5 rounded-2xl bg-white/[0.045] border border-white/10 text-white font-bold text-[16px] sm:text-[17px] hover:bg-white/[0.09] hover:border-[#5b9bff]/40 transition-colors cursor-pointer"
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
