import type { DimensionId } from './types';

export const LIKERT_SCALE = {
  MIN: 1,
  MAX: 5,
} as const;

export const DIMENSION_IDS: readonly DimensionId[] = [
  'clarity',
  'tone',
  'thinking_style',
  'autonomy',
] as const;

export const MIN_SAMPLE_FOR_SOCIAL_PROOF = 24;

export const MAX_REASONING_SNIPPETS = 5;

export const MAX_EVIDENCE_ITEMS = 5;
