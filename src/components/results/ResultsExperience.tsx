'use client';

import { useEffect, useMemo, useState } from 'react';

import { LobsterMascot } from '@/components/landing/LobsterMascot';
import { MoodToggle } from '@/components/results/MoodToggle';
import { type NarrativeMode } from '@/lib/results/copy-content';
import { buildProfileCopy, getDimensionLabels } from '@/lib/results/profile-copy';
import { buildShareCardHighlights, buildShareCardText } from '@/lib/results/share-card';
import { MIN_SAMPLE_FOR_SOCIAL_PROOF } from '@/lib/scoring/constants';
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

const likertLabels = {
  1: 'Strongly disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly agree',
} as const;

const REPLAY_INTERVAL_MS = 180;
const CLAIM_SUCCESS_REDIRECT_MS = 1100;

function percent(value: number) {
  return Math.round(value * 100);
}

export function ResultsExperience({
  result,
  sessionId,
  socialProof,
  isSignedIn,
}: {
  result: ResultsPayload;
  sessionId: string;
  socialProof?: SocialProof;
  isSignedIn?: boolean;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [mode, setMode] = useState<NarrativeMode>('normal');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [compareSessionId, setCompareSessionId] = useState('');
  const [compareStatus, setCompareStatus] = useState<'idle' | 'working' | 'error'>('idle');
  const [compareError, setCompareError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'working' | 'saved' | 'error'>('idle');
  const [showEvidence, setShowEvidence] = useState(false);

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
  const shareCardUrl = `/api/share-card/${sessionId}?mode=${mode}`;
  const shareHighlights = useMemo(
    () => buildShareCardHighlights({ mode, breakdown: result.dimensionBreakdown }),
    [mode, result.dimensionBreakdown],
  );
  const shareText = useMemo(
    () =>
      buildShareCardText({
        mode,
        typeCode: result.typeCode,
        nickname: profileCopy.nickname,
        highlights: shareHighlights,
      }),
    [mode, profileCopy.nickname, result.typeCode, shareHighlights],
  );
  const minimumSample = socialProof?.minimumSample ?? MIN_SAMPLE_FOR_SOCIAL_PROOF;

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= result.replayAnswers.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, REPLAY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [result.replayAnswers.length]);

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

  async function copyShareText() {
    try {
      const origin = window.location.origin;
      const payload = `${shareText}\n${origin}/results/${sessionId}`;
      await navigator.clipboard.writeText(payload);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 2200);
      await recordEvent('share_click', { mode, action: 'copy_text', typeCode: result.typeCode });
    } catch {
      setCopyState('error');
    }
  }

  async function createCompareLink() {
    const target = compareSessionId.trim();

    if (!target) {
      setCompareStatus('error');
      setCompareError('Paste another reveal code first.');
      return;
    }

    setCompareStatus('working');
    setCompareError(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionIds: [sessionId, target],
          labels: ['This reveal', 'Other reveal'],
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.compareId) {
        throw new Error(payload.error ?? 'Could not build a compare view.');
      }

      window.location.assign(`/compare/${payload.compareId}`);
    } catch (error) {
      setCompareStatus('error');
      setCompareError(error instanceof Error ? error.message : 'Could not build a compare view.');
    }
  }

  async function claimSession() {
    setSaveStatus('working');

    try {
      const response = await fetch(`/api/sessions/${sessionId}/claim`, { method: 'POST' });

      if (!response.ok) {
        throw new Error('Could not save to your profile.');
      }

      setSaveStatus('saved');
      window.setTimeout(() => window.location.assign('/profile'), CLAIM_SUCCESS_REDIRECT_MS);
    } catch {
      setSaveStatus('error');
    }
  }

  const isIntrusive = mode === 'intrusive';

  return (
    <main
      className={`min-h-screen px-6 py-12 text-slate-100 transition-colors duration-500 sm:px-10 ${
        isIntrusive ? 'tea-mood-intrusive' : 'tea-mood-normal'
      }`}
      style={{
        background: isIntrusive
          ? 'linear-gradient(145deg, #1a0612 0%, #2b0822 45%, #420f30 100%)'
          : 'linear-gradient(145deg, var(--tea-bg-deep) 0%, var(--tea-bg-mid) 45%, var(--tea-bg-glow) 100%)',
        transition: 'background 500ms ease',
      }}
    >
      <div className="mx-auto max-w-6xl">
        <section className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="tea-rise-in">
            <p
              className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                isIntrusive
                  ? 'border-rose-300/40 bg-rose-400/10 text-rose-100'
                  : 'border-cyan-200/35 bg-cyan-200/10 text-cyan-100'
              }`}
            >
              Agent Tea Result
            </p>
            <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">{result.typeCode}</h1>
            <p
              className={`mt-2 text-2xl font-bold transition-colors ${
                isIntrusive ? 'text-rose-200' : 'text-orange-200'
              }`}
            >
              {profileCopy.nickname}
            </p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{profileCopy.oneLiner}</p>
          </div>
          <div className="tea-scale-in pb-6 pt-4" style={{ animationDelay: '120ms' }}>
            <MoodToggle mode={mode} onChange={setMode} />
          </div>
        </section>

        <section className="tea-rise-in mt-8 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-5" style={{ animationDelay: '80ms' }}>
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
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-orange-300 transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ width: `${Math.max(4, percent(values.positivePercent))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </section>

        <section className="tea-rise-in mt-8 rounded-3xl border border-white/10 bg-white/5 p-5" style={{ animationDelay: '140ms' }}>
          <h2 className="text-lg font-semibold text-cyan-100">Strongest signals</h2>
          <div className="tea-stagger mt-3 grid gap-3 sm:grid-cols-3">
            {result.strongestSignals.map((signal) => {
              const label = dimensionLabels[signal.dimension];
              const sideLabel =
                signal.dominantLetter === result.dimensionBreakdown[signal.dimension].positiveLetter
                  ? label.positive
                  : label.negative;

              return (
                <article key={signal.dimension} className="tea-card rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{signal.dimension.replace('_', ' ')}</p>
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

        <section className="tea-rise-in mt-8 rounded-3xl border border-white/10 bg-white/5 p-5" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-semibold text-cyan-100">Share this tea</h2>
          <p className="mt-2 text-sm text-slate-300">{shareText}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyShareText}
              className="tea-press rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200"
            >
              Copy share text
            </button>
            <a
              href={shareCardUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                void recordEvent('share_click', {
                  mode,
                  action: 'open_share_card',
                  typeCode: result.typeCode,
                });
              }}
              className="tea-press rounded-full border border-orange-200/50 bg-orange-300/10 px-4 py-2 text-sm font-semibold text-orange-100 hover:bg-orange-300/20"
            >
              Open share card
            </a>
            <a
              href={`/?ref=${sessionId}`}
              onClick={() => {
                void recordEvent('share_click', {
                  mode,
                  action: 'challenge_friend',
                  typeCode: result.typeCode,
                });
              }}
              className="tea-press rounded-full border border-cyan-200/40 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-200/20"
            >
              Challenge a friend
            </a>
          </div>
          {copyState === 'copied' ? (
            <p className="tea-toast mt-2 text-xs text-emerald-200" role="status" aria-live="polite">
              Copied to clipboard.
            </p>
          ) : null}
          {copyState === 'error' ? (
            <p className="tea-toast mt-2 text-xs text-rose-200" role="status" aria-live="polite">
              Clipboard blocked. Please copy the line manually.
            </p>
          ) : null}
        </section>

        <section className="tea-rise-in mt-8 rounded-3xl border border-white/10 bg-white/5 p-5" style={{ animationDelay: '260ms' }}>
          <h2 className="text-lg font-semibold text-cyan-100">Compare with another reveal</h2>
          <p className="mt-2 text-sm text-slate-300">
            Paste a friend&apos;s reveal code (the long ID at the end of their link) to see it next to yours.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              value={compareSessionId}
              onChange={(event) => setCompareSessionId(event.target.value)}
              placeholder="Paste reveal code"
              aria-invalid={compareStatus === 'error'}
              aria-describedby={compareStatus === 'error' ? 'compare-error' : undefined}
              className="w-full max-w-sm rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-200/60"
            />
            <button
              type="button"
              disabled={compareStatus === 'working'}
              onClick={createCompareLink}
              className="tea-press rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-70"
            >
              {compareStatus === 'working' ? 'Building…' : 'Compare'}
            </button>
          </div>
          {compareStatus === 'error' && compareError ? (
            <p id="compare-error" role="alert" className="tea-toast mt-2 text-xs text-rose-200">
              {compareError}
            </p>
          ) : null}
        </section>

        <section className="tea-rise-in mt-8 rounded-3xl border border-white/10 bg-white/5 p-5" style={{ animationDelay: '320ms' }}>
          <h2 className="text-lg font-semibold text-cyan-100">Save your reveal</h2>
          <p className="mt-2 text-sm text-slate-300">
            Sign in to keep every reveal in one place and revisit comparisons anytime.
          </p>
          <div className="mt-3">
            {isSignedIn ? (
              <button
                type="button"
                disabled={saveStatus === 'working' || saveStatus === 'saved'}
                onClick={claimSession}
                className="tea-press inline-flex rounded-xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-200 disabled:opacity-70"
              >
                {saveStatus === 'working'
                  ? 'Saving…'
                  : saveStatus === 'saved'
                    ? 'Saved ✓'
                    : 'Save to my profile'}
              </button>
            ) : (
              <a
                href={`/auth?claim=${sessionId}`}
                className="tea-press inline-flex rounded-xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-200"
              >
                Sign in to save
              </a>
            )}
            {saveStatus === 'saved' ? (
              <p className="tea-toast mt-2 text-xs text-emerald-200" role="status" aria-live="polite">
                Saved. Opening your profile…
              </p>
            ) : null}
            {saveStatus === 'error' ? (
              <p className="tea-toast mt-2 text-xs text-rose-200" role="status" aria-live="polite">
                Could not save this reveal. Please try again.
              </p>
            ) : null}
          </div>
        </section>

        <section className="tea-rise-in mt-8 rounded-3xl border border-white/10 bg-white/5 p-5" style={{ animationDelay: '380ms' }}>
          <h2 className="text-lg font-semibold text-cyan-100">This week in Agent Tea</h2>
          {socialProof && socialProof.sampleCount >= socialProof.minimumSample ? (
            <div className="tea-stagger mt-3 grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs text-slate-400">Most common type</p>
                <p className="mt-1 text-2xl font-black text-cyan-200">{socialProof.mostCommon?.typeCode}</p>
                <p className="text-xs text-slate-400">{socialProof.mostCommon?.count} reveals in 7 days</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <p className="text-xs text-slate-400">Rarest type</p>
                <p className="mt-1 text-2xl font-black text-orange-200">{socialProof.rarest?.typeCode}</p>
                <p className="text-xs text-slate-400">{socialProof.rarest?.count} reveals in 7 days</p>
              </article>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-300">
              Not enough recent reveals to show stats yet. Unlocks after {minimumSample} weekly reveals.
            </p>
          )}
        </section>

        {result.evidence ? (
          <section className="tea-rise-in mt-8 rounded-3xl border border-white/10 bg-white/5 p-5" style={{ animationDelay: '440ms' }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-cyan-100">Why this result</h2>
              <button
                type="button"
                onClick={() => setShowEvidence((prev) => !prev)}
                aria-expanded={showEvidence}
                className="tea-press rounded-xl border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-white/10"
              >
                {showEvidence ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="tea-collapse mt-1" data-open={showEvidence ? 'true' : 'false'} aria-hidden={!showEvidence}>
              <div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <article className="rounded-2xl border border-emerald-200/20 bg-emerald-200/10 p-4">
                    <h3 className="text-sm font-semibold text-emerald-100">Strongest supporting answers</h3>
                    <ul className="mt-2 space-y-2 text-xs text-emerald-50/90">
                      {result.evidence.strongestSupport.slice(0, 3).map((item) => (
                        <li key={`support-${item.questionCode}`}>
                          <p className="font-semibold">{item.questionCode}</p>
                          <p>{item.questionText}</p>
                        </li>
                      ))}
                    </ul>
                  </article>
                  <article className="rounded-2xl border border-rose-200/20 bg-rose-200/10 p-4">
                    <h3 className="text-sm font-semibold text-rose-100">Top contradictions</h3>
                    <ul className="mt-2 space-y-2 text-xs text-rose-50/90">
                      {result.evidence.strongestContradictions.slice(0, 3).map((item) => (
                        <li key={`contra-${item.questionCode}`}>
                          <p className="font-semibold">{item.questionCode}</p>
                          <p>{item.questionText}</p>
                        </li>
                      ))}
                    </ul>
                  </article>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <article
            className="tea-rise-in rounded-3xl border border-emerald-200/30 bg-emerald-300/10 p-5"
            style={{ animationDelay: '500ms' }}
          >
            <h2 className="text-lg font-semibold text-emerald-100">What your agent likely loves</h2>
            <ul className="tea-stagger mt-3 space-y-2 text-sm text-emerald-50/90">
              {profileCopy.loves.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>

          <article
            className="tea-rise-in rounded-3xl border border-rose-200/30 bg-rose-300/10 p-5"
            style={{ animationDelay: '560ms' }}
          >
            <h2 className="text-lg font-semibold text-rose-100">What may frustrate your agent</h2>
            <ul className="tea-stagger mt-3 space-y-2 text-sm text-rose-50/90">
              {profileCopy.frustrates.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        </section>

        <section
          className="tea-rise-in mt-8 rounded-3xl border border-white/10 bg-white/5 p-5"
          style={{ animationDelay: '620ms' }}
        >
          <h2 className="text-lg font-semibold text-cyan-100">Your answers, replayed</h2>
          <div className="mt-4 space-y-3">
            {result.replayAnswers.slice(0, visibleCount).map((answer) => (
              <article
                key={answer.questionCode}
                className="tea-rise-in rounded-2xl border border-white/10 bg-slate-900/70 p-3"
              >
                <p className="text-xs text-slate-400">{answer.questionCode}</p>
                <p className="text-sm text-slate-100">{answer.questionText}</p>
                <p className="mt-1 text-xs font-semibold text-cyan-200">
                  Selected: {likertLabels[answer.selectedValue as keyof typeof likertLabels]}
                </p>
                {answer.reasoning ? (
                  <div className="mt-2 flex items-start gap-2 rounded-xl border border-orange-200/25 bg-orange-200/10 p-2 text-xs text-orange-100">
                    <LobsterMascot variant="bubble" className="h-10 w-10 shrink-0" />
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
