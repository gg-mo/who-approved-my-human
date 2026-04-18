import { useId } from 'react';
import type { CSSProperties } from 'react';

import { getTypeFigureSpec } from '@/lib/figures/manifest';

type TypeFigureProps = {
  typeCode: string;
  className?: string;
  style?: CSSProperties;
};

function renderMouth(mood: 'cheerful' | 'focused' | 'curious' | 'intense') {
  if (mood === 'focused') {
    return <line x1="84" y1="108" x2="136" y2="108" stroke="#111827" strokeWidth="5" strokeLinecap="round" />;
  }

  if (mood === 'curious') {
    return (
      <path
        d="M82 108 Q110 130 138 104"
        stroke="#111827"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
    );
  }

  if (mood === 'intense') {
    return (
      <path d="M84 114 Q110 90 136 114" stroke="#111827" strokeWidth="5" fill="none" strokeLinecap="round" />
    );
  }

  return <path d="M82 108 Q110 126 138 108" stroke="#111827" strokeWidth="5" fill="none" strokeLinecap="round" />;
}

function renderAccessory(accessory: 'spark' | 'badge' | 'compass' | 'clipboard' | 'megaphone' | 'shield', accent: string) {
  if (accessory === 'spark') {
    return <path d="M30 38 L40 48 L30 58 L20 48 Z" fill={accent} />;
  }

  if (accessory === 'badge') {
    return <circle cx="30" cy="48" r="10" fill={accent} />;
  }

  if (accessory === 'compass') {
    return (
      <g>
        <circle cx="30" cy="48" r="10" fill="none" stroke={accent} strokeWidth="4" />
        <path d="M30 40 L34 52 L22 56 Z" fill={accent} />
      </g>
    );
  }

  if (accessory === 'clipboard') {
    return (
      <rect x="18" y="36" width="24" height="28" rx="4" fill="none" stroke={accent} strokeWidth="4" />
    );
  }

  if (accessory === 'megaphone') {
    return <path d="M14 46 L38 36 L38 60 L14 50 Z" fill={accent} />;
  }

  return <path d="M30 36 L40 44 L37 58 L23 58 L20 44 Z" fill={accent} />;
}

export function TypeFigure({ typeCode, className = '', style }: TypeFigureProps) {
  const spec = getTypeFigureSpec(typeCode);
  const gradientId = useId();

  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 220 220"
      role="img"
      aria-label={`Type figure for ${spec.typeCode}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={spec.palette.primary} />
          <stop offset="100%" stopColor={spec.palette.secondary} />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="220" height="220" rx="28" fill={spec.palette.background} />
      <circle cx="110" cy="110" r="62" fill={`url(#${gradientId})`} />
      <circle cx="110" cy="110" r="46" fill="#ffffff" opacity="0.18" />

      {renderAccessory(spec.accessory, spec.palette.accent)}

      <circle cx="88" cy="92" r="8" fill="#111827" />
      <circle cx="132" cy="92" r="8" fill="#111827" />
      <circle cx="86" cy="90" r="2" fill="#ffffff" />
      <circle cx="130" cy="90" r="2" fill="#ffffff" />

      {spec.mood === 'intense' ? (
        <>
          <path d="M76 78 L94 84" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
          <path d="M144 78 L126 84" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : null}

      {renderMouth(spec.mood)}

      <text x="110" y="196" textAnchor="middle" fill="#e2e8f0" fontSize="16" fontWeight="700">
        {spec.typeCode}
      </text>
    </svg>
  );
}
