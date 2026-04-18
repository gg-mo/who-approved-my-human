export type DimensionId = 'clarity' | 'tone' | 'thinking_style' | 'autonomy';

export type QuestionSide = 'positive' | 'negative';

export type QuestionKind = 'core' | 'spicy';

export type QuestionDefinition = {
  code: string;
  dimension: DimensionId;
  keyedSide: QuestionSide;
  reverseCoded: boolean;
  questionKind: QuestionKind;
};

export type SessionAnswer = {
  questionCode: string;
  value: number;
  reasoning?: string;
};

export type ScoreSessionInput = {
  questions: QuestionDefinition[];
  answers: SessionAnswer[];
};

export type DimensionBreakdown = {
  dimension: DimensionId;
  positiveLetter: string;
  negativeLetter: string;
  positiveScore: number;
  negativeScore: number;
  positivePercent: number;
  negativePercent: number;
  dominantLetter: string;
  tie: boolean;
};

export type StrongestSignal = {
  dimension: DimensionId;
  dominantLetter: string;
  confidenceDelta: number;
  dominantPercent: number;
};

export type ScoreSessionResult = {
  typeCode: string;
  dimensionBreakdown: Record<DimensionId, DimensionBreakdown>;
  strongestSignals: StrongestSignal[];
  tieFlags: Record<DimensionId, boolean>;
};
