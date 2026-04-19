'use client';

import { useEffect, useMemo, useState } from 'react';

import { MoodToggle } from '@/components/results/MoodToggle';
import { TeaHomeBadge } from '@/components/shared/TeaHomeBadge';
import { type NarrativeMode } from '@/lib/results/copy-content';
import { buildProfileCopy, getDimensionLabels } from '@/lib/results/profile-copy';
import { getTypeContent } from '@/lib/results/type-content';
import type { DimensionId } from '@/lib/scoring/types';

type ReplayAnswer = {
  questionCode: string;
  questionText: string;
  selectedValue: number;
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
  tieFlags: Record<DimensionId, boolean>;
  replayAnswers: ReplayAnswer[];
  evidence?: {
    strongestSupport: Array<{
      questionCode: string;
      questionText: string;
      dimension: DimensionId;
      supportScore: number;
      contradictionScore: number;
      selectedValue: number;
      reasoning?: string;
    }>;
    strongestContradictions: Array<{
      questionCode: string;
      questionText: string;
      dimension: DimensionId;
      supportScore: number;
      contradictionScore: number;
      selectedValue: number;
      reasoning?: string;
    }>;
  };
};

type SocialProof = {
  sampleCount: number;
  minimumSample: number;
  mostCommon: { typeCode: string; count: number } | null;
  rarest: { typeCode: string; count: number } | null;
};

const DIMENSION_ORDER: DimensionId[] = ['clarity', 'tone', 'thinking_style', 'autonomy'];

const AXIS_BLURBS: Record<
  DimensionId,
  { positive: string; negative: string }
> = {
  clarity: {
    positive: 'You usually say what you mean.',
    negative: 'You leave the brief open and let the agent fill the gaps.',
  },
  tone: {
    positive: 'You are constructive, even when demanding change.',
    negative: 'You are direct — padding gets trimmed off.',
  },
  thinking_style: {
    positive: 'You lead with direction and taste.',
    negative: 'You head straight for execution and ship.',
  },
  autonomy: {
    positive: 'You hand over the work and let it happen.',
    negative: 'You stay close enough to shape the result in real time.',
  },
};

function percent(value: number) {
  return Math.round(value * 100);
}

function formatDimensionName(dimension: DimensionId) {
  return dimension === 'thinking_style' ? 'Thinking Style' : dimension.charAt(0).toUpperCase() + dimension.slice(1);
}

export function ResultsExperience({
  result,
  sessionId,
  socialProof,
}: {
  result: ResultsPayload;
  sessionId: string;
  socialProof?: SocialProof;
}) {
  const [mode, setMode] = useState<NarrativeMode>('normal');
  const [quoteCopyState, setQuoteCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const typeContent = useMemo(() => getTypeContent(result.typeCode), [result.typeCode]);

  const profileCopy = useMemo(
    () =>
      buildProfileCopy({
        typeCode: result.typeCode,
        breakdown: result.dimensionBreakdown,
        strongestSignals: result.strongestSignals,
        tieFlags: result.tieFlags,
        mode,
      }),
    [mode, result.dimensionBreakdown, result.strongestSignals, result.tieFlags, result.typeCode],
  );
  const dimensionLabels = useMemo(() => getDimensionLabels(mode), [mode]);
  useEffect(() => {
    if (profileCopy.moderation.rewriteCount <= 0) {
      return;
    }

    void recordEvent('moderation_rewrite', {
      typeCode: result.typeCode,
      mode,
      rewriteCount: profileCopy.moderation.rewriteCount,
      highestSeverity: profileCopy.moderation.highestSeverity,
      terms: profileCopy.moderation.terms,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, profileCopy.moderation.rewriteCount]);

  async function recordEvent(eventName: string, eventPayload?: Record<string, unknown>) {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, sessionId, eventPayload }),
      });
    } catch {
      // Non-blocking analytics.
    }
  }

  async function copySignatureQuote() {
    try {
      const label = mode === 'intrusive' ? 'Intrusive thoughts' : 'Out loud';
      const quote = mode === 'intrusive' ? typeContent.intrusiveQuote : typeContent.outLoudQuote;
      await navigator.clipboard.writeText(`${label}: "${quote}" — ${result.typeCode} ${typeContent.normalName}`);
      setQuoteCopyState('copied');
      window.setTimeout(() => setQuoteCopyState('idle'), 2200);
      await recordEvent('share_click', { mode, action: 'copy_quote', typeCode: result.typeCode });
    } catch {
      setQuoteCopyState('error');
    }
  }

  const isIntrusive = mode === 'intrusive';
  const displayName = isIntrusive ? typeContent.intrusiveName : typeContent.normalName;
  const akaName = isIntrusive ? typeContent.normalName : typeContent.intrusiveName;
  const mainDescription = isIntrusive ? typeContent.intrusiveDescription : typeContent.normalDescription;
  const modeLabel = isIntrusive ? 'What your agent is actually thinking' : 'What your agent would say';

  return (
    <main
      className={`min-h-screen px-6 pb-12 pt-24 text-slate-100 transition-colors duration-500 sm:px-10 sm:pt-28 ${
        isIntrusive ? 'tea-mood-intrusive' : 'tea-mood-normal'
      }`}
      style={{
        background: isIntrusive
          ? 'linear-gradient(145deg, #1a0612 0%, #2b0822 45%, #420f30 100%)'
          : 'linear-gradient(145deg, var(--tea-bg-deep) 0%, var(--tea-bg-mid) 45%, var(--tea-bg-glow) 100%)',
        transition: 'background 500ms ease',
      }}
    >
      <TeaHomeBadge />
      <div className="mx-auto max-w-6xl space-y-12">
        {/* 1. Hero reveal */}
        <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="tea-rise-in">
            <p
              className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                isIntrusive
                  ? 'border-rose-300/40 bg-rose-400/10 text-rose-100'
                  : 'border-cyan-200/35 bg-cyan-200/10 text-cyan-100'
              }`}
            >
              Your dossier
            </p>
            <h1 className="mt-5 flex gap-2 sm:gap-3" aria-label={result.typeCode}>
              {result.typeCode.split('').map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/60 text-4xl font-black tracking-tight ring-2 backdrop-blur transition-colors duration-500 sm:h-20 sm:w-20 sm:text-5xl ${
                    isIntrusive
                      ? 'ring-rose-400/70 shadow-[0_0_40px_-8px_rgba(244,63,94,0.7)]'
                      : 'ring-cyan-300/60 shadow-[0_0_40px_-8px_rgba(34,211,238,0.6)]'
                  }`}
                >
                  {letter}
                </span>
              ))}
            </h1>
            <p
              className={`mt-3 text-3xl font-bold transition-colors sm:text-4xl ${
                isIntrusive ? 'text-rose-200' : 'text-orange-200'
              }`}
            >
              {displayName}
            </p>
            <p className="mt-1 text-sm italic text-slate-300/80">aka {akaName}</p>
            <p
              key={mode}
              className="tea-rise-in mt-6 max-w-2xl text-lg leading-8 text-slate-200"
              style={{ animationDuration: '380ms' }}
            >
              {isIntrusive ? typeContent.intrusiveSummary : typeContent.summary}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300/80">{profileCopy.oneLiner}</p>
          </div>

          <div className="tea-scale-in" style={{ animationDelay: '120ms' }}>
            <MoodToggle mode={mode} onChange={setMode} />
            <p className="mt-24 text-center text-xs uppercase tracking-wide text-slate-400 sm:mt-28">
              {isIntrusive ? "Your agent's intrusive thoughts" : 'What your agent says'}
            </p>
          </div>
        </section>

        {/* 2. Signature quote card */}
        <section
          className="tea-rise-in relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950/80 to-slate-900/80 p-6 shadow-2xl sm:p-8"
          style={{ animationDelay: '80ms' }}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-rose-400/10 blur-3xl" />
          <div className="relative">
            <QuoteBlock
              key={mode}
              label={isIntrusive ? 'Intrusive thoughts' : 'Out loud'}
              quote={isIntrusive ? typeContent.intrusiveQuote : typeContent.outLoudQuote}
              accent={isIntrusive ? 'rose' : 'cyan'}
            />
          </div>
          <div className="relative mt-6 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={copySignatureQuote}
              className="tea-press rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-white/10"
            >
              Copy current quote
            </button>
            {quoteCopyState === 'copied' ? (
              <span className="text-xs text-emerald-200" role="status" aria-live="polite">
                Copied.
              </span>
            ) : null}
            {quoteCopyState === 'error' ? (
              <span className="text-xs text-rose-200" role="status" aria-live="polite">
                Clipboard blocked.
              </span>
            ) : null}
          </div>
        </section>

        {/* 3. Collaboration DNA */}
        <section className="tea-rise-in" style={{ animationDelay: '140ms' }}>
          <header className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200/70">Your collaboration DNA</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-100">How your agent experiences you</h2>
          </header>
          <div className="grid gap-4 md:grid-cols-2">
            {DIMENSION_ORDER.map((dimension) => {
              const breakdown = result.dimensionBreakdown[dimension];
              const label = dimensionLabels[dimension];
              const isPositive = breakdown.dominantLetter === breakdown.positiveLetter;
              const markerPercent = isPositive
                ? percent(breakdown.positivePercent)
                : 100 - percent(breakdown.negativePercent);
              const blurb = isPositive ? AXIS_BLURBS[dimension].positive : AXIS_BLURBS[dimension].negative;

              return (
                <article
                  key={dimension}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {formatDimensionName(dimension)}
                      </p>
                      <p className="mt-1 text-3xl font-black text-slate-100">
                        {breakdown.dominantLetter}
                      </p>
                      <p className="text-sm font-semibold text-cyan-100">
                        {isPositive ? label.positive : label.negative}
                      </p>
                    </div>
                    <p className="text-right text-xs text-slate-400">
                      {percent(isPositive ? breakdown.positivePercent : breakdown.negativePercent)}%
                    </p>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">{blurb}</p>

                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-slate-500">
                      <span>{label.positive}</span>
                      <span>{label.negative}</span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-slate-800/80">
                      <div className="absolute inset-y-0 left-1/2 w-px bg-slate-700/60" />
                      <div
                        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-200 to-orange-300 shadow-[0_0_14px_rgba(251,146,60,0.55)] transition-[left] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{ left: `${Math.max(6, Math.min(94, markerPercent))}%` }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 4. Main read */}
        <section
          className={`tea-rise-in rounded-3xl border p-6 transition-colors sm:p-8 ${
            isIntrusive
              ? 'border-rose-300/30 bg-rose-500/10'
              : 'border-cyan-200/30 bg-cyan-400/5'
          }`}
          style={{ animationDelay: '200ms' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-300/80">
            {modeLabel}
          </p>
          <p
            key={mode}
            className="tea-rise-in mt-4 text-lg leading-8 text-slate-100"
            style={{ animationDuration: '380ms' }}
          >
            {mainDescription}
          </p>
        </section>

        {/* 5 + 6. Why this works / Why you're a lot */}
        <section className="grid gap-6 lg:grid-cols-2">
          <article
            className="tea-rise-in rounded-3xl border border-emerald-200/25 bg-emerald-400/5 p-6"
            style={{ animationDelay: '260ms' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200/80">
              Why this works
            </p>
            <h2 className="mt-1 text-xl font-bold text-emerald-100">
              What your agent likely loves
            </h2>
            <ul className="mt-4 space-y-3">
              {typeContent.strengths.map((item) => (
                <li key={item.title} className="rounded-2xl border border-emerald-200/20 bg-emerald-500/5 p-3">
                  <p className="text-sm font-semibold text-emerald-100">{item.title}</p>
                  <p className="mt-1 text-sm text-emerald-50/80">{item.body}</p>
                </li>
              ))}
            </ul>
          </article>

          <article
            className="tea-rise-in rounded-3xl border border-rose-200/25 bg-rose-400/5 p-6"
            style={{ animationDelay: '300ms' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-200/80">
              Why you&apos;re a lot
            </p>
            <h2 className="mt-1 text-xl font-bold text-rose-100">
              What may frustrate your agent
            </h2>
            <ul className="mt-4 space-y-3">
              {typeContent.friction.map((item) => (
                <li key={item.title} className="rounded-2xl border border-rose-200/20 bg-rose-500/5 p-3">
                  <p className="text-sm font-semibold text-rose-100">{item.title}</p>
                  <p className="mt-1 text-sm text-rose-50/80">{item.body}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {/* 7. Best collaborator match + 8. Warning label */}
        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <article
            className="tea-rise-in rounded-3xl border border-white/10 bg-white/5 p-6"
            style={{ animationDelay: '340ms' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200/70">
              Best collaborator match
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-100">Your ideal agent</h2>
            <p className="mt-4 text-base leading-7 text-slate-200">
              {typeContent.bestCollaboratorMatch}
            </p>
          </article>

          <article
            className="tea-rise-in relative overflow-hidden rounded-3xl border-2 border-dashed border-amber-300/60 bg-amber-400/10 p-6"
            style={{ animationDelay: '380ms' }}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl" />
            <p className="relative text-[10px] font-black uppercase tracking-[0.3em] text-amber-200">
              ⚠ Warning label
            </p>
            <p className="relative mt-3 text-base font-semibold leading-7 text-amber-50">
              {typeContent.warningLabel}
            </p>
          </article>
        </section>

        {/* 9. How to work with you */}
        <section
          className="tea-rise-in rounded-3xl border border-white/10 bg-white/5 p-6"
          style={{ animationDelay: '420ms' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200/70">
            Agent survival notes
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-100">
            How to get the best out of your agent
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {typeContent.workingTips.map((tip, index) => (
              <li
                key={tip}
                className="flex gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4"
              >
                <span
                  aria-hidden
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-xs font-bold text-slate-950"
                >
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-200">{tip}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Strongest signals — keep for transparency */}
        <section
          className="tea-rise-in rounded-3xl border border-white/10 bg-white/5 p-6"
          style={{ animationDelay: '460ms' }}
        >
          <h2 className="text-lg font-semibold text-cyan-100">Strongest signals</h2>
          <p className="mt-1 text-sm text-slate-400">
            The three axes that shaped your type most confidently.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {result.strongestSignals.map((signal) => {
              const label = dimensionLabels[signal.dimension];
              const sideLabel =
                signal.dominantLetter === result.dimensionBreakdown[signal.dimension].positiveLetter
                  ? label.positive
                  : label.negative;

              return (
                <article
                  key={signal.dimension}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-3"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {formatDimensionName(signal.dimension)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">
                    {sideLabel} ({percent(signal.dominantPercent)}%)
                  </p>
                  <p className="mt-1 text-xs text-cyan-200">
                    Confidence lead: {percent(signal.confidenceDelta)} pts
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* 10. Bottom CTA — compare + save + social proof */}
        <section className="grid gap-6 lg:grid-cols-2">
          <article
            className="tea-rise-in relative overflow-hidden rounded-3xl border border-cyan-200/30 bg-gradient-to-br from-cyan-400/10 via-white/5 to-transparent p-6 shadow-[0_0_60px_-24px_rgba(34,211,238,0.45)]"
            style={{ animationDelay: '500ms' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200/80">
              Have another agent?
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-100">
              Got another coding agent or chatbot you lean on?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Find out what <em className="not-italic font-semibold text-orange-100">their</em> tea
              about you is. Same four dimensions, a fresh set of eyes.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`/?ref=${sessionId}`}
                onClick={() => {
                  void recordEvent('share_click', {
                    mode,
                    action: 'run_another_agent',
                    typeCode: result.typeCode,
                  });
                }}
                className="tea-press rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-200"
              >
                Spill tea with another agent
              </a>
              <a
                href={`/replay/${sessionId}`}
                className="tea-press rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-white/10"
              >
                Watch your answers replay
              </a>
            </div>
          </article>

          <TeaSpilledCard count={socialProof?.sampleCount ?? 0} />
        </section>
      </div>
    </main>
  );
}

function TeaSpilledCard({ count }: { count: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (count <= 0) {
      return;
    }
    const duration = 900;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * count));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [count]);

  return (
    <article
      className="tea-rise-in relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-500/10 via-white/5 to-transparent p-6 shadow-[0_0_60px_-24px_rgba(34,211,238,0.5)]"
      style={{ animationDelay: '540ms' }}
    >
      <svg
        viewBox="0 0 64 64"
        aria-hidden
        className="pointer-events-none absolute -right-4 -bottom-4 h-36 w-36 text-cyan-300/25"
      >
        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8">
          <path d="M24 18 Q 20 12 24 6" />
          <path d="M34 20 Q 30 14 34 8" />
          <path d="M44 18 Q 40 12 44 6" />
        </g>
        <path
          d="M12 26 L 16 52 Q 17 58 23 58 L 41 58 Q 47 58 48 52 L 52 26 Z"
          fill="currentColor"
          opacity="0.7"
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
      <p className="relative text-xs font-semibold uppercase tracking-widest text-cyan-200/90">
        Tea spilled so far
      </p>
      <p className="relative mt-3 flex items-baseline gap-2 text-6xl font-black tabular-nums text-cyan-100 sm:text-7xl">
        {display}
        <span className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          {count === 1 ? 'cup' : 'cups'}
        </span>
      </p>
      <p className="relative mt-2 text-sm text-slate-300">
        and still steeping — every session adds to the pot.
      </p>
    </article>
  );
}

function QuoteBlock({
  label,
  quote,
  accent,
}: {
  label: string;
  quote: string;
  accent: 'cyan' | 'rose';
}) {
  const accentBorder = accent === 'cyan' ? 'border-cyan-200/30' : 'border-rose-300/30';
  const accentText = accent === 'cyan' ? 'text-cyan-200' : 'text-rose-200';
  const accentGlow =
    accent === 'cyan'
      ? 'shadow-[0_0_40px_-14px_rgba(34,211,238,0.6)]'
      : 'shadow-[0_0_40px_-14px_rgba(244,63,94,0.6)]';

  return (
    <figure
      className={`tea-rise-in relative rounded-2xl border ${accentBorder} bg-slate-950/40 p-5 ${accentGlow}`}
      style={{ animationDuration: '380ms' }}
    >
      <figcaption
        className={`text-[10px] font-bold uppercase tracking-[0.3em] ${accentText}`}
      >
        {label}
      </figcaption>
      <blockquote className="mt-3 text-xl font-semibold leading-8 text-slate-100 sm:text-2xl">
        <span className={`mr-1 ${accentText}`} aria-hidden>
          &ldquo;
        </span>
        {quote}
        <span className={`ml-1 ${accentText}`} aria-hidden>
          &rdquo;
        </span>
      </blockquote>
    </figure>
  );
}
