import { describe, expect, it } from 'vitest';

import {
  buildShareCardHighlights,
  buildShareCardText,
  parseShareCardMode,
} from '@/lib/results/share-card';

const breakdown = {
  clarity: {
    dominantLetter: 'C',
    positiveLetter: 'C',
    negativeLetter: 'X',
    positivePercent: 0.78,
    negativePercent: 0.22,
  },
  tone: {
    dominantLetter: 'K',
    positiveLetter: 'K',
    negativeLetter: 'B',
    positivePercent: 0.84,
    negativePercent: 0.16,
  },
  thinking_style: {
    dominantLetter: 'V',
    positiveLetter: 'V',
    negativeLetter: 'T',
    positivePercent: 0.65,
    negativePercent: 0.35,
  },
  autonomy: {
    dominantLetter: 'D',
    positiveLetter: 'D',
    negativeLetter: 'H',
    positivePercent: 0.58,
    negativePercent: 0.42,
  },
} as const;

describe('share-card utils', () => {
  it('parses mode safely', () => {
    expect(parseShareCardMode('normal')).toBe('normal');
    expect(parseShareCardMode('intrusive')).toBe('intrusive');
    expect(parseShareCardMode('strange')).toBe('normal');
    expect(parseShareCardMode(undefined)).toBe('normal');
  });

  it('builds top three highlight metrics', () => {
    const highlights = buildShareCardHighlights({ mode: 'normal', breakdown });

    expect(highlights).toHaveLength(3);
    expect(highlights[0]).toMatch(/84%/);
    expect(highlights[1]).toMatch(/78%/);
  });

  it('builds share text for both modes', () => {
    const normal = buildShareCardText({
      mode: 'normal',
      typeCode: 'CKVD',
      nickname: 'The Dream Director',
      highlights: ['84% Kind', '78% Clear', '65% Visionary'],
    });

    const intrusive = buildShareCardText({
      mode: 'intrusive',
      typeCode: 'CKVD',
      nickname: 'The Dream Director',
      highlights: ['84% Agent Charmer', '78% Crystal Clear', '65% Moonshot Brain'],
    });

    expect(normal).toContain('My agent says I am');
    expect(intrusive).toContain('Intrusive thought');
  });
});
