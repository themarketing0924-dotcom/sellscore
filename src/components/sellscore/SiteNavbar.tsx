import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthModal } from '../AuthModal';
import { useAuth } from '../../contexts/AuthContext';
import { BRAND } from '../../config/sellscore';

// 애플 macbook-pro 페이지 상단 헤더 스펙을 그대로 따른다:
// 44px 높이, 12px 폰트, 일반 굵기, 좁은 자간, 반투명 블러 배경 + 얇은 하단 경계선.
// 애플은 모바일/아이패드 폭에서는 텍스트 메뉴 대신 항상 햄버거 아이콘으로 접는다
// (넓이가 남아도 접는다 — 터치 UX 일관성 때문). md(768px) 미만에서 동일하게 적용.
const NAV_LINKS = [
  { to: '/', label: '홈' },
  { to: '/guide', label: '가이드' },
  { to: '/blog', label: '블로그' },
  { to: '/methodology', label: '채점 원리' },
  { to: '/pricing', label: '요금제' },
];

export function SiteNavbar() {
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center bg-black/75 backdrop-blur-xl border-b border-white/10"
        style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}
      >
        <div className="w-full px-4 sm:px-6 flex items-center">
          {/* 로고 */}
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2 shrink-0 no-underline">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white font-bold" style={{ fontSize: 17 }}>
              {BRAND.name}
            </span>
          </Link>

          {/* 데스크톱 가운데 메뉴 (md 이상) */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-9">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative py-3 no-underline transition-colors font-semibold"
                  style={{ color: active ? '#fff' : 'rgba(255,255,255,0.8)' }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* 데스크톱 로그인 + 무료 진단 CTA (md 이상) */}
          <div className="hidden md:flex items-center gap-5 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/diagnose/history"
                  className="text-white/60 hover:text-white/90 transition-colors no-underline font-semibold"
                >
                  내 진단 내역
                </Link>
                <span className="text-white/60 max-w-[100px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={signOut}
                  className="text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer font-semibold"
                  style={{ fontSize: 15 }}
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer font-semibold"
                style={{ fontSize: 15 }}
              >
                로그인
              </button>
            )}
            <Link
              to="/diagnose"
              className="h-9 px-4 rounded-full text-white no-underline flex items-center font-semibold whitespace-nowrap transition-transform active:scale-[0.97] hover:brightness-110"
              style={{
                fontSize: 14,
                background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
                boxShadow: '0 4px 14px -4px rgba(0,100,255,0.55)',
              }}
            >
              무료 진단
            </Link>
          </div>

          {/* 모바일/아이패드: 햄버거 아이콘만 (md 미만) */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden ml-auto flex items-center justify-center w-8 h-8 -mr-1.5 bg-transparent border-none cursor-pointer"
            aria-label="메뉴 열기"
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </nav>

      {/* 모바일 드롭다운 메뉴 */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden fixed top-14 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col px-6 py-4">
              {NAV_LINKS.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeMenu}
                    className="py-3.5 border-b border-white/[0.06] last:border-none no-underline text-[15px] font-medium"
                    style={{ color: active ? '#fff' : 'rgba(255,255,255,0.75)' }}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-4 flex flex-col gap-2.5">
                <Link
                  to="/diagnose"
                  onClick={closeMenu}
                  className="w-full h-11 rounded-full text-white text-[14px] font-semibold no-underline flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
                    boxShadow: '0 4px 14px -4px rgba(0,100,255,0.55)',
                  }}
                >
                  무료 진단
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/diagnose/history"
                      onClick={closeMenu}
                      className="w-full h-11 rounded-full bg-white/10 text-white/85 text-[14px] font-medium border-none cursor-pointer flex items-center justify-center no-underline"
                    >
                      내 진단 내역
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        closeMenu();
                      }}
                      className="w-full h-11 rounded-full bg-white/10 text-white/85 text-[14px] font-medium border-none cursor-pointer"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setAuthOpen(true);
                      closeMenu();
                    }}
                    className="w-full h-11 rounded-full bg-white/10 text-white/85 text-[14px] font-medium border-none cursor-pointer"
                  >
                    로그인
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <motion.line
        x1="2"
        x2="16"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="1.4"
        strokeLinecap="round"
        animate={{ y1: open ? 9 : 5, y2: open ? 9 : 5, rotate: open ? 45 : 0 }}
        style={{ originX: '9px', originY: '9px' }}
        transition={{ duration: 0.2 }}
      />
      <motion.line
        x1="2"
        x2="16"
        y1="9"
        y2="9"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="1.4"
        strokeLinecap="round"
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.line
        x1="2"
        x2="16"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="1.4"
        strokeLinecap="round"
        animate={{ y1: open ? 9 : 13, y2: open ? 9 : 13, rotate: open ? -45 : 0 }}
        style={{ originX: '9px', originY: '9px' }}
        transition={{ duration: 0.2 }}
      />
    </svg>
  );
}
