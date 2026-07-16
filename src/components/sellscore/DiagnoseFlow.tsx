import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LandingScreen } from './LandingScreen';
import { QuestionScreen } from './QuestionScreen';
import { AnalyzingScreen } from './AnalyzingScreen';
import { ResultScreen } from './ResultScreen';
import { AuthModal } from '../AuthModal';
import { useAuth } from '../../contexts/AuthContext';
import { getDiagnosisReport } from '../../lib/aiScoreEngine';
import type { DiagnosisReport } from '../../lib/scoreEngine';

const PENDING_REF_KEY = 'sellscore_pending_ref';
// 로딩 화면이 너무 빨리 사라지면 "진짜 계산 중"이라는 느낌이 줄어들어
// 최소 이 시간만큼은 로딩 애니메이션을 보여준다 (실제 응답이 더 늦으면 그만큼 기다린다).
const MIN_LOADING_MS = 3500;

type Step = 'landing' | 'question' | 'loading' | 'result' | 'error';

export function DiagnoseFlow() {
  const [step, setStep] = useState<Step>('landing');
  const [url, setUrl] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // 무료 횟수 소진 에러인지 (이때는 일반 에러 화면 대신 회원가입 CTA를 보여준다)
  const isLimitError = errorMessage.includes('무료 진단') && errorMessage.includes('회원가입');

  // /diagnose?ref=CODE 로 들어온 방문자는 나중에 회원가입할 때 초대한 사람에게 귀속시킨다.
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) localStorage.setItem(PENDING_REF_KEY, ref);
  }, [searchParams]);

  const restart = () => {
    setUrl('');
    setAnswers({});
    setReport(null);
    setErrorMessage('');
    setStep('landing');
  };

  const runAnalysis = (targetUrl: string, submittedAnswers: Record<string, string>) => {
    setStep('loading');
    const startedAt = Date.now();
    getDiagnosisReport(targetUrl, submittedAnswers)
      .then((r) => {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
        setTimeout(() => {
          setReport(r);
          setStep('result');
        }, remaining);
      })
      .catch((err: Error) => {
        setErrorMessage(err.message);
        setStep('error');
      });
  };

  return (
    <>
      {step === 'landing' && (
        <LandingScreen
          onSubmit={(submittedUrl) => {
            setUrl(submittedUrl);
            setStep('question');
          }}
        />
      )}

      {step === 'question' && (
        <QuestionScreen
          onComplete={(submittedAnswers) => {
            setAnswers(submittedAnswers);
            runAnalysis(url, submittedAnswers);
          }}
          onBackToLanding={() => setStep('landing')}
        />
      )}

      {step === 'loading' && <AnalyzingScreen domain={url} />}

      {step === 'error' && isLimitError && (
        <section className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
          <p className="text-white/35 text-[12px] tracking-[0.2em] uppercase mb-4 font-semibold">
            무료 진단 3회 완료
          </p>
          <h1 className="text-white font-black text-[26px] sm:text-[32px] mb-4 max-w-xl leading-snug">
            잘 쓰고 계시네요!
            <br />
            회원가입하면 <span className="gradient-text-static">계속 무료</span>입니다
          </h1>
          <p className="text-white/60 text-[15px] sm:text-[16px] leading-[1.7] max-w-md mb-9">
            무료 회원가입 한 번이면 진단을 계속 이용할 수 있고, 모든 리포트가 자동
            저장되어 언제든 다시 볼 수 있습니다. 결제 정보는 필요 없어요.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <button
                onClick={() => runAnalysis(url, answers)}
                className="inline-flex items-center justify-center h-12 px-8 rounded-full font-semibold text-[14px] text-white border-none cursor-pointer transition-transform active:scale-[0.97] hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
                  boxShadow: '0 8px 24px -8px rgba(0,100,255,0.55)',
                }}
              >
                가입 완료 — 이어서 진단하기 →
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="inline-flex items-center justify-center h-12 px-8 rounded-full font-semibold text-[14px] text-white border-none cursor-pointer transition-transform active:scale-[0.97] hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
                  boxShadow: '0 8px 24px -8px rgba(0,100,255,0.55)',
                }}
              >
                30초 무료 회원가입 →
              </button>
            )}
            <button
              onClick={restart}
              className="inline-flex items-center justify-center h-12 px-7 rounded-full font-semibold text-[14px] text-white/80 bg-white/[0.06] border border-white/15 cursor-pointer transition-colors hover:bg-white/[0.1]"
            >
              처음으로
            </button>
          </div>
        </section>
      )}

      {step === 'error' && !isLimitError && (
        <section className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
          <p className="text-white/35 text-[12px] tracking-[0.2em] uppercase mb-4 font-semibold">
            {url}
          </p>
          <h1 className="text-white font-black text-[26px] sm:text-[32px] mb-4 max-w-xl leading-snug">
            진단을 완료하지 못했습니다
          </h1>
          <p className="text-white/60 text-[15px] sm:text-[16px] leading-[1.7] max-w-lg mb-9">
            {errorMessage}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => runAnalysis(url, answers)}
              className="inline-flex items-center justify-center h-12 px-8 rounded-full font-semibold text-[14px] text-white border-none cursor-pointer transition-transform active:scale-[0.97] hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
                boxShadow: '0 8px 24px -8px rgba(0,100,255,0.55)',
              }}
            >
              다시 시도하기
            </button>
            <button
              onClick={restart}
              className="inline-flex items-center justify-center h-12 px-7 rounded-full font-semibold text-[14px] text-white/80 bg-white/[0.06] border border-white/15 cursor-pointer transition-colors hover:bg-white/[0.1]"
            >
              다른 URL로 진단
            </button>
          </div>
        </section>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {step === 'result' && report && (
        <ResultScreen report={report} answers={answers} onRestart={restart} />
      )}
    </>
  );
}
