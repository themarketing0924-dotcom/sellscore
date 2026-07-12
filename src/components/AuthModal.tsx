// ============================================================
// AuthModal — 로그인/회원가입 모달
// ============================================================
// 사이트 어디서든 열 수 있는 풀스크린 로그인 모달
// Google, Apple, 이메일 로그인 지원
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail, error, clearError } =
    useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onClose();
    } catch {
      // error is set by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      // error handled in context
    }
  };

  const handleApple = async () => {
    try {
      await signInWithApple();
      onClose();
    } catch {
      // error handled in context
    }
  };

  // 카카오/네이버는 Firebase 기본 제공자가 아니라 별도 REST API 키 연동이 필요하다.
  // 지금은 버튼만 노출하고, 다음 단계에서 실제 로그인 연동을 붙인다.
  const handleKakao = () => {
    alert('카카오 로그인은 API 키 연결 후 사용 가능합니다. (다음 단계에서 연동 예정)');
  };

  const handleNaver = () => {
    alert('네이버 로그인은 API 키 연결 후 사용 가능합니다. (다음 단계에서 연동 예정)');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-[90%] max-w-[420px] bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 sm:p-10"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors cursor-pointer bg-transparent border-none text-[18px]"
            >
              ✕
            </button>

            {/* Header */}
            <h2 className="text-white text-[24px] font-light tracking-[-0.02em] mb-2">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-white/40 text-[14px] mb-8">
              {mode === 'login'
                ? 'Access your neural interface dashboard.'
                : 'Start your neural-AI journey.'}
            </p>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6 text-red-400 text-[13px]">
                {error}
                <button
                  onClick={clearError}
                  className="ml-2 text-red-300 hover:text-red-100 cursor-pointer bg-transparent border-none"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Social login buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={handleGoogle}
                className="w-full h-[48px] rounded-lg bg-white/[0.07] border border-white/10 text-white text-[14px] font-medium flex items-center justify-center gap-3 hover:bg-white/[0.12] active:scale-[0.98] transition-all cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button
                onClick={handleApple}
                className="w-full h-[48px] rounded-lg bg-white/[0.07] border border-white/10 text-white text-[14px] font-medium flex items-center justify-center gap-3 hover:bg-white/[0.12] active:scale-[0.98] transition-all cursor-pointer"
              >
                <i className="bi bi-apple text-[18px]" />
                Continue with Apple
              </button>

              <button
                onClick={handleKakao}
                className="w-full h-[48px] rounded-lg bg-[#FEE500] border border-[#FEE500] text-black/85 text-[14px] font-medium flex items-center justify-center gap-3 hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.85 5.19 4.63 6.58-.2.72-.73 2.64-.84 3.05-.13.5.18.5.39.36.16-.11 2.6-1.77 3.66-2.49.7.1 1.42.16 2.16.16 5.52 0 10-3.48 10-7.66C22 6.48 17.52 3 12 3z"
                    fill="black"
                  />
                </svg>
                카카오로 계속하기
              </button>

              <button
                onClick={handleNaver}
                className="w-full h-[48px] rounded-lg bg-[#03C75A] border border-[#03C75A] text-white text-[14px] font-medium flex items-center justify-center gap-3 hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13.5 3v9.6L6.9 3H3v18h6.5v-9.6L16.1 21H21V3h-7.5z" fill="white" />
                </svg>
                네이버로 계속하기
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-[12px] uppercase tracking-[0.1em]">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-white/40 text-[12px] uppercase tracking-[0.1em] mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-[44px] bg-white/[0.05] border border-white/10 rounded-lg px-4 text-white text-[14px] placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="text-white/40 text-[12px] uppercase tracking-[0.1em] mb-2 block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full h-[44px] bg-white/[0.05] border border-white/10 rounded-lg px-4 text-white text-[14px] placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] bg-white text-black rounded-lg text-[14px] font-bold hover:bg-white/90 active:scale-[0.98] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Switch mode */}
            <p className="text-center text-white/40 text-[13px] mt-6">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  clearError();
                }}
                className="text-white/70 hover:text-white underline cursor-pointer bg-transparent border-none text-[13px]"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
