import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';
import { useSeo } from '../../hooks/useSeo';
import { IconBadge } from './Icon';

// ============================================================
// 토스 결제창 성공 후 리다이렉트되는 페이지
// ============================================================
// 토스는 여기로 paymentKey/orderId/amount만 돌려준다 — 실제 승인(청구 확정)은
// 이 페이지가 confirmTossPayment 함수를 호출해야 완료된다.
// ============================================================

type Status = 'confirming' | 'success' | 'error';

export function PaymentSuccessPage() {
  useSeo({ title: '결제 확인 중 | 세일즈스코어', description: '결제를 승인하고 있습니다.' });

  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status>('confirming');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = params.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setErrorMessage('결제 정보가 올바르지 않습니다.');
      return;
    }

    const confirm = httpsCallable(functions, 'confirmTossPayment', { timeout: 30000 });
    confirm({ paymentKey, orderId, amount: Number(amount) })
      .then(() => setStatus('success'))
      .catch((err) => {
        console.error('[결제 승인 실패]', err);
        setStatus('error');
        setErrorMessage(err?.message || '결제 승인 중 문제가 발생했습니다.');
      });
  }, [params]);

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
      {status === 'confirming' && (
        <>
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-6" />
          <p className="text-white text-[16px] font-bold">결제를 승인하고 있습니다…</p>
          <p className="text-white/40 text-[13px] mt-2">잠시만 기다려 주세요. 창을 닫지 마세요.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <IconBadge name="check" tint="emerald" size="lg" />
          <p className="text-white text-[19px] font-bold mt-5 mb-2">결제가 완료되었습니다</p>
          <p className="text-white/45 text-[14px] mb-7 max-w-sm">
            결제가 정상적으로 승인됐습니다. 진단 내역에서 바로 확인하실 수 있어요.
          </p>
          <Link
            to="/diagnose/history"
            className="h-12 px-7 rounded-full bg-white text-black font-bold text-[14px] hover:bg-white/90 transition-colors no-underline flex items-center"
          >
            내 진단 내역으로 이동
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <IconBadge name="shield" tint="rose" size="lg" />
          <p className="text-white text-[19px] font-bold mt-5 mb-2">결제 승인에 실패했습니다</p>
          <p className="text-white/45 text-[14px] mb-7 max-w-sm">{errorMessage}</p>
          <Link
            to="/pricing"
            className="h-12 px-7 rounded-full bg-white text-black font-bold text-[14px] hover:bg-white/90 transition-colors no-underline flex items-center"
          >
            요금제로 돌아가기
          </Link>
        </>
      )}
    </section>
  );
}
