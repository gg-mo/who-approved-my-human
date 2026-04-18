'use client';

import { useEffect, useRef, useState } from 'react';

import { TypeFigure } from '@/components/figures/TypeFigure';
import { LandingEntryCards } from '@/components/landing/LandingEntryCards';
import { LobsterMascot } from '@/components/landing/LobsterMascot';
import { SocialProofPreview } from '@/components/landing/SocialProofPreview';

export default function Home() {
  const [showEntryCards, setShowEntryCards] = useState(false);
  const entrySectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');

    if (ref) {
      localStorage.setItem('agentTeaReferral', ref);
    }

    void fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'landing_view',
        eventPayload: { referralCode: ref ?? null },
      }),
    }).catch(() => undefined);
  }, []);

  function handleStartClick() {
    setShowEntryCards(true);
    window.setTimeout(() => {
      entrySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }

  return (
    <main className="relative isolate overflow-hidden text-slate-100">
      <div className="tea-curtain" aria-hidden />

      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(55rem 32rem at 15% 10%, rgba(34,211,238,0.22), transparent 65%),' +
            'radial-gradient(60rem 34rem at 85% 18%, rgba(251,146,60,0.18), transparent 65%),' +
            'radial-gradient(70rem 40rem at 50% 110%, rgba(139,92,246,0.22), transparent 70%),' +
            'linear-gradient(160deg, #0a1a2c 0%, #17214a 48%, #2a1848 100%)',
        }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-24 sm:px-10">
        <div className="grid items-center gap-14 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
          <section className="tea-lines">
            <p className="tea-eyebrow w-fit text-cyan-200/90">Agent Tea</p>

            <h1 className="tea-display mt-6 max-w-3xl text-balance text-[2.75rem] leading-[1.05] text-white sm:text-[3.75rem]">
              Your AI has tea about you.
            </h1>

            <p className="mt-6 max-w-xl text-[1.0625rem] leading-[1.65] text-slate-300/90">
              Find out how your AI reads your style — in under two minutes.
            </p>

            <div>
              <button
                type="button"
                onClick={handleStartClick}
                aria-expanded={showEntryCards}
                aria-controls="entry-section"
                className="tea-press mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[0.95rem] font-medium text-slate-950 shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset,0_10px_40px_-18px_rgba(255,255,255,0.45)] hover:bg-slate-100"
              >
                See what your AI thinks of you
                <span aria-hidden className="translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-x-0.5">
                  →
                </span>
              </button>
            </div>
          </section>

          <div className="tea-scale-in tea-stage-5 mx-auto grid w-full max-w-xs gap-4 rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl">
            <LobsterMascot variant="hero" className="w-full drop-shadow-[0_18px_28px_rgba(255,90,100,0.22)]" />
            <TypeFigure
              typeCode="CKVG"
              className="mx-auto w-32 rounded-2xl border border-white/[0.08] bg-slate-950/40 p-2"
            />
          </div>
        </div>

        {showEntryCards ? (
          <div
            id="entry-section"
            ref={entrySectionRef}
            className="tea-rise-in mt-20 scroll-mt-24"
          >
            <LandingEntryCards />
          </div>
        ) : null}

        <div className="tea-fade-in tea-stage-7 mt-24">
          <SocialProofPreview />
        </div>
      </div>
    </main>
  );
}
