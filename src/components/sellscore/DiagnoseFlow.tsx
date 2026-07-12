import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LandingScreen } from './LandingScreen';
import { QuestionScreen } from './QuestionScreen';
import { AnalyzingScreen } from './AnalyzingScreen';
import { ResultScreen } from './ResultScreen';
import { getDiagnosisReport } from '../../lib/aiScoreEngine';
import type { DiagnosisReport } from '../../lib/scoreEngine';

const PENDING_REF_KEY = 'sellscore_pending_ref';
// 로딩 화면이 너무 빨리 사라지면 "진짜 계산 중"이라는 느낌이 줄어들어
// 최소 이 시간만큼은 로딩 애니메이션을 보여준다 (실제 응답이 더 늦으면 그만큼 기다린다).
const MIN_LOADING_MS = 3500;

type Step = 'landing' | 'question' | 'loading' | 'result';

export function DiagnoseFlow() {
  const [step, setStep] = useState<Step>('landing');
  const [url, setUrl] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [searchParams] = useSearchParams();

  // /diagnose?ref=CODE 로 들어온 방문자는 나중에 회원가입할 때 초대한 사람에게 귀속시킨다.
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) localStorage.setItem(PENDING_REF_KEY, ref);
  }, [searchParams]);

  const restart = () => {
    setUrl('');
    setAnswers({});
    setReport(null);
    setStep('landing');
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
            setStep('loading');

            const startedAt = Date.now();
            getDiagnosisReport(url, submittedAnswers).then((r) => {
              const elapsed = Date.now() - startedAt;
              const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
              setTimeout(() => {
                setReport(r);
                setStep('result');
              }, remaining);
            });
          }}
          onBackToLanding={() => setStep('landing')}
        />
      )}

      {step === 'loading' && <AnalyzingScreen domain={url} />}

      {step === 'result' && report && (
        <ResultScreen report={report} answers={answers} onRestart={restart} />
      )}
    </>
  );
}
