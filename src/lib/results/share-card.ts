import type { DimensionId } from '@/lib/scoring/types';
import { dimensionLabelsByMode, type NarrativeMode } from '@/lib/results/copy-content';

type BreakdownRow = {
  dominantLetter: string;
  positiveLetter: string;
  negativeLetter: string;
  positivePercent: number;
  negativePercent: number;
};

type Breakdown = Record<DimensionId, BreakdownRow>;

type BuildHighlightsInput = {
  mode: NarrativeMode;
  breakdown: Breakdown;
};

type BuildShareCardTextInput = {
  mode: NarrativeMode;
  typeCode: string;
  nickname: string;
  highlights: string[];
};

export function parseShareCardMode(value: string | undefined): NarrativeMode {
  if (value === 'intrusive') {
    return 'intrusive';
  }

  return 'normal';
}

export function buildShareCardHighlights(input: BuildHighlightsInput): string[] {
  const labels = dimensionLabelsByMode[input.mode];

  return Object.entries(input.breakdown)
    .map(([dimension, row]) => {
      const dominantPercent = Math.max(row.positivePercent, row.negativePercent);
      const sideLabel =
        row.dominantLetter === row.positiveLetter
          ? labels[dimension as DimensionId].positive
          : labels[dimension as DimensionId].negative;

      return {
        percent: dominantPercent,
        label: `${Math.round(dominantPercent * 100)}% ${sideLabel}`,
      };
    })
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3)
    .map((item) => item.label);
}

export function buildShareCardText(input: BuildShareCardTextInput): string {
  const statLine = input.highlights.join(' · ');

  if (input.mode === 'intrusive') {
    return `Intrusive thought from my AI: ${input.nickname} (${input.typeCode}) — ${statLine}`;
  }

  return `My agent says I am ${input.nickname} (${input.typeCode}) — ${statLine}`;
}
