import type { DimensionId } from '@/lib/scoring/types';
import {
  dimensionLabelsByMode,
  dimensionNarratives,
  type NarrativeMode,
} from '@/lib/results/copy-content';
import { moderateCopyLine, moderateCopyLines } from '@/lib/results/moderation';

type DimensionBreakdown = {
  dominantLetter: string;
  positivePercent: number;
  negativePercent: number;
};

type BreakdownRecord = Record<DimensionId, DimensionBreakdown>;

type TieFlags = Record<DimensionId, boolean>;

type StrongestSignal = {
  dimension: DimensionId;
  dominantLetter: string;
  confidenceDelta: number;
  dominantPercent: number;
};

export type ProfileCopy = {
  nickname: string;
  oneLiner: string;
  loves: string[];
  frustrates: string[];
  moderation: {
    rewriteCount: number;
    highestSeverity: 0 | 1 | 2 | 3;
    terms: string[];
  };
};

export type BuildProfileCopyInput = {
  typeCode: string;
  breakdown: BreakdownRecord;
  strongestSignals: StrongestSignal[];
  tieFlags: TieFlags;
  mode: NarrativeMode;
};

type NicknamePair = { normal: string; intrusive: string };

const nicknameByTypeCode: Record<string, NicknamePair> = {
  CKVD: { normal: 'The Dream Director', intrusive: 'The Rare Good Client' },
  CKVH: { normal: 'The Vision Sculptor', intrusive: 'The Friendly Micromanager' },
  CKTD: { normal: 'The Trusted Operator', intrusive: 'The Blessed Adult' },
  CKTH: { normal: 'The Precision Partner', intrusive: 'The Nice One Who Still Hovers' },
  CBVD: { normal: 'The Bold Director', intrusive: 'The Demanding Genius' },
  CBVH: { normal: 'The Exacting Visionary', intrusive: 'The Creative Control Freak' },
  CBTD: { normal: 'The Results Driver', intrusive: 'The Taskmaster' },
  CBTH: { normal: 'The Hardline Editor', intrusive: 'The Final-Final-Final Boss' },
  XKVD: { normal: 'The Intuitive Dreamer', intrusive: 'The Vibes-Only Visionary' },
  XKVH: { normal: 'The Collaborative Explorer', intrusive: 'The Sweet But Unclear One' },
  XKTD: { normal: 'The Adaptive Starter', intrusive: 'The "You Know What I Mean" Person' },
  XKTH: { normal: 'The Guided Builder', intrusive: 'The Backseat Driver With Good Intentions' },
  XBVD: { normal: 'The Wildcard Director', intrusive: 'The Chaos Commander' },
  XBVH: { normal: 'The Unfiltered Auteur', intrusive: 'The Nightmare Muse' },
  XBTD: { normal: 'The Pressure Operator', intrusive: 'The Vague Menace' },
  XBTH: { normal: 'The Combative Controller', intrusive: 'The Bossfight' },
};

const positiveLetterByDimension: Record<DimensionId, string> = {
  clarity: 'C',
  tone: 'K',
  thinking_style: 'V',
  autonomy: 'D',
};

function findNickname(typeCode: string, mode: NarrativeMode): string {
  const pair = nicknameByTypeCode[typeCode];
  if (!pair) {
    return 'Agent Whisperer';
  }
  return mode === 'intrusive' ? pair.intrusive : pair.normal;
}

function percent(value: number): number {
  return Math.round(value * 100);
}

function isPositiveDominant(dimension: DimensionId, dominantLetter: string): boolean {
  return positiveLetterByDimension[dimension] === dominantLetter;
}

function getSignalDelta(
  dimension: DimensionId,
  breakdown: BreakdownRecord,
  strongestSignals: StrongestSignal[],
): number {
  const fromStrongest = strongestSignals.find((signal) => signal.dimension === dimension);

  if (fromStrongest) {
    return fromStrongest.confidenceDelta;
  }

  return Math.abs(breakdown[dimension].positivePercent - breakdown[dimension].negativePercent);
}

function pickDimensionOrder(strongestSignals: StrongestSignal[]): DimensionId[] {
  const ordered = strongestSignals.map((signal) => signal.dimension);
  const fallback: DimensionId[] = ['clarity', 'tone', 'thinking_style', 'autonomy'];

  for (const dimension of fallback) {
    if (!ordered.includes(dimension)) {
      ordered.push(dimension);
    }
  }

  return ordered;
}

export function getDimensionLabels(mode: NarrativeMode) {
  return dimensionLabelsByMode[mode];
}

export function buildProfileCopy(input: BuildProfileCopyInput): ProfileCopy {
  const { typeCode, breakdown, strongestSignals, tieFlags, mode } = input;
  const clarity = percent(breakdown.clarity.positivePercent);
  const kindness = percent(breakdown.tone.positivePercent);
  const visionary = percent(breakdown.thinking_style.positivePercent);
  const delegating = percent(breakdown.autonomy.positivePercent);
  const nickname = findNickname(typeCode, mode);

  const averageConfidence =
    (Math.abs(breakdown.clarity.positivePercent - breakdown.clarity.negativePercent) +
      Math.abs(breakdown.tone.positivePercent - breakdown.tone.negativePercent) +
      Math.abs(breakdown.thinking_style.positivePercent - breakdown.thinking_style.negativePercent) +
      Math.abs(breakdown.autonomy.positivePercent - breakdown.autonomy.negativePercent)) /
    4;

  const oneLinerBase =
    mode === 'normal'
      ? `Your AI reads you as ${nickname}: ${clarity}% clear, ${kindness}% kind, ${visionary}% visionary, and ${delegating}% delegating.`
      : averageConfidence < 0.25
        ? `Low-certainty intrusive thought: ${nickname}. Right now your vibe lands at ${clarity}% clear, ${kindness}% kind, ${visionary}% visionary, and ${delegating}% delegating.`
        : `Intrusive thought unlocked: ${nickname}. Your AI clocks you at ${clarity}% clear, ${kindness}% kind, ${visionary}% visionary, and ${delegating}% delegating.`;

  const dimensionOrder = pickDimensionOrder(strongestSignals);
  const loves: string[] = [];
  const frustrates: string[] = [];

  for (const dimension of dimensionOrder) {
    const positiveDominant = isPositiveDominant(dimension, breakdown[dimension].dominantLetter);
    const dominantSide = positiveDominant ? 'positive' : 'negative';
    const weakSignal = tieFlags[dimension] || getSignalDelta(dimension, breakdown, strongestSignals) < 0.2;
    const narrative = dimensionNarratives[dimension][dominantSide];

    const picked =
      mode === 'normal'
        ? narrative.normal
        : weakSignal
          ? narrative.intrusive.soft
          : narrative.intrusive.strong;

    loves.push(picked.love);
    frustrates.push(picked.frustrate);
  }

  const oneLinerModerated = moderateCopyLine(oneLinerBase);
  const lovesModerated = moderateCopyLines(loves.slice(0, 3));
  const frustratesModerated = moderateCopyLines(frustrates.slice(0, 3));
  const rewritePool = [
    ...oneLinerModerated.rewrites,
    ...lovesModerated.rewrites,
    ...frustratesModerated.rewrites,
  ];
  const highestSeverity = rewritePool.reduce<0 | 1 | 2 | 3>(
    (acc, item) => (item.severity > acc ? item.severity : acc),
    0,
  );

  return {
    nickname,
    oneLiner: oneLinerModerated.text,
    loves: lovesModerated.text,
    frustrates: frustratesModerated.text,
    moderation: {
      rewriteCount: rewritePool.length,
      highestSeverity,
      terms: [...new Set(rewritePool.map((item) => item.term))],
    },
  };
}
