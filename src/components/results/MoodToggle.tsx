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
    <div className="relative mx-auto flex w-full max-w-md items-center justify-between gap-4">
      <MoodButton
        label="Angel mode"
        tooltip="Keep it nice — the polished read."
        active={!isIntrusive}
        onClick={() => onChange('normal')}
        accent="cyan"
      >
        <AngelIcon />
      </MoodButton>

      <div className="pointer-events-none flex-1">
        <LobsterMascot
          variant="hero"
          className={`mx-auto w-40 select-none ${isIntrusive ? 'tea-mascot-evil' : 'tea-mascot-bob'} drop-shadow-[0_20px_30px_rgba(255,98,74,0.3)]`}
        />
      </div>

      <MoodButton
        label="Devil mode"
        tooltip="Spill the intrusive thoughts."
        active={isIntrusive}
        onClick={() => onChange('intrusive')}
        accent="rose"
      >
        <DevilIcon />
      </MoodButton>
    </div>
  );
}

function MoodButton({
  label,
  tooltip,
  active,
  onClick,
  accent,
  children,
}: {
  label: string;
  tooltip: string;
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
      className={`group relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-900/60 ring-1 ring-white/10 backdrop-blur transition duration-300 hover:scale-105 sm:h-24 sm:w-24 ${
        active ? `ring-2 ${ringColor}` : `${idleColor}`
      }`}
    >
      <span className={`${animClass} flex h-full w-full items-center justify-center`}>
        {children}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950/95 px-3 py-1 text-xs font-medium text-slate-100 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {tooltip}
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
        d="M12 30 Q 6 34 10 40 Q 14 38 16 36"
        fill="#fef3c7"
        stroke="#facc15"
        strokeWidth="1.5"
      />
      <path
        d="M52 30 Q 58 34 54 40 Q 50 38 48 36"
        fill="#fef3c7"
        stroke="#facc15"
        strokeWidth="1.5"
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
        d="M30 40 L 32 43 L 34 40"
        fill="#fafafa"
        stroke="#1f0a0a"
        strokeWidth="0.8"
      />
    </svg>
  );
}
