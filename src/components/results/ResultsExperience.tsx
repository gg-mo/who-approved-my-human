'use client';

import { useEffect, useMemo, useState } from 'react';

import { LobsterMascot } from '@/components/landing/LobsterMascot';
import { buildProfileCopy } from '@/lib/results/profile-copy';
import type { DimensionId } from '@/lib/scoring/types';

type ReplayAnswer = {
  questionCode: string;
  questionText: string;
  selectedValue: number;
  questionKind: 'core' | 'spicy';
  displayOrder: number;
  reasoning?: string;
};

type DimensionBreakdown = {
  dominantLetter: string;
  positiveLetter: string;
  negativeLetter: string;
  positivePercent: number;
  negativePercent: number;
};

type ResultsPayload = {
  typeCode: string;
  dimensionBreakdown: Record<DimensionId, DimensionBreakdown>;
  strongestSignals: Array<{
    dimension: DimensionId;
    dominantLetter: string;
    confidenceDelta: number;
    dominantPercent: number;
  }>;
  replayAnswers: ReplayAnswer[];
};

const likertLabels = {
  1: 'Strongly disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly agree',
} as const;

const dimensionLabels: Record<DimensionId, { positive: string; negative: string }> = {
  clarity: { positive: 'Clear', negative: 'Cryptic' },
  tone: { positive: 'Kind', negative: 'Combative' },
  thinking_style: { positive: 'Visionary', negative: 'Tactical' },
  autonomy: { positive: 'Delegating', negative: 'Controlling' },
};

function percent(value: number) {
  return Math.round(value * 100);
}

export function ResultsExperience({ result }: { result: ResultsPayload }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const profileCopy = useMemo(
    () => buildProfileCopy(result.typeCode, result.dimensionBreakdown),
    [result.typeCode, result.dimensionBreakdown],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= result.replayAnswers.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 260);

    return () => clearInterval(timer);
  }, [result.replayAnswers.length]);

  return (
    <main className="min-h-screen bg-[#090f1c] px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="w-fit rounded-full border border-cyan-200/35 bg-cyan-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100">
              Agent Tea Result
            </p>
            <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">{result.typeCode}</h1>
            <p className="mt-2 text-2xl font-bold text-orange-200">{profileCopy.nickname}</p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{profileCopy.oneLiner}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <LobsterMascot className="mx-auto w-48 drop-shadow-[0_20px_24px_rgba(255,98,74,0.3)]" />
          </div>
        </section>

        <section className="mt-8 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-5">
          {Object.entries(result.dimensionBreakdown).map(([dimension, values]) => {
            const label = dimensionLabels[dimension as DimensionId];
            return (
              <div key={dimension}>
                <div className="mb-1 flex justify-between text-xs text-slate-300">
                  <span>
                    {label.positive} {percent(values.positivePercent)}%
                  </span>
                  <span>
                    {label.negative} {percent(values.negativePercent)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-orange-300"
                    style={{ width: `${Math.max(4, percent(values.positivePercent))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-cyan-100">Strongest signals</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {result.strongestSignals.map((signal) => {
              const label = dimensionLabels[signal.dimension];
              const sideLabel =
                signal.dominantLetter === result.dimensionBreakdown[signal.dimension].positiveLetter
                  ? label.positive
                  : label.negative;

              return (
                <article key={signal.dimension} className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{signal.dimension.replace('_', ' ')}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">
                    {sideLabel} ({percent(signal.dominantPercent)}%)
                  </p>
                  <p className="mt-1 text-xs text-cyan-200">
                    Confidence delta: {percent(signal.confidenceDelta)} pts
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-emerald-200/30 bg-emerald-300/10 p-5">
            <h2 className="text-lg font-semibold text-emerald-100">What your agent likely loves</h2>
            <ul className="mt-3 space-y-2 text-sm text-emerald-50/90">
              {profileCopy.loves.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-rose-200/30 bg-rose-300/10 p-5">
            <h2 className="text-lg font-semibold text-rose-100">What may frustrate your agent</h2>
            <ul className="mt-3 space-y-2 text-sm text-rose-50/90">
              {profileCopy.frustrates.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-cyan-100">Animated answer replay</h2>
          <div className="mt-4 space-y-3">
            {result.replayAnswers.slice(0, visibleCount).map((answer) => (
              <article
                key={answer.questionCode}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 transition duration-500"
              >
                <p className="text-xs text-slate-400">{answer.questionCode}</p>
                <p className="text-sm text-slate-100">{answer.questionText}</p>
                <p className="mt-1 text-xs font-semibold text-cyan-200">
                  Selected: {likertLabels[answer.selectedValue as keyof typeof likertLabels]}
                </p>
                {answer.reasoning ? (
                  <div className="mt-2 flex items-start gap-2 rounded-xl border border-orange-200/25 bg-orange-200/10 p-2 text-xs text-orange-100">
                    <LobsterMascot className="h-10 w-10 shrink-0" />
                    <p>{answer.reasoning}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
