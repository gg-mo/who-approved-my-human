import { describe, expect, it } from 'vitest';

import { scoreSession } from '@/lib/scoring/score-session';
import type { QuestionDefinition, SessionAnswer } from '@/lib/scoring/types';

const questionBank: QuestionDefinition[] = [
  { code: 'Q01', dimension: 'clarity', keyedSide: 'positive', reverseCoded: false, questionKind: 'core' },
  { code: 'Q02', dimension: 'clarity', keyedSide: 'negative', reverseCoded: false, questionKind: 'core' },
  { code: 'Q03', dimension: 'tone', keyedSide: 'positive', reverseCoded: false, questionKind: 'core' },
  { code: 'Q04', dimension: 'tone', keyedSide: 'negative', reverseCoded: false, questionKind: 'core' },
  { code: 'Q05', dimension: 'thinking_style', keyedSide: 'positive', reverseCoded: false, questionKind: 'core' },
  { code: 'Q06', dimension: 'thinking_style', keyedSide: 'negative', reverseCoded: false, questionKind: 'core' },
  { code: 'Q07', dimension: 'autonomy', keyedSide: 'positive', reverseCoded: false, questionKind: 'core' },
  { code: 'Q08', dimension: 'autonomy', keyedSide: 'negative', reverseCoded: false, questionKind: 'core' },
  { code: 'Q21', dimension: 'clarity', keyedSide: 'negative', reverseCoded: false, questionKind: 'spicy' },
  { code: 'Q22', dimension: 'tone', keyedSide: 'positive', reverseCoded: true, questionKind: 'spicy' },
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

    expect(result.typeCode).toBe('CKVG');
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

  it('weights spicy and core answers equally', () => {
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
    expect(withSpicy.dimensionBreakdown.clarity.dominantLetter).toBe('Y');
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

  it('throws on invalid answer values', () => {
    expect(() =>
      scoreSession({
        questions: questionBank,
        answers: [{ questionCode: 'Q01', value: 6 }],
      }),
    ).toThrowError(/expected integer 1-5/i);
  });
});
