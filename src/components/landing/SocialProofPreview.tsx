'use client';

import { useEffect, useState } from 'react';

import { MIN_SAMPLE_FOR_SOCIAL_PROOF } from '@/lib/scoring/constants';

type Summary = {
  sampleCount: number;
  minimumSample: number;
  mostCommon: { typeCode: string; count: number } | null;
  rarest: { typeCode: string; count: number } | null;
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
  const minimumSample = summary?.minimumSample ?? MIN_SAMPLE_FOR_SOCIAL_PROOF;
  const hasEnough = sampleCount >= minimumSample;

  return (
    <section className="tea-rise-in mt-8 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 md:grid-cols-2" style={{ animationDelay: '180ms' }}>
      <article className="tea-card rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <p className="text-xs text-slate-400">Most common this week</p>
        <p className="mt-1 text-2xl font-black text-cyan-200">
          {hasEnough ? summary?.mostCommon?.typeCode ?? '—' : 'Warming up'}
        </p>
        <p className="text-xs text-slate-400">{sampleCount} reveals in last 7 days</p>
      </article>
      <article className="tea-card rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <p className="text-xs text-slate-400">Rarest this week</p>
        <p className="mt-1 text-2xl font-black text-orange-200">
          {hasEnough ? summary?.rarest?.typeCode ?? '—' : 'Collecting data'}
        </p>
        <p className="text-xs text-slate-400">Stats unlock after {minimumSample} weekly reveals</p>
      </article>
    </section>
  );
}
