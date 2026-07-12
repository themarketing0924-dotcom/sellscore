// ============================================================
// 미니 아이콘 세트 — Toss류 서비스에서 흔히 쓰는
// "부드러운 색 배지 + 얇은 라인 아이콘" 스타일을 직접 SVG로 구현.
// 외부 아이콘 폰트/이미지 없이 stroke 기반으로 그린다.
// ============================================================

import type { ReactNode } from 'react';

type IconName =
  | 'shield'
  | 'search'
  | 'users'
  | 'clock'
  | 'target'
  | 'chart'
  | 'lock'
  | 'unlock'
  | 'share'
  | 'refresh'
  | 'spark'
  | 'check';

const PATHS: Record<IconName, ReactNode> = {
  shield: (
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
  ),
  search: (
    <>
      <circle cx={10.5} cy={10.5} r={6.5} />
      <path d="M20 20l-4.5-4.5" strokeLinecap="round" />
    </>
  ),
  users: (
    <>
      <circle cx={9} cy={8} r={3.2} />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <path d="M16 4.2a3.2 3.2 0 010 6.2" strokeLinecap="round" />
      <path d="M18.5 14.3c2 .6 3.5 2.7 3.5 5.7" strokeLinecap="round" />
    </>
  ),
  clock: (
    <>
      <circle cx={12} cy={12} r={8.5} />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  target: (
    <>
      <circle cx={12} cy={12} r={8.5} />
      <circle cx={12} cy={12} r={4.5} />
      <circle cx={12} cy={12} r={0.8} fill="currentColor" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10" strokeLinecap="round" />
      <path d="M12 20V4" strokeLinecap="round" />
      <path d="M20 20v-7" strokeLinecap="round" />
      <path d="M4 20h16" strokeLinecap="round" />
    </>
  ),
  lock: (
    <>
      <rect x={5} y={11} width={14} height={9} rx={2.5} />
      <path d="M8 11V7.5a4 4 0 018 0V11" strokeLinecap="round" />
    </>
  ),
  unlock: (
    <>
      <rect x={5} y={11} width={14} height={9} rx={2.5} />
      <path d="M8 11V7.5a4 4 0 017.4-2.1" strokeLinecap="round" />
    </>
  ),
  share: (
    <>
      <circle cx={18} cy={5} r={2.6} />
      <circle cx={6} cy={12} r={2.6} />
      <circle cx={18} cy={19} r={2.6} />
      <path d="M8.3 10.6l7.4-4.2M8.3 13.4l7.4 4.2" strokeLinecap="round" />
    </>
  ),
  refresh: (
    <>
      <path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3" strokeLinecap="round" />
      <path d="M18 4v4h-4M6 20v-4h4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  spark: (
    <path
      d="M12 3l1.8 5.6L19 10.4l-5.2 1.8L12 18l-1.8-5.8L5 10.4l5.2-1.8z"
      strokeLinejoin="round"
    />
  ),
  check: <path d="M5 13l4.5 4.5L19 8" strokeLinecap="round" strokeLinejoin="round" />,
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 18, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}

const TINTS: Record<string, string> = {
  blue: 'bg-[#0064FF]/12 text-[#5b9bff]',
  emerald: 'bg-emerald-400/12 text-emerald-300',
  amber: 'bg-amber-400/12 text-amber-300',
  rose: 'bg-rose-400/12 text-rose-300',
  neutral: 'bg-white/8 text-white/70',
};

interface IconBadgeProps {
  name: IconName;
  tint?: keyof typeof TINTS;
  size?: 'sm' | 'md' | 'lg';
}

export function IconBadge({ name, tint = 'blue', size = 'md' }: IconBadgeProps) {
  const box =
    size === 'sm'
      ? 'w-8 h-8 rounded-[10px]'
      : size === 'lg'
        ? 'w-16 h-16 rounded-[20px]'
        : 'w-11 h-11 rounded-[14px]';
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 30 : 20;
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${box} ${TINTS[tint]}`}>
      <Icon name={name} size={iconSize} />
    </span>
  );
}
