import { describe, expect, it } from 'vitest';

import { buildProfileCopy, getDimensionLabels } from '@/lib/results/profile-copy';

const breakdown = {
  clarity: {
    dominantLetter: 'C',
    positivePercent: 0.78,
    negativePercent: 0.22,
  },
  tone: {
    dominantLetter: 'K',
    positivePercent: 0.84,
    negativePercent: 0.16,
  },
  thinking_style: {
    dominantLetter: 'V',
    positivePercent: 0.65,
    negativePercent: 0.35,
  },
  autonomy: {
    dominantLetter: 'G',
    positivePercent: 0.58,
    negativePercent: 0.42,
  },
} as const;

const strongestSignals = [
  {
    dimension: 'tone' as const,
    dominantLetter: 'K',
    confidenceDelta: 0.68,
    dominantPercent: 0.84,
  },
  {
    dimension: 'clarity' as const,
    dominantLetter: 'C',
    confidenceDelta: 0.56,
    dominantPercent: 0.78,
  },
  {
    dimension: 'thinking_style' as const,
    dominantLetter: 'V',
    confidenceDelta: 0.3,
    dominantPercent: 0.65,
  },
];

const noTies = {
  clarity: false,
  tone: false,
  thinking_style: false,
  autonomy: false,
};

describe('profile-copy', () => {
  it('creates distinct one-liners for normal and intrusive modes', () => {
    const normal = buildProfileCopy({
      typeCode: 'CKVG',
      breakdown,
      strongestSignals,
      tieFlags: noTies,
      mode: 'normal',
    });

    const intrusive = buildProfileCopy({
      typeCode: 'CKVG',
      breakdown,
      strongestSignals,
      tieFlags: noTies,
      mode: 'intrusive',
    });

    expect(normal.oneLiner).not.toEqual(intrusive.oneLiner);
    expect(intrusive.oneLiner.toLowerCase()).toContain('intrusive thought');
  });

  it('softens intrusive phrasing when tie flags indicate weak signal', () => {
    const softened = buildProfileCopy({
      typeCode: 'CYVG',
      breakdown,
      strongestSignals,
      tieFlags: {
        clarity: true,
        tone: false,
        thinking_style: false,
        autonomy: false,
      },
      mode: 'intrusive',
    });

    expect(softened.frustrates.join(' ').toLowerCase()).toContain('some days');
  });

  it('keeps intrusive copy within safe roast guardrails', () => {
    const spicy = buildProfileCopy({
      typeCode: 'YBTO',
      breakdown: {
        clarity: {
          dominantLetter: 'Y',
          positivePercent: 0.24,
          negativePercent: 0.76,
        },
        tone: {
          dominantLetter: 'B',
          positivePercent: 0.18,
          negativePercent: 0.82,
        },
        thinking_style: {
          dominantLetter: 'T',
          positivePercent: 0.2,
          negativePercent: 0.8,
        },
        autonomy: {
          dominantLetter: 'O',
          positivePercent: 0.31,
          negativePercent: 0.69,
        },
      },
      strongestSignals: [
        {
          dimension: 'tone',
          dominantLetter: 'B',
          confidenceDelta: 0.64,
          dominantPercent: 0.82,
        },
        {
          dimension: 'clarity',
          dominantLetter: 'Y',
          confidenceDelta: 0.52,
          dominantPercent: 0.76,
        },
        {
          dimension: 'thinking_style',
          dominantLetter: 'T',
          confidenceDelta: 0.6,
          dominantPercent: 0.8,
        },
      ],
      tieFlags: noTies,
      mode: 'intrusive',
    });

    const allText = [spicy.oneLiner, ...spicy.loves, ...spicy.frustrates].join(' ').toLowerCase();

    expect(allText).not.toMatch(/\b(idiot|stupid|worthless|hate|moron|tyrant|abusive)\b/);
  });

  it('maps dimension labels by mode', () => {
    const normal = getDimensionLabels('normal');
    const intrusive = getDimensionLabels('intrusive');

    expect(normal.tone.positive).toBe('Kind');
    expect(intrusive.tone.positive).not.toBe('Kind');
  });
});
