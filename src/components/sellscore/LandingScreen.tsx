import { useState } from 'react';
import { motion } from 'framer-motion';
import { BRAND, TRUST_BADGES } from '../../config/sellscore';
import { Icon } from './Icon';

interface LandingScreenProps {
  onSubmit: (url: string) => void;
}

const BADGE_ICONS = ['shield', 'search', 'check'] as const;

export function LandingScreen({ onSubmit }: LandingScreenProps) {
  const [url, setUrl] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = url.trim().length > 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onSubmit(url.trim());
  };

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Apple 제품 페이지풍 배경 글로우 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 50% 22%, rgba(0,100,255,0.16), transparent 70%),' +
            'radial-gradient(ellipse 40% 35% at 78% 65%, rgba(88,28,255,0.10), transparent 70%),' +
            'radial-gradient(ellipse 40% 35% at 18% 70%, rgba(0,220,180,0.08), transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-2xl text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.p
          className="text-white/45 text-[12px] sm:text-[13px] tracking-[0.3em] uppercase mb-7 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          {BRAND.nameEn}
        </motion.p>

        <h1
          className="text-white font-bold leading-[1.08] tracking-[-0.035em] mb-5"
          style={{ fontSize: 'clamp(34px, 6.4vw, 64px)' }}
        >
          당신 사이트,
          <br />
          <span className="gradient-text-animated">팔리는 구조</span>입니까?
        </h1>

        <p className="text-white/55 text-[16px] sm:text-[19px] font-medium mb-12">
          {BRAND.subTagline}
        </p>

        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
              <Icon name="search" size={17} />
            </span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="진단받을 사이트 URL을 입력하세요 (예: mysite.com)"
              className="w-full h-14 pl-11 pr-5 rounded-full bg-white/[0.07] border border-white/10 text-white text-[14px] sm:text-[15px] placeholder:text-white/30 focus:outline-none focus:border-[#5b9bff]/60 focus:bg-white/[0.09] transition-all"
            />
          </div>
          <button
            type="submit"
            className="h-14 px-8 rounded-full font-semibold text-[14px] sm:text-[15px] text-white border-none cursor-pointer whitespace-nowrap transition-transform active:scale-[0.97] hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #0064ff, #4f8bff)',
              boxShadow: '0 8px 24px -8px rgba(0,100,255,0.55)',
            }}
          >
            {BRAND.ctaLabel}
          </button>
        </motion.form>

        {touched && !isValid && (
          <p className="text-rose-400 text-[13px] mb-4">URL을 입력해주세요.</p>
        )}

        <p className="text-white/30 text-[12px] mb-16">GA4 연결 시 실측 데이터 우선 반영</p>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          {TRUST_BADGES.map((badge, i) => (
            <span
              key={badge}
              className="text-white/45 text-[11px] sm:text-[12px] font-medium flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full pl-2 pr-3.5 py-1.5"
            >
              <Icon name={BADGE_ICONS[i % BADGE_ICONS.length]} size={13} className="text-[#5b9bff]" />
              {badge}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
