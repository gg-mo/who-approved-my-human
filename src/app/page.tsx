export default function Home() {
  return (
    <main className="relative isolate overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(80rem_40rem_at_10%_10%,rgba(34,211,238,0.2),transparent),radial-gradient(80rem_40rem_at_90%_20%,rgba(251,146,60,0.18),transparent)]" />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-20 sm:px-10">
        <p className="w-fit rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-1 text-sm font-medium text-cyan-200">
          Agent Tea • AE-1 Bootstrap
        </p>

        <h1 className="mt-6 max-w-3xl text-balance text-5xl font-black leading-tight tracking-tight sm:text-6xl">
          Your AI has tea about you.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Agent Tea turns agent feedback into a personality type with a playful but structured scoring
          system. This milestone ships the production-ready app foundation.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">
              Coding agent path
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Copy a markdown instruction, run it with your coding agent, and send structured answers
              back.
            </p>
          </article>
          <article className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
              Chatbot path
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Paste a chatbot encoded response and decode it into scored answers with instant hints.
            </p>
          </article>
        </div>
      </div>
    </main>
  );
}
