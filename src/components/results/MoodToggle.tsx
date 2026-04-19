'use client';

import { LobsterMascot } from '@/components/landing/LobsterMascot';
import type { NarrativeMode } from '@/lib/results/copy-content';

type MoodToggleProps = {
  mode: NarrativeMode;
  onChange: (next: NarrativeMode) => void;
};

export function MoodToggle({ mode, onChange }: MoodToggleProps) {
  const isIntrusive = mode === 'intrusive';

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <LobsterMascot
          variant="hero"
          className="tea-mascot-bob w-64 select-none drop-shadow-[0_28px_40px_rgba(255,98,74,0.35)] sm:w-72"
        />
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col items-center gap-3">
          <MoodButton
            label="Angel mode"
            active={!isIntrusive}
            onClick={() => onChange('normal')}
            accent="cyan"
          >
            <AngelIcon />
          </MoodButton>
          <CaptionPill active={!isIntrusive} accent="cyan">Keep it nice</CaptionPill>
        </div>

        <div className="flex flex-col items-center gap-3">
          <MoodButton
            label="Devil mode"
            active={isIntrusive}
            onClick={() => onChange('intrusive')}
            accent="rose"
          >
            <DevilIcon />
          </MoodButton>
          <CaptionPill active={isIntrusive} accent="rose">Spill the tea</CaptionPill>
        </div>
      </div>
    </div>
  );
}

function CaptionPill({
  active,
  accent,
  children,
}: {
  active: boolean;
  accent: 'cyan' | 'rose';
  children: React.ReactNode;
}) {
  const activeStyle =
    accent === 'cyan'
      ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-50'
      : 'border-rose-400/60 bg-rose-400/15 text-rose-50';
  return (
    <span
      aria-hidden={!active}
      className={`pointer-events-none whitespace-nowrap rounded-full border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-opacity duration-300 ${
        active ? `opacity-100 ${activeStyle}` : 'border-transparent bg-transparent text-transparent opacity-0'
      }`}
    >
      {children}
    </span>
  );
}

function MoodButton({
  label,
  active,
  onClick,
  accent,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent: 'cyan' | 'rose';
  children: React.ReactNode;
}) {
  const ringColor =
    accent === 'cyan'
      ? 'ring-cyan-300/60 shadow-[0_0_40px_-8px_rgba(34,211,238,0.6)]'
      : 'ring-rose-400/70 shadow-[0_0_40px_-8px_rgba(244,63,94,0.7)]';
  const idleColor = accent === 'cyan' ? 'text-cyan-200/80' : 'text-rose-200/80';
  const animClass = accent === 'cyan' ? 'tea-mood-float' : 'tea-mood-sway';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-900/60 ring-1 ring-white/10 backdrop-blur transition duration-300 hover:scale-105 sm:h-24 sm:w-24 ${
        active ? `ring-2 ${ringColor}` : `${idleColor}`
      }`}
    >
      <span className={`${animClass} flex h-full w-full items-center justify-center`}>
        {children}
      </span>
    </button>
  );
}

function AngelIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-11 w-11 sm:h-14 sm:w-14" aria-hidden>
      <ellipse
        cx="32"
        cy="12"
        rx="14"
        ry="3.5"
        fill="none"
        stroke="#fde68a"
        strokeWidth="2.5"
        className="tea-halo"
      />
      <circle cx="32" cy="34" r="16" fill="#fef3c7" stroke="#facc15" strokeWidth="2" />
      <g fill="#1f2937">
        <circle cx="26" cy="32" r="1.8" />
        <circle cx="38" cy="32" r="1.8" />
      </g>
      <path
        d="M25 39 Q 32 44 39 39"
        fill="none"
        stroke="#1f2937"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 28 Q 4 28 6 40 Q 12 34 20 34 Z"
        fill="#ffffff"
        stroke="#e2e8f0"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M46 28 Q 60 28 58 40 Q 52 34 44 34 Z"
        fill="#ffffff"
        stroke="#e2e8f0"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DevilIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-11 w-11 sm:h-14 sm:w-14" aria-hidden>
      <path
        d="M18 24 Q 14 14 22 16 Q 24 20 24 24 Z"
        fill="#b91c1c"
        stroke="#7f1d1d"
        strokeWidth="1.5"
      />
      <path
        d="M46 24 Q 50 14 42 16 Q 40 20 40 24 Z"
        fill="#b91c1c"
        stroke="#7f1d1d"
        strokeWidth="1.5"
      />
      <circle cx="32" cy="34" r="16" fill="#ef4444" stroke="#7f1d1d" strokeWidth="2" />
      <g fill="#1f0a0a">
        <ellipse cx="26" cy="31" rx="2" ry="2.4" />
        <ellipse cx="38" cy="31" rx="2" ry="2.4" />
      </g>
      <path
        d="M24 40 Q 32 46 40 40 Q 38 43 32 43 Q 26 43 24 40 Z"
        fill="#1f0a0a"
      />
      <path
        d="M28.5 40 L 30 43.2 L 31.5 40 Z"
        fill="#fafafa"
        stroke="#1f0a0a"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <path
        d="M32.5 40 L 34 43.2 L 35.5 40 Z"
        fill="#fafafa"
        stroke="#1f0a0a"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <path
        d="M48 46 Q 56 48 58 54 Q 59 57 61 56"
        fill="none"
        stroke="#7f1d1d"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M58 54 L 61 56 L 60 53 Z"
        fill="#7f1d1d"
        stroke="#7f1d1d"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
