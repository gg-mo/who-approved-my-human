import Link from 'next/link';

import { LobsterMascot } from '@/components/landing/LobsterMascot';

export function TeaHomeBadge() {
  return (
    <Link
      href="/"
      aria-label="Back to Agent Tea home"
      className="tea-press fixed left-4 top-4 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1.5 text-sm font-semibold text-slate-100 backdrop-blur hover:bg-slate-900/80 sm:left-6 sm:top-6"
    >
      <LobsterMascot className="h-7 w-7 shrink-0" />
      <span>Agent Tea</span>
    </Link>
  );
}
