import { useId } from 'react';
import type { CSSProperties } from 'react';

import { LOBSTER_VARIANTS, type LobsterVariant } from '@/lib/figures/manifest';

type LobsterMascotProps = {
  className?: string;
  style?: CSSProperties;
  variant?: LobsterVariant;
};

export function LobsterMascot({ className = '', style, variant = 'hero' }: LobsterMascotProps) {
  const gradientId = useId();
  const colors = LOBSTER_VARIANTS[variant];

  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 220 220"
      role="img"
      aria-label="Cartoon lobster mascot"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={colors.shellFrom} />
          <stop offset="100%" stopColor={colors.shellTo} />
        </linearGradient>
      </defs>

      <ellipse cx="110" cy="120" rx="48" ry="62" fill={`url(#${gradientId})`} />
      <ellipse cx="110" cy="120" rx="32" ry="48" fill={colors.blush} opacity="0.45" />

      <circle cx="92" cy="88" r="8" fill="#111827" />
      <circle cx="128" cy="88" r="8" fill="#111827" />
      <circle cx="90" cy="86" r="2" fill="#ffffff" />
      <circle cx="126" cy="86" r="2" fill="#ffffff" />

      <path
        d={variant === 'bubble' ? 'M95 112 Q110 122 125 112' : 'M95 110 Q110 120 125 110'}
        stroke="#111827"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M64 104 C20 80 22 40 52 34 C65 30 74 38 72 50 C98 52 95 84 64 104 Z"
        fill={colors.claw}
      />
      <path
        d="M156 104 C200 80 198 40 168 34 C155 30 146 38 148 50 C122 52 125 84 156 104 Z"
        fill={colors.claw}
      />

      <path d="M72 146 Q40 176 44 204" stroke="#ff7a59" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M148 146 Q180 176 176 204" stroke="#ff7a59" strokeWidth="10" fill="none" strokeLinecap="round" />

      <circle cx="76" cy="200" r="7" fill="#111827" opacity="0.18" />
      <circle cx="144" cy="200" r="7" fill="#111827" opacity="0.18" />
    </svg>
  );
}
