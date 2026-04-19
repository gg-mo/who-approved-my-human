import { describe, expect, it } from 'vitest';

import { scoreSession } from '@/lib/scoring/score-session';
import type { QuestionDefinition, SessionAnswer } from '@/lib/scoring/types';

const questionBank: QuestionDefinition[] = [
  { code: 'Q01', dimension: 'clarity', keyedSide: 'positive', reverseCoded: false },
  { code: 'Q02', dimension: 'clarity', keyedSide: 'negative', reverseCoded: false },
  { code: 'Q03', dimension: 'tone', keyedSide: 'positive', reverseCoded: false },
  { code: 'Q04', dimension: 'tone', keyedSide: 'negative', reverseCoded: false },
  { code: 'Q05', dimension: 'thinking_style', keyedSide: 'positive', reverseCoded: false },
  { code: 'Q06', dimension: 'thinking_style', keyedSide: 'negative', reverseCoded: false },
  { code: 'Q07', dimension: 'autonomy', keyedSide: 'positive', reverseCoded: false },
  { code: 'Q08', dimension: 'autonomy', keyedSide: 'negative', reverseCoded: false },
  { code: 'Q21', dimension: 'clarity', keyedSide: 'negative', reverseCoded: false },
  { code: 'Q22', dimension: 'tone', keyedSide: 'positive', reverseCoded: true },
];

describe('scoreSession', () => {
  it('returns deterministic type code and breakdown', () => {
    const answers: SessionAnswer[] = [
      { questionCode: 'Q01', value: 5 },
      { questionCode: 'Q02', value: 1 },
      { questionCode: 'Q03', value: 4 },
      { questionCode: 'Q04', value: 2 },
      { questionCode: 'Q05', value: 5 },
      { questionCode: 'Q06', value: 2 },
      { questionCode: 'Q07', value: 4 },
      { questionCode: 'Q08', value: 3 },
    ];

    const result = scoreSession({ questions: questionBank, answers });

    expect(result.typeCode).toBe('CKVD');
    expect(result.dimensionBreakdown.clarity.positivePercent).toBeGreaterThan(0.79);
    expect(result.dimensionBreakdown.tone.negativePercent).toBeLessThan(0.35);
    expect(result.strongestSignals).toHaveLength(3);
  });

  it('applies reverse coding before scoring', () => {
    const result = scoreSession({
      questions: questionBank,
      answers: [{ questionCode: 'Q22', value: 1 }],
    });

    expect(result.dimensionBreakdown.tone.positiveScore).toBe(5);
    expect(result.dimensionBreakdown.tone.dominantLetter).toBe('K');
  });

  it('weights every answer equally regardless of order', () => {
    const coreOnly = scoreSession({
      questions: questionBank,
      answers: [{ questionCode: 'Q01', value: 3 }],
    });

    const withSpicy = scoreSession({
      questions: questionBank,
      answers: [
        { questionCode: 'Q01', value: 3 },
        { questionCode: 'Q21', value: 5 },
      ],
    });

    expect(coreOnly.dimensionBreakdown.clarity.dominantLetter).toBe('C');
    expect(withSpicy.dimensionBreakdown.clarity.dominantLetter).toBe('X');
  });

  it('breaks ties toward the positive letter and marks tie flags', () => {
    const result = scoreSession({
      questions: questionBank,
      answers: [
        { questionCode: 'Q01', value: 3 },
        { questionCode: 'Q02', value: 3 },
      ],
    });

    expect(result.dimensionBreakdown.clarity.tie).toBe(true);
    expect(result.dimensionBreakdown.clarity.dominantLetter).toBe('C');
    expect(result.tieFlags.clarity).toBe(true);
  });

  it('produces every expected typeCode letter across all 16 combinations', () => {
    const combos: Array<{ c: 1 | 5; k: 1 | 5; v: 1 | 5; g: 1 | 5; expected: string }> = [];
    const letters = {
      c: { 5: 'C', 1: 'X' } as const,
      k: { 5: 'K', 1: 'B' } as const,
      v: { 5: 'V', 1: 'T' } as const,
      g: { 5: 'D', 1: 'H' } as const,
    };
    for (const c of [5, 1] as const) {
      for (const k of [5, 1] as const) {
        for (const v of [5, 1] as const) {
          for (const g of [5, 1] as const) {
            combos.push({
              c,
              k,
              v,
              g,
              expected: `${letters.c[c]}${letters.k[k]}${letters.v[v]}${letters.g[g]}`,
            });
          }
        }
      }
    }

    expect(combos).toHaveLength(16);

    const produced = combos.map(({ c, k, v, g }) => {
      const opp = (val: 1 | 5): 1 | 5 => (val === 5 ? 1 : 5);
      return scoreSession({
        questions: questionBank,
        answers: [
          { questionCode: 'Q01', value: c },
          { questionCode: 'Q02', value: opp(c) },
          { questionCode: 'Q03', value: k },
          { questionCode: 'Q04', value: opp(k) },
          { questionCode: 'Q05', value: v },
          { questionCode: 'Q06', value: opp(v) },
          { questionCode: 'Q07', value: g },
          { questionCode: 'Q08', value: opp(g) },
        ],
      }).typeCode;
    });

    expect(produced).toEqual(combos.map((combo) => combo.expected));
  });

  it('throws on invalid answer values', () => {
    expect(() =>
      scoreSession({
        questions: questionBank,
        answers: [{ questionCode: 'Q01', value: 6 }],
      }),
    ).toThrowError(/expected integer 1-5/i);
  });
});
