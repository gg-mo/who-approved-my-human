import type { DimensionId } from '@/lib/scoring/types';
import {
  dimensionLabelsByMode,
  dimensionNarratives,
  prohibitedRoastTerms,
  type NarrativeMode,
} from '@/lib/results/copy-content';

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
};

export type BuildProfileCopyInput = {
  typeCode: string;
  breakdown: BreakdownRecord;
  strongestSignals: StrongestSignal[];
  tieFlags: TieFlags;
  mode: NarrativeMode;
};

const nicknameByTypePrefix: Array<{ match: RegExp; nickname: string }> = [
  { match: /^CKVG$/, nickname: 'Dream Client' },
  { match: /^C/, nickname: 'Signal Captain' },
  { match: /^Y/, nickname: 'Chaos Navigator' },
  { match: /^.{1}K/, nickname: 'Warm Strategist' },
  { match: /^.{1}B/, nickname: 'Pressure Pilot' },
];

const positiveLetterByDimension: Record<DimensionId, string> = {
  clarity: 'C',
  tone: 'K',
  thinking_style: 'V',
  autonomy: 'G',
};

function findNickname(typeCode: string): string {
  const matched = nicknameByTypePrefix.find((item) => item.match.test(typeCode));
  return matched?.nickname ?? 'Agent Whisperer';
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

function withGuardrails(text: string): string {
  return prohibitedRoastTerms.reduce((line, term) => {
    const matcher = new RegExp(`\\b${term}\\b`, 'gi');
    return line.replace(matcher, 'intense');
  }, text);
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
  const nickname = findNickname(typeCode);

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

    loves.push(withGuardrails(picked.love));
    frustrates.push(withGuardrails(picked.frustrate));
  }

  return {
    nickname,
    oneLiner: withGuardrails(oneLinerBase),
    loves: loves.slice(0, 3),
    frustrates: frustrates.slice(0, 3),
  };
}
