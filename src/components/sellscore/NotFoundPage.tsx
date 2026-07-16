import { Link } from 'react-router-dom';
import { useSeo } from '../../hooks/useSeo';

export function NotFoundPage() {
  useSeo({
    title: '페이지를 찾을 수 없습니다 | 세일즈스코어',
    description: '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
  });

  return (
    <section className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-white/30 text-[13px] tracking-[0.2em] uppercase mb-4 font-semibold">404</p>
      <h1 className="text-white font-black text-[28px] sm:text-[34px] mb-3">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-white/50 text-[14px] mb-8 max-w-sm">
        주소가 잘못됐거나, 페이지가 이동되었을 수 있어요.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center h-12 px-7 rounded-full font-semibold text-[14px] text-white no-underline transition-transform active:scale-[0.97] hover:brightness-110"
        style={{
          background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
          boxShadow: '0 8px 24px -8px rgba(0,100,255,0.55)',
        }}
      >
        홈으로 돌아가기
      </Link>
    </section>
  );
}
