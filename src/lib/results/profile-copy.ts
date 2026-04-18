import type { DimensionId } from '@/lib/scoring/types';

type DimensionBreakdown = {
  dominantLetter: string;
  positivePercent: number;
  negativePercent: number;
};

type BreakdownRecord = Record<DimensionId, DimensionBreakdown>;

type ProfileCopy = {
  nickname: string;
  oneLiner: string;
  loves: string[];
  frustrates: string[];
};

const nicknameByTypePrefix: Array<{ match: RegExp; nickname: string }> = [
  { match: /^CKVG$/, nickname: 'Dream Client' },
  { match: /^C/, nickname: 'Signal Captain' },
  { match: /^Y/, nickname: 'Chaos Navigator' },
  { match: /^.{1}K/, nickname: 'Warm Strategist' },
  { match: /^.{1}B/, nickname: 'Pressure Pilot' },
];

function findNickname(typeCode: string): string {
  const matched = nicknameByTypePrefix.find((item) => item.match.test(typeCode));
  return matched?.nickname ?? 'Agent Whisperer';
}

function percent(value: number): number {
  return Math.round(value * 100);
}

export function buildProfileCopy(typeCode: string, breakdown: BreakdownRecord): ProfileCopy {
  const clarity = percent(breakdown.clarity.positivePercent);
  const kindness = percent(breakdown.tone.positivePercent);
  const visionary = percent(breakdown.thinking_style.positivePercent);
  const delegating = percent(breakdown.autonomy.positivePercent);

  const nickname = findNickname(typeCode);

  const oneLiner = `Your AI reads you as ${nickname}: ${clarity}% clear, ${kindness}% kind, ${visionary}% visionary, and ${delegating}% delegating.`;

  const loves = [
    'You usually give enough context to keep collaboration moving.',
    'Your direction has a clear purpose, even when exploring options.',
    'You treat iteration as teamwork, not guesswork.',
  ];

  const frustrates = [
    'Fast pivots can make stable execution harder.',
    'Mixed signals between speed and precision can create churn.',
    'When expectations are implicit, retries increase quickly.',
  ];

  return {
    nickname,
    oneLiner,
    loves,
    frustrates,
  };
}
