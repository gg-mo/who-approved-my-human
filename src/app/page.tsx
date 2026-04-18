'use client';

import { useEffect, useState } from 'react';

import { TypeFigure } from '@/components/figures/TypeFigure';
import { LandingEntryCards } from '@/components/landing/LandingEntryCards';
import { LobsterMascot } from '@/components/landing/LobsterMascot';
import { SocialProofPreview } from '@/components/landing/SocialProofPreview';

export default function Home() {
  const [showEntryCards, setShowEntryCards] = useState(false);

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
  }

  return (
    <main
      className="relative isolate overflow-hidden text-slate-100"
      style={{
        background:
          'linear-gradient(145deg, var(--tea-bg-deep) 0%, var(--tea-bg-mid) 45%, var(--tea-bg-glow) 100%)',
      }}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(70rem_35rem_at_12%_8%,rgba(45,212,191,0.24),transparent),radial-gradient(74rem_36rem_at_85%_18%,rgba(251,146,60,0.2),transparent),linear-gradient(145deg,#0b1220_0%,#15182f_45%,#1f1136_100%)]" />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="tea-rise-in">
            <p className="w-fit rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-1 text-sm font-medium text-cyan-200">
              Agent Tea
            </p>

            <h1 className="mt-5 max-w-3xl text-balance text-5xl font-black leading-tight tracking-tight sm:text-6xl">
              Your AI has tea about you.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200/90">
              Find out how your AI reads your style in under two minutes. Pick where you chat with it, and
              we&apos;ll walk you through the rest.
            </p>

            <button
              type="button"
              onClick={handleStartClick}
              aria-expanded={showEntryCards}
              aria-controls="entry-section"
              className="tea-press mt-8 inline-flex rounded-2xl bg-cyan-200 px-5 py-3 text-base font-bold text-slate-900 shadow-[0_12px_30px_-12px_rgba(34,211,238,0.6)] hover:bg-cyan-100"
            >
              See what your AI thinks of you
            </button>
          </section>

          <div
            className="tea-scale-in mx-auto grid w-full max-w-xs gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur"
            style={{ animationDelay: '120ms' }}
          >
            <LobsterMascot variant="hero" className="w-full drop-shadow-[0_24px_30px_rgba(255,90,100,0.32)]" />
            <TypeFigure typeCode="CKVG" className="mx-auto w-32 rounded-2xl border border-white/10 bg-slate-900/50 p-2" />
          </div>
        </div>

        {showEntryCards ? (
          <div id="entry-section" className="tea-rise-in mt-10">
            <LandingEntryCards />
          </div>
        ) : null}

        <SocialProofPreview />
      </div>
    </main>
  );
}
