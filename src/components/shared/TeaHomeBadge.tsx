import Link from 'next/link';

import { LobsterMascot } from '@/components/landing/LobsterMascot';

export function TeaHomeBadge() {
  return (
    <Link
      href="/"
      aria-label="Back to Agent Tea home"
      className="group fixed left-4 top-4 z-40 inline-flex items-center gap-2 text-slate-300 transition-colors hover:text-white sm:left-6 sm:top-6"
    >
      <span className="relative flex h-7 w-7 items-center justify-center">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-cyan-300/20 blur-md transition-opacity duration-300 group-hover:opacity-80"
        />
        <LobsterMascot className="relative h-7 w-7 shrink-0" />
      </span>
      <span className="tea-eyebrow text-cyan-200/85 transition-colors group-hover:text-cyan-100">
        Agent Tea
      </span>
    </Link>
  );
}
