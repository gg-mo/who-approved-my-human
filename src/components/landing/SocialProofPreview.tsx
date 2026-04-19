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
    <section
      className="tea-rise-in mt-8 flex flex-col items-center gap-2 rounded-3xl border border-white/10 bg-white/5 p-6 text-center"
      style={{ animationDelay: '180ms' }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Tea spilled so far
      </p>
      <p className="text-5xl font-black text-cyan-200 sm:text-6xl">{sampleCount}</p>
      <p className="text-sm text-slate-300">
        {sampleCount === 1 ? 'cup of tea and counting.' : 'cups of tea and counting.'}
      </p>
    </section>
  );
}
