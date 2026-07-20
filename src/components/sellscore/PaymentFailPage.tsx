import { Link, useSearchParams } from 'react-router-dom';
import { useSeo } from '../../hooks/useSeo';
import { IconBadge } from './Icon';

export function PaymentFailPage() {
  useSeo({ title: '결제 실패 | 세일즈스코어', description: '결제가 완료되지 않았습니다.' });

  const [params] = useSearchParams();
  const message = params.get('message') || '결제가 취소되었거나 완료되지 않았습니다.';

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
      <IconBadge name="shield" tint="rose" size="lg" />
      <p className="text-white text-[19px] font-bold mt-5 mb-2">결제가 완료되지 않았습니다</p>
      <p className="text-white/45 text-[14px] mb-7 max-w-sm">{message}</p>
      <Link
        to="/pricing"
        className="h-12 px-7 rounded-full bg-white text-black font-bold text-[14px] hover:bg-white/90 transition-colors no-underline flex items-center"
      >
        요금제로 돌아가기
      </Link>
    </section>
  );
}
