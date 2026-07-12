import { Link } from 'react-router-dom';
import { BRAND } from '../../config/sellscore';

// ============================================================
// 공용 사이트 푸터 — 사이트맵 + 사업자 정보
// ============================================================
// 결제(토스/페이팔)를 다루는 사이트라 사업자정보 표기가 필요하다.
// 대표자명·사업자등록번호·통신판매업신고·주소는 실제 값이 확정되면 채운다.
// ============================================================

export function SiteFooter() {
  return (
    <footer className="px-6 pt-14 pb-10 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10 text-left">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-white/80 font-bold text-[13px]">{BRAND.name}</span>
          </div>
          <p className="text-white/30 text-[12px] leading-relaxed">{BRAND.subTagline}</p>
        </div>
        <div>
          <p className="text-white/40 text-[11px] tracking-[0.1em] uppercase mb-3 font-semibold">
            서비스
          </p>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                to="/diagnose"
                className="text-white/50 hover:text-white/80 text-[13px] no-underline transition-colors"
              >
                무료 진단
              </Link>
            </li>
            <li>
              <Link
                to="/guide"
                className="text-white/50 hover:text-white/80 text-[13px] no-underline transition-colors"
              >
                가이드
              </Link>
            </li>
            <li>
              <Link
                to="/methodology"
                className="text-white/50 hover:text-white/80 text-[13px] no-underline transition-colors"
              >
                채점 원리
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-white/40 text-[11px] tracking-[0.1em] uppercase mb-3 font-semibold">
            콘텐츠
          </p>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                to="/blog"
                className="text-white/50 hover:text-white/80 text-[13px] no-underline transition-colors"
              >
                블로그
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-white/40 text-[11px] tracking-[0.1em] uppercase mb-3 font-semibold">
            고객지원
          </p>
          <ul className="flex flex-col gap-2">
            <li className="text-white/50 text-[13px]">이메일: [고객센터 이메일 입력 예정]</li>
          </ul>
        </div>
      </div>

      <div className="max-w-5xl mx-auto border-t border-white/[0.06] pt-6">
        <p className="text-white/25 text-[11px] leading-relaxed mb-2">
          캐시홀딩스 · 대표 [대표자명 입력 예정] · 사업자등록번호 [입력 예정] · 통신판매업신고
          [입력 예정]
          <br />
          주소 [사업장 주소 입력 예정] · 고객센터 [이메일 입력 예정]
        </p>
        <p className="text-white/20 text-[11px] max-w-md leading-relaxed">{BRAND.footerNote}</p>
      </div>
    </footer>
  );
}
