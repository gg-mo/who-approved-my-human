import type { DimensionId } from '@/lib/scoring/types';

export type CompareItem = {
  sessionId: string;
  label?: string;
  intakeMode?: string;
  createdAt?: string;
  result: {
    typeCode: string;
    dimensionBreakdown: Record<
      DimensionId,
      {
        dominantLetter: string;
        positivePercent: number;
        negativePercent: number;
      }
    >;
  };
};

const dimensionLabel: Record<DimensionId, string> = {
  clarity: 'Clear vs Cryptic',
  tone: 'Kind vs Blunt',
  thinking_style: 'Visionary vs Tactical',
  autonomy: 'Delegating vs Hands-On',
};

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function CompareExperience({ sessions }: { sessions: CompareItem[] }) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-black tracking-tight">Agent Compare</h1>
        <p className="mt-2 text-sm text-slate-300">See how different agents profile the same human collaborator.</p>

        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((item) => (
            <article key={item.sessionId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">{item.label ?? item.intakeMode ?? 'Agent run'}</p>
              <p className="mt-1 text-3xl font-black text-cyan-200">{item.result.typeCode}</p>
              <p className="mt-2 text-xs text-slate-400">Session: {item.sessionId}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold text-cyan-100">Per-dimension comparison</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-2 pr-4">Dimension</th>
                  {sessions.map((item) => (
                    <th key={item.sessionId} className="py-2 pr-4">
                      {item.label ?? item.result.typeCode}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(dimensionLabel) as DimensionId[]).map((dimension) => (
                  <tr key={dimension} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-slate-300">{dimensionLabel[dimension]}</td>
                    {sessions.map((item) => {
                      const breakdown = item.result.dimensionBreakdown[dimension];
                      const dominantPercent = Math.max(breakdown.positivePercent, breakdown.negativePercent);
                      return (
                        <td key={`${item.sessionId}-${dimension}`} className="py-3 pr-4">
                          <span className="font-semibold text-slate-100">{breakdown.dominantLetter}</span>
                          <span className="ml-2 text-xs text-cyan-200">{pct(dominantPercent)}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
