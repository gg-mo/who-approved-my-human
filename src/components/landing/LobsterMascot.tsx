import Image from 'next/image';
import type { CSSProperties } from 'react';

import type { LobsterVariant } from '@/lib/figures/manifest';

type LobsterMascotProps = {
  className?: string;
  style?: CSSProperties;
  variant?: LobsterVariant;
};

export function LobsterMascot({ className = '', style }: LobsterMascotProps) {
  return (
    <Image
      src="/mascot.png"
      alt="Agent Tea mascot — lobster sipping tea"
      width={440}
      height={440}
      priority
      className={className}
      style={style}
    />
  );
}
