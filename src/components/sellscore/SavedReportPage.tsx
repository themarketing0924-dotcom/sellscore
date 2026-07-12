import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReport } from '../../lib/firestore';
import { generateReport, type DiagnosisReport } from '../../lib/scoreEngine';
import { ResultScreen } from './ResultScreen';

export function SavedReportPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<'loading' | 'not-found' | 'ready'>('loading');
  const [report, setReport] = useState<DiagnosisReport | null>(null);

  useEffect(() => {
    if (!reportId) return;
    getReport(reportId)
      .then((saved) => {
        if (!saved) {
          setState('not-found');
          return;
        }
        // domain+answers만 저장해뒀으므로 동일한 결정론적 엔진으로 다시 계산한다.
        setReport(generateReport(saved.domain, saved.answers));
        setState('ready');
      })
      .catch(() => setState('not-found'));
  }, [reportId]);

  if (state === 'loading') {
    return (
      <section className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-white/30 text-[13px]">불러오는 중…</p>
      </section>
    );
  }

  if (state === 'not-found' || !report) {
    return (
      <section className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-white text-[17px] font-bold mb-2">리포트를 찾을 수 없습니다</p>
        <p className="text-white/45 text-[13px] mb-7">삭제되었거나 잘못된 링크일 수 있어요.</p>
        <button
          onClick={() => navigate('/diagnose/history')}
          className="h-11 px-6 rounded-full bg-white/10 text-white/85 text-[13px] font-medium border-none cursor-pointer hover:bg-white/15 transition-colors"
        >
          내 진단 내역으로
        </button>
      </section>
    );
  }

  // answers를 넘기지 않아 ResultScreen이 이 리포트를 다시 저장하지 않도록 한다 (이미 저장된 리포트).
  return <ResultScreen report={report} onRestart={() => navigate('/diagnose')} />;
}
