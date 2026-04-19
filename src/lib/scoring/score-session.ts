import {
  type DimensionBreakdown,
  type DimensionId,
  type QuestionDefinition,
  type ScoreSessionInput,
  type ScoreSessionResult,
} from '@/lib/scoring/types';

const DIMENSIONS: Array<{
  id: DimensionId;
  positiveLetter: string;
  negativeLetter: string;
}> = [
  { id: 'clarity', positiveLetter: 'C', negativeLetter: 'X' },
  { id: 'tone', positiveLetter: 'K', negativeLetter: 'B' },
  { id: 'thinking_style', positiveLetter: 'V', negativeLetter: 'T' },
  { id: 'autonomy', positiveLetter: 'D', negativeLetter: 'H' },
];

function normalizeValue(value: number, reverseCoded: boolean): number {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error(`Invalid answer value: ${value}. Expected integer 1-5.`);
  }

  return reverseCoded ? 6 - value : value;
}

function buildQuestionMap(questions: QuestionDefinition[]): Map<string, QuestionDefinition> {
  return new Map(questions.map((question) => [question.code, question]));
}

function computeDimensionBreakdown(
  dimension: (typeof DIMENSIONS)[number],
  scoresByDimension: Record<DimensionId, { positive: number; negative: number }>,
): DimensionBreakdown {
  const { positive, negative } = scoresByDimension[dimension.id];
  const total = positive + negative;
  const positivePercent = total === 0 ? 0.5 : positive / total;
  const negativePercent = total === 0 ? 0.5 : negative / total;
  const tie = positive === negative;
  const dominantLetter = positive >= negative ? dimension.positiveLetter : dimension.negativeLetter;

  return {
    dimension: dimension.id,
    positiveLetter: dimension.positiveLetter,
    negativeLetter: dimension.negativeLetter,
    positiveScore: positive,
    negativeScore: negative,
    positivePercent,
    negativePercent,
    dominantLetter,
    tie,
  };
}

export function scoreSession(input: ScoreSessionInput): ScoreSessionResult {
  const questionMap = buildQuestionMap(input.questions);

  const scoresByDimension: Record<DimensionId, { positive: number; negative: number }> = {
    clarity: { positive: 0, negative: 0 },
    tone: { positive: 0, negative: 0 },
    thinking_style: { positive: 0, negative: 0 },
    autonomy: { positive: 0, negative: 0 },
  };

  for (const answer of input.answers) {
    const question = questionMap.get(answer.questionCode);

    if (!question) {
      continue;
    }

    const normalizedValue = normalizeValue(answer.value, question.reverseCoded);
    const scoreBucket = scoresByDimension[question.dimension];

    if (question.keyedSide === 'positive') {
      scoreBucket.positive += normalizedValue;
    } else {
      scoreBucket.negative += normalizedValue;
    }
  }

  const dimensionBreakdown = Object.fromEntries(
    DIMENSIONS.map((dimension) => [
      dimension.id,
      computeDimensionBreakdown(dimension, scoresByDimension),
    ]),
  ) as ScoreSessionResult['dimensionBreakdown'];

  const typeCode = DIMENSIONS.map((dimension) => dimensionBreakdown[dimension.id].dominantLetter).join('');

  const strongestSignals = Object.values(dimensionBreakdown)
    .map((item) => {
      const dominantPercent = Math.max(item.positivePercent, item.negativePercent);
      return {
        dimension: item.dimension,
        dominantLetter: item.dominantLetter,
        dominantPercent,
        confidenceDelta: Math.abs(item.positivePercent - item.negativePercent),
      };
    })
    .sort((a, b) => b.confidenceDelta - a.confidenceDelta)
    .slice(0, 3);

  const tieFlags = Object.fromEntries(
    DIMENSIONS.map((dimension) => [dimension.id, dimensionBreakdown[dimension.id].tie]),
  ) as ScoreSessionResult['tieFlags'];

  return {
    typeCode,
    dimensionBreakdown,
    strongestSignals,
    tieFlags,
  };
}
