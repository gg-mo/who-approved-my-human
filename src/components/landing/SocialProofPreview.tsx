'use client';

import { useEffect, useState } from 'react';

type Summary = {
  sampleCount: number;
};

export function SocialProofPreview() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    let active = true;

    fetch('/api/stats/type-distribution')
      .then((response) => response.json())
      .then((payload) => {
        if (!active) {
          return;
        }

        setSummary(payload);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const sampleCount = summary?.sampleCount ?? 0;

  return (
    <div
      className="tea-rise-in mx-auto mt-8 flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-200 backdrop-blur"
      style={{ animationDelay: '180ms' }}
    >
      <TeaCupIcon />
      <span className="whitespace-nowrap">
        <strong className="font-bold text-cyan-200">{sampleCount}</strong>{' '}
        {sampleCount === 1 ? 'cup' : 'cups'} of tea spilled so far
      </span>
    </div>
  );
}

function TeaCupIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-5 w-5 text-cyan-200" aria-hidden>
      <g className="tea-steam" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.55">
        <path d="M24 18 Q 20 12 24 6" />
        <path d="M34 20 Q 30 14 34 8" />
      </g>
      <path
        d="M12 26 L 16 52 Q 17 58 23 58 L 41 58 Q 47 58 48 52 L 52 26 Z"
        fill="currentColor"
        opacity="0.85"
      />
      <ellipse cx="32" cy="26" rx="20" ry="2.8" fill="#0f172a" />
      <path
        d="M50 32 Q 58 34 56 44 Q 54 48 48 46"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
