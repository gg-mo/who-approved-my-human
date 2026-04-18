import { LandingEntryCards } from '@/components/landing/LandingEntryCards';
import { LobsterMascot } from '@/components/landing/LobsterMascot';

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden bg-[#0b1220] text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(70rem_35rem_at_12%_8%,rgba(45,212,191,0.24),transparent),radial-gradient(74rem_36rem_at_85%_18%,rgba(251,146,60,0.2),transparent),linear-gradient(145deg,#0b1220_0%,#15182f_45%,#1f1136_100%)]" />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <p className="w-fit rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-1 text-sm font-medium text-cyan-200">
              Agent Tea
            </p>

            <h1 className="mt-5 max-w-3xl text-balance text-5xl font-black leading-tight tracking-tight sm:text-6xl">
              Your AI has tea about you.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200/90">
              Find out how your AI reads your style in under two minutes. Pick your entry point,
              paste one instruction, then bring the answers back for your type reveal.
            </p>

            <button
              type="button"
              className="mt-8 inline-flex rounded-2xl bg-cyan-200 px-5 py-3 text-base font-bold text-slate-900 transition hover:bg-cyan-100"
            >
              Start your Agent Tea test
            </button>
          </section>

          <div className="mx-auto w-full max-w-xs rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <LobsterMascot className="w-full drop-shadow-[0_24px_30px_rgba(255,90,100,0.32)]" />
          </div>
        </div>

        <div className="mt-10">
          <LandingEntryCards />
        </div>
      </div>
    </main>
  );
}
