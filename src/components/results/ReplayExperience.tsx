'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { LobsterMascot } from '@/components/landing/LobsterMascot';
import { TeaHomeBadge } from '@/components/shared/TeaHomeBadge';

type ReplayAnswer = {
  questionCode: string;
  questionText: string;
  selectedValue: number;
  displayOrder: number;
  reasoning?: string;
};

type ReplayPayload = {
  typeCode: string;
  replayAnswers: ReplayAnswer[];
  evidence?: {
    strongestSupport: Array<{ questionCode: string }>;
    strongestContradictions: Array<{ questionCode: string }>;
  };
};

const OPTIONS: Array<{ value: 1 | 2 | 3 | 4 | 5; label: string }> = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
];

const STAGE = {
  options: 420,
  highlight: 900,
  bubble: 1400,
  typeCharMs: 22,
  autoplayDelay: 2800,
} as const;

function pickReplaySet(result: ReplayPayload): ReplayAnswer[] {
  const seen = new Set<string>();
  const ordered: ReplayAnswer[] = [];
  for (const answer of result.replayAnswers) {
    if (seen.has(answer.questionCode)) continue;
    seen.add(answer.questionCode);
    ordered.push(answer);
  }
  return ordered.sort((a, b) => a.displayOrder - b.displayOrder);
}

export function ReplayExperience({
  result,
  sessionId,
}: {
  result: ReplayPayload;
  sessionId: string;
}) {
  const steps = useMemo(() => pickReplaySet(result), [result]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSteps = steps.length;
  const currentStep = steps[stepIndex];
  const isLast = stepIndex >= totalSteps - 1;

  const scheduleExit = () => {
    if (exitTimerRef.current) return;
    setIsExiting(true);
    exitTimerRef.current = setTimeout(() => {
      window.location.assign(`/results/${sessionId}`);
    }, 620);
  };

  useEffect(() => {
    if (totalSteps === 0) {
      scheduleExit();
    }
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAdvance() {
    if (isLast) {
      scheduleExit();
      return;
    }
    setStepIndex((prev) => prev + 1);
  }

  function skipToResults() {
    scheduleExit();
  }

  if (!currentStep) {
    return (
      <main
        className="min-h-screen px-6 py-20 text-slate-100 sm:px-10"
        style={{
          background:
            'linear-gradient(145deg, var(--tea-bg-deep) 0%, var(--tea-bg-mid) 45%, var(--tea-bg-glow) 100%)',
        }}
      >
        <TeaHomeBadge />
        <div className="mx-auto max-w-2xl text-center">
          <p className="tea-fade-in text-sm uppercase tracking-[0.3em] text-cyan-200/80">Spilling the tea</p>
          <p className="tea-rise-in mt-4 text-xl text-slate-200">Preparing your verdict…</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen px-6 py-10 text-slate-100 transition-opacity duration-500 sm:px-10 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background:
          'linear-gradient(145deg, var(--tea-bg-deep) 0%, var(--tea-bg-mid) 45%, var(--tea-bg-glow) 100%)',
      }}
    >
      <div className="tea-curtain" aria-hidden />
      <TeaHomeBadge />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl flex-col">
        <header className="flex items-center justify-between gap-3 pt-2">
          <div>
            <p className="tea-eyebrow text-cyan-200/80">Spilling the tea</p>
            <p className="mt-2 text-sm text-slate-300">
              Question {stepIndex + 1} of {totalSteps} · take your time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoplay((prev) => !prev)}
              aria-pressed={autoplay}
              className={`tea-press inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                autoplay
                  ? 'border-cyan-200/60 bg-cyan-200/15 text-cyan-50'
                  : 'border-white/15 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]'
              }`}
              title={autoplay ? 'Autoplay on — click to pause' : 'Autoplay off — click to let it play itself'}
            >
              <span aria-hidden className="text-[0.7rem]">{autoplay ? '❚❚' : '▶'}</span>
              {autoplay ? 'Autoplay' : 'Self-paced'}
            </button>
            <button
              type="button"
              onClick={skipToResults}
              className="tea-press rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-200 hover:bg-white/[0.08]"
            >
              Skip to result →
            </button>
          </div>
        </header>

        {totalSteps <= 12 ? (
          <div className="mt-4 flex gap-1.5" aria-hidden>
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-[3px] flex-1 overflow-hidden rounded-full transition-colors duration-500 ${
                  idx < stepIndex
                    ? 'bg-gradient-to-r from-cyan-300/90 to-violet-300/90'
                    : idx === stepIndex
                      ? 'bg-gradient-to-r from-cyan-300 to-violet-300'
                      : 'bg-white/[0.08]'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.08]" aria-hidden>
            <div
              className="h-full bg-gradient-to-r from-cyan-300 to-violet-300 transition-[width] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
              style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
        )}

        <ReplayStep
          key={stepIndex}
          step={currentStep}
          isLast={isLast}
          autoplay={autoplay}
          onAdvance={handleAdvance}
        />
      </div>
    </main>
  );
}

function ReplayStep({
  step,
  isLast,
  autoplay,
  onAdvance,
}: {
  step: ReplayAnswer;
  isLast: boolean;
  autoplay: boolean;
  onAdvance: () => void;
}) {
  const [phase, setPhase] = useState<'question' | 'options' | 'highlight' | 'bubble' | 'finale'>(
    'question',
  );
  const [typedText, setTypedText] = useState('');

  const hasReasoning = Boolean(step.reasoning);

  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    timers.push(setTimeout(() => setPhase('options'), STAGE.options));
    timers.push(setTimeout(() => setPhase('highlight'), STAGE.highlight));
    if (hasReasoning) {
      timers.push(setTimeout(() => setPhase('bubble'), STAGE.bubble));
    } else {
      timers.push(setTimeout(() => setPhase('finale'), STAGE.highlight + 600));
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'bubble') return;
    const reasoning = step.reasoning ?? '';
    if (!reasoning) return;
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    let i = 0;
    const tick = () => {
      i += 1;
      setTypedText(reasoning.slice(0, i));
      if (i < reasoning.length) {
        timers.push(setTimeout(tick, STAGE.typeCharMs));
      } else {
        timers.push(setTimeout(() => setPhase('finale'), 220));
      }
    };
    timers.push(setTimeout(tick, 80));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (!autoplay) return;
    if (phase !== 'finale') return;
    const timer = setTimeout(onAdvance, STAGE.autoplayDelay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, phase]);

  const ready = phase === 'finale';

  return (
    <section className="mt-6 grid flex-1 items-start gap-6 pb-6 lg:mt-8 lg:grid-cols-[0.9fr_1.3fr] lg:items-center lg:gap-10">
      <div className="order-1 flex items-start gap-3 lg:order-1 lg:flex-col lg:items-center lg:gap-5">
        <LobsterMascot
          variant="hero"
          className={`w-24 shrink-0 select-none drop-shadow-[0_24px_36px_rgba(255,98,74,0.3)] sm:w-28 lg:w-64 ${
            phase === 'bubble' || phase === 'finale' ? 'tea-mascot-evil' : 'tea-mascot-bob'
          }`}
        />
        {step.reasoning ? (
          <div
            className={`min-w-0 flex-1 transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] lg:w-full lg:flex-none ${
              phase === 'bubble' || phase === 'finale'
                ? 'opacity-100 translate-y-0'
                : 'pointer-events-none opacity-0 translate-y-2'
            }`}
          >
            <div className="relative rounded-2xl border border-orange-200/20 bg-orange-200/[0.06] p-3 sm:p-4">
              <span
                aria-hidden
                className="absolute -left-2 top-5 h-3 w-3 rotate-45 rounded-[2px] border-b border-l border-orange-200/20 bg-orange-200/[0.06] lg:left-1/2 lg:top-auto lg:-top-2 lg:-translate-x-1/2 lg:rotate-[225deg]"
              />
              <p className="text-xs leading-5 text-orange-50/95 sm:text-sm sm:leading-6">
                {typedText}
                {phase === 'bubble' && typedText.length < (step.reasoning ?? '').length ? (
                  <span className="tea-caret ml-0.5 inline-block h-3 w-[2px] translate-y-0.5 bg-orange-200" />
                ) : null}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="order-2 lg:order-2">
        <article className="tea-reveal-card rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/75">
            {step.questionCode}
          </p>
          <h2 className="tea-display mt-3 text-balance text-[1.6rem] leading-[1.25] text-white sm:text-[1.9rem]">
            {step.questionText}
          </h2>

          <ul
            className={`mt-6 grid gap-2 transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
              phase === 'question' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            {OPTIONS.map((option) => {
              const isSelected = option.value === step.selectedValue;
              const showHighlight =
                isSelected && (phase === 'highlight' || phase === 'bubble' || phase === 'finale');
              return (
                <li
                  key={option.value}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                    showHighlight
                      ? 'border-cyan-300/60 bg-cyan-300/10 text-white shadow-[0_0_40px_-12px_rgba(34,211,238,0.55)]'
                      : 'border-white/[0.06] bg-white/[0.015] text-slate-300/80'
                  }`}
                >
                  <span>{option.label}</span>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[0.7rem] font-semibold transition-colors duration-500 ${
                      showHighlight
                        ? 'border-cyan-200 bg-cyan-200 text-slate-950'
                        : 'border-white/15 text-slate-400'
                    }`}
                  >
                    {option.value}
                  </span>
                </li>
              );
            })}
          </ul>

        </article>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p
            className={`text-xs text-slate-400 transition-opacity duration-500 ${
              ready && !autoplay ? 'opacity-100' : 'opacity-0'
            }`}
            aria-live="polite"
          >
            {isLast ? 'Ready for the verdict?' : 'Read it at your own pace.'}
          </p>
          <button
            type="button"
            onClick={onAdvance}
            disabled={!ready}
            className="tea-press inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isLast ? 'Reveal my type' : 'Next'} →
          </button>
        </div>
      </div>
    </section>
  );
}
