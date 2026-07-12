import { Icon } from './Icon';
import { categoryLabel } from '../../config/blog';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Icon>['name'];

// ============================================================
// 블로그 배너 — 실제 사진 대신, 카테고리별 그라디언트 + 아이콘 워터마크로
// neilpatel.com 블로그 카드/아티클 배너의 "이미지 위 텍스트" 구조를 재현한다.
// ============================================================

const CATEGORY_VISUALS: Record<string, { icon: IconName; from: string; to: string }> = {
  'side-hustle': { icon: 'spark', from: '#0064ff', to: '#a389ff' },
  'landing-diagnosis': { icon: 'search', from: '#ff6b4a', to: '#ffb347' },
  copywriting: { icon: 'target', from: '#00c2a8', to: '#0064ff' },
  conversion: { icon: 'chart', from: '#a389ff', to: '#ff6bd6' },
  design: { icon: 'shield', from: '#5b9bff', to: '#00e0ff' },
  seo: { icon: 'search', from: '#ffb347', to: '#ff6b4a' },
  'case-study': { icon: 'check', from: '#00c2a8', to: '#5b9bff' },
  benchmark: { icon: 'users', from: '#a389ff', to: '#0064ff' },
};

const DEFAULT_VISUAL = { icon: 'spark' as IconName, from: '#0064ff', to: '#a389ff' };

interface BlogBannerProps {
  category: string;
  title?: string;
  isNew?: boolean;
  compact?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function BlogBanner({
  category,
  title,
  isNew,
  compact,
  className = '',
  ariaLabel,
}: BlogBannerProps) {
  const v = CATEGORY_VISUALS[category] || DEFAULT_VISUAL;

  return (
    <div
      role="img"
      aria-label={ariaLabel || title || categoryLabel(category)}
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${v.from}2e, ${v.to}1f), #08080c` }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(circle at 78% 22%, ${v.to}5c, transparent 55%),` +
            `radial-gradient(circle at 18% 85%, ${v.from}5c, transparent 50%)`,
        }}
      />
      <div
        className="absolute text-white/[0.14]"
        style={{ right: compact ? -14 : -18, bottom: compact ? -14 : -22 }}
      >
        <Icon name={v.icon} size={compact ? 76 : 140} />
      </div>

      <span className="absolute top-3 left-3 text-white/80 text-[10px] font-semibold tracking-[0.08em] uppercase bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
        {categoryLabel(category)}
      </span>
      {isNew && (
        <span className="absolute top-3 right-3 bg-gradient-to-r from-[#ff6b4a] to-[#ffb347] text-white text-[10px] font-bold tracking-[0.05em] px-2.5 py-1 rounded-full shadow-[0_2px_10px_-2px_rgba(255,107,74,0.6)]">
          NEW
        </span>
      )}

      {title && (
        <p
          className={`absolute left-4 right-4 bottom-3.5 text-white font-bold leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] ${
            compact ? 'text-[15px] line-clamp-2' : 'text-[22px] sm:text-[28px] line-clamp-3 max-w-2xl'
          }`}
        >
          {title}
        </p>
      )}
    </div>
  );
}
