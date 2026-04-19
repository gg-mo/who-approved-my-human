import { randomUUID } from 'node:crypto';

import { z } from 'zod';

import { parseEncodedAnswers } from '@/lib/ingestion/encoded-parser';
import type { SessionAnswer } from '@/lib/scoring/types';
import { scoreSession } from '@/lib/scoring/score-session';
import type {
  DimensionId,
  ScoreSessionResult,
  StrongestSignal,
} from '@/lib/scoring/types';
import {
  DIMENSION_IDS,
  LIKERT_SCALE,
  MAX_REASONING_SNIPPETS,
  MAX_EVIDENCE_ITEMS,
  MIN_SAMPLE_FOR_SOCIAL_PROOF,
} from '@/lib/scoring/constants';
import { constrainedShuffleQuestions } from '@/lib/questions/constrained-shuffle';
import { getSessionStore } from '@/lib/server/session-store';
import { getBundledQuestionSet } from '@/lib/server/session-store/spec-loader';
import type {
  InstructionRun,
  PersistedAnswer,
  PersistedResult,
  QuestionRow,
  SessionIntakeMode,
  SessionRow,
} from '@/lib/server/session-store/types';

export type SessionQuestionPayload = {
  code: string;
  text: string;
  dimension: QuestionRow['dimension'];
  keyedSide: QuestionRow['keyedSide'];
};

function normalizeAnswerValue(raw: number, reverseCoded: boolean) {
  return reverseCoded ? 6 - raw : raw;
}

async function safeRecordInstructionRun(run: InstructionRun) {
  try {
    await getSessionStore().recordInstructionRun(run);
  } catch (error) {
    console.warn('recordInstructionRun failed (non-fatal)', error);
  }
}

function mapQuestionsToScoring(questions: QuestionRow[]) {
  return questions.map((question) => ({
    code: question.code,
    dimension: question.dimension,
    keyedSide: question.keyedSide,
    reverseCoded: question.reverseCoded,
  }));
}

function mapAnswersToScoring(answers: PersistedAnswer[]): SessionAnswer[] {
  return answers.map((answer) => ({
    questionCode: answer.questionCode,
    value: answer.rawValue,
    reasoning: answer.reasoning,
  }));
}

function toQuestionMap(questions: QuestionRow[]) {
  return new Map(questions.map((question) => [question.code, question]));
}

function dominantSideForDimension(item: {
  dominantLetter: string;
  positiveLetter: string;
  negativeLetter: string;
}) {
  return item.dominantLetter === item.positiveLetter ? 'positive' : 'negative';
}

function buildEvidence(params: {
  questions: QuestionRow[];
  answers: PersistedAnswer[];
  dimensionBreakdown: ScoreSessionResult['dimensionBreakdown'];
}) {
  const questionMap = toQuestionMap(params.questions);
  const supportRows: Array<{
    questionCode: string;
    questionText: string;
    dimension: DimensionId;
    supportScore: number;
    contradictionScore: number;
    selectedValue: number;
    reasoning?: string;
  }> = [];

  for (const answer of params.answers) {
    const question = questionMap.get(answer.questionCode);

    if (!question) {
      continue;
    }

    const breakdown = params.dimensionBreakdown[question.dimension];
    const dominantSide = dominantSideForDimension(breakdown);
    const supportsDominant =
      question.keyedSide === dominantSide ? answer.normalizedValue : 6 - answer.normalizedValue;
    const contradictsDominant =
      question.keyedSide === dominantSide ? 6 - answer.normalizedValue : answer.normalizedValue;

    supportRows.push({
      questionCode: answer.questionCode,
      questionText: question.text,
      dimension: question.dimension,
      supportScore: supportsDominant,
      contradictionScore: contradictsDominant,
      selectedValue: answer.rawValue,
      reasoning: answer.reasoning,
    });
  }

  const strongestSupport = [...supportRows]
    .sort((a, b) => b.supportScore - a.supportScore)
    .slice(0, MAX_EVIDENCE_ITEMS);
  const strongestContradictions = [...supportRows]
    .sort((a, b) => b.contradictionScore - a.contradictionScore)
    .slice(0, MAX_EVIDENCE_ITEMS);

  return {
    strongestSupport,
    strongestContradictions,
  };
}

const dimensionIdSchema = z.enum(['clarity', 'tone', 'thinking_style', 'autonomy']);

const dimensionBreakdownEntrySchema = z.object({
  dimension: dimensionIdSchema.optional(),
  dominantLetter: z.string(),
  positiveLetter: z.string(),
  negativeLetter: z.string(),
  positivePercent: z.number().finite(),
  negativePercent: z.number().finite(),
  positiveScore: z.number().finite().optional(),
  negativeScore: z.number().finite().optional(),
  tie: z.boolean().optional(),
});

const dimensionBreakdownSchema = z.object({
  clarity: dimensionBreakdownEntrySchema,
  tone: dimensionBreakdownEntrySchema,
  thinking_style: dimensionBreakdownEntrySchema,
  autonomy: dimensionBreakdownEntrySchema,
});

const strongestSignalsSchema = z
  .array(
    z.object({
      dimension: dimensionIdSchema,
      dominantLetter: z.string(),
      confidenceDelta: z.number().finite(),
      dominantPercent: z.number().finite(),
    }),
  )
  .default([]);

const tieFlagsSchema = z
  .object({
    clarity: z.boolean().optional(),
    tone: z.boolean().optional(),
    thinking_style: z.boolean().optional(),
    autonomy: z.boolean().optional(),
  })
  .default({});

type NormalizedPersistedResult = {
  typeCode: string;
  dimensionBreakdown: ScoreSessionResult['dimensionBreakdown'];
  strongestSignals: StrongestSignal[];
  tieFlags: ScoreSessionResult['tieFlags'];
  scoreSummary?: Record<string, unknown>;
};

function normalizePersistedResult(result: PersistedResult): NormalizedPersistedResult | null {
  if (typeof result.typeCode !== 'string') {
    return null;
  }

  const breakdownParse = dimensionBreakdownSchema.safeParse(result.dimensionBreakdown);
  if (!breakdownParse.success) {
    return null;
  }

  const signalsParse = strongestSignalsSchema.safeParse(result.strongestSignals);
  const tiesParse = tieFlagsSchema.safeParse(result.tieFlags);

  const dimensionBreakdown = {} as ScoreSessionResult['dimensionBreakdown'];
  for (const dimensionId of DIMENSION_IDS) {
    const entry = breakdownParse.data[dimensionId];
    dimensionBreakdown[dimensionId] = {
      dimension: dimensionId,
      dominantLetter: entry.dominantLetter,
      positiveLetter: entry.positiveLetter,
      negativeLetter: entry.negativeLetter,
      positivePercent: entry.positivePercent,
      negativePercent: entry.negativePercent,
      positiveScore: entry.positiveScore ?? 0,
      negativeScore: entry.negativeScore ?? 0,
      tie: entry.tie ?? false,
    };
  }

  const tieData = tiesParse.success ? tiesParse.data : {};

  return {
    typeCode: result.typeCode,
    dimensionBreakdown,
    strongestSignals: signalsParse.success ? signalsParse.data : [],
    tieFlags: {
      clarity: tieData.clarity ?? false,
      tone: tieData.tone ?? false,
      thinking_style: tieData.thinking_style ?? false,
      autonomy: tieData.autonomy ?? false,
    },
    scoreSummary: result.scoreSummary,
  };
}

export async function createSession(params: {
  intakeMode: SessionIntakeMode;
  questionSetVersion?: string;
  referralCode?: string;
  referrerSessionId?: string;
}) {
  const store = getSessionStore();
  const questionSet = await store.getActiveQuestionSet(params.questionSetVersion);

  if (!questionSet) {
    throw new Error('No active question set found. Run db:ingest-questions first.');
  }

  const questions = await store.getQuestions(questionSet.id);
  const randomSeed = randomUUID();

  const session = await store.createSession({
    questionSetId: questionSet.id,
    questionSetVersion: questionSet.version,
    intakeMode: params.intakeMode,
    randomSeed,
    referralCode: params.referralCode,
    referrerSessionId: params.referrerSessionId,
  });

  await store.recordEvent({
    sessionId: session.id,
    eventName: 'session_created',
    eventSource: 'server',
    eventPayload: {
      intakeMode: session.intakeMode,
      questionSetVersion: session.questionSetVersion,
      referralCode: params.referralCode ?? null,
      referrerSessionId: params.referrerSessionId ?? null,
    },
  });

  const orderedQuestions = constrainedShuffleQuestions(questions, randomSeed);

  return {
    session,
    questions: orderedQuestions.map((question) => ({
      code: question.code,
      text: question.text,
      dimension: question.dimension,
      keyedSide: question.keyedSide,
    })) satisfies SessionQuestionPayload[],
  };
}

async function upsertNormalizedAnswers(
  session: SessionRow,
  answerInputs: Array<{ questionCode: string; value: number; reasoning?: string }>,
  source: SessionIntakeMode,
) {
  const store = getSessionStore();
  const questions = await store.getQuestions(session.questionSetId);
  const questionMap = toQuestionMap(questions);

  const normalizedAnswers: PersistedAnswer[] = answerInputs.map((answer) => {
    const question = questionMap.get(answer.questionCode);

    if (!question) {
      throw new Error(`Unknown question code: ${answer.questionCode}`);
    }

    if (
      !Number.isInteger(answer.value) ||
      answer.value < LIKERT_SCALE.MIN ||
      answer.value > LIKERT_SCALE.MAX
    ) {
      throw new Error(
        `Invalid answer value for ${answer.questionCode}. Expected integer ${LIKERT_SCALE.MIN}-${LIKERT_SCALE.MAX}.`,
      );
    }

    return {
      questionCode: answer.questionCode,
      rawValue: answer.value,
      normalizedValue: normalizeAnswerValue(answer.value, question.reverseCoded),
      reasoning: answer.reasoning,
      source,
    };
  });

  await store.upsertAnswers(session.id, normalizedAnswers);
  await store.setSessionStatus(session.id, 'ingested');

  return { accepted: normalizedAnswers.length };
}

export async function ingestDirectAnswers(
  session: SessionRow,
  answers: Array<{ questionCode: string; value: number; reasoning?: string }>,
) {
  return upsertNormalizedAnswers(session, answers, 'manual');
}

export async function ingestCodingAgentAnswers(
  session: SessionRow,
  answers: Array<{ questionCode: string; value: number; reasoning?: string }>,
  rawPayload: string,
) {
  const store = getSessionStore();
  const questions = await store.getQuestions(session.questionSetId);
  const providedCodes = new Set(answers.map((a) => a.questionCode));
  const missing = questions.map((q) => q.code).filter((code) => !providedCodes.has(code));

  if (missing.length > 0) {
    throw new Error(`Missing required answers: ${missing.join(', ')}`);
  }

  const ingestion = await upsertNormalizedAnswers(session, answers, 'coding_agent');

  await safeRecordInstructionRun({
    sessionId: session.id,
    intakeMode: 'coding_agent',
    rawPayload,
    normalizedPayload: rawPayload,
    parseStatus: 'success',
    warnings: [],
    errors: [],
  });

  return ingestion;
}

export async function ingestEncodedPayload(session: SessionRow, payload: string) {
  const store = getSessionStore();
  const questions = await store.getQuestions(session.questionSetId);
  const requiredQuestionCodes = questions.map((question) => question.code);

  const parsed = parseEncodedAnswers({ payload, requiredQuestionCodes });

  if (!parsed.ok) {
    await safeRecordInstructionRun({
      sessionId: session.id,
      intakeMode: 'chatbot',
      rawPayload: payload,
      normalizedPayload: parsed.normalizedPayload,
      parseStatus: 'error',
      warnings: parsed.warnings,
      errors: parsed.hints,
    });

    return parsed;
  }

  await upsertNormalizedAnswers(
    session,
    parsed.answers.map((answer) => ({
      questionCode: answer.questionCode,
      value: answer.value,
    })),
    'chatbot',
  );

  await safeRecordInstructionRun({
    sessionId: session.id,
    intakeMode: 'chatbot',
    rawPayload: payload,
    normalizedPayload: parsed.normalizedPayload,
    parseStatus: parsed.warnings.length > 0 ? 'partial' : 'success',
    warnings: parsed.warnings,
    errors: parsed.hints,
  });

  return parsed;
}

export async function scoreSessionById(session: SessionRow) {
  const store = getSessionStore();
  const questions = await store.getQuestions(session.questionSetId);
  const answers = await store.getAnswers(session.id);

  const result = scoreSession({
    questions: mapQuestionsToScoring(questions),
    answers: mapAnswersToScoring(answers),
  });

  await store.upsertResult(session.id, {
    typeCode: result.typeCode,
    dimensionBreakdown: result.dimensionBreakdown,
    strongestSignals: result.strongestSignals,
    tieFlags: result.tieFlags,
    scoreSummary: {
      answerCount: answers.length,
      questionCount: questions.length,
    },
  });

  await store.setSessionStatus(session.id, 'scored');
  await store.recordEvent({
    sessionId: session.id,
    userId: session.userId,
    eventName: 'session_scored',
    eventSource: 'server',
    eventPayload: {
      typeCode: result.typeCode,
    },
  });

  return result;
}

export async function getSessionResultById(sessionId: string) {
  const store = getSessionStore();
  const result = await store.getResult(sessionId);

  if (!result) {
    return null;
  }

  const normalizedResult = normalizePersistedResult(result);

  if (!normalizedResult) {
    return null;
  }

  const session = await store.getSession(sessionId);
  if (!session) {
    return null;
  }

  const questions = await store.getQuestions(session.questionSetId);
  const bundledByCode = new Map(
    getBundledQuestionSet().questions.map((question) => [question.code, question]),
  );
  const questionsByCode = new Map(
    questions.map((question) => {
      const bundled = bundledByCode.get(question.code);
      return [question.code, bundled ?? question];
    }),
  );
  const answers = await store.getAnswers(sessionId);
  const replayAnswers = answers
    .map((answer) => {
      const question = questionsByCode.get(answer.questionCode) ?? bundledByCode.get(answer.questionCode);
      return {
        questionCode: answer.questionCode,
        questionText: question?.text ?? answer.questionCode,
        selectedValue: answer.rawValue,
        displayOrder: question?.displayOrder ?? Number.MAX_SAFE_INTEGER,
        reasoning: answer.reasoning,
      };
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const reasoningSnippets = answers
    .filter((answer) => Boolean(answer.reasoning))
    .slice(0, MAX_REASONING_SNIPPETS)
    .map((answer) => ({
      questionCode: answer.questionCode,
      reasoning: answer.reasoning,
    }));
  const evidence = buildEvidence({
    questions,
    answers,
    dimensionBreakdown: normalizedResult.dimensionBreakdown,
  });

  return {
    ...normalizedResult,
    replayAnswers,
    reasoningSnippets,
    evidence,
  };
}

export async function getTypeDistributionSummary(days = 7) {
  const store = getSessionStore();
  const rows = await store.getTypeDistribution(days);
  const sampleCount = rows.reduce((sum, row) => sum + row.count, 0);
  const minimumSample = MIN_SAMPLE_FOR_SOCIAL_PROOF;

  if (sampleCount < minimumSample) {
    return {
      sampleCount,
      minimumSample,
      mostCommon: null,
      rarest: null,
      rows,
    };
  }

  const sorted = [...rows].sort((a, b) => b.count - a.count);
  const mostCommon = sorted[0] ?? null;
  const rarest = [...sorted].sort((a, b) => a.count - b.count)[0] ?? null;

  return {
    sampleCount,
    minimumSample,
    mostCommon,
    rarest,
    rows: sorted,
  };
}

export async function getFunnelSummary(days = 7) {
  const store = getSessionStore();
  return store.getFunnelStats(days);
}

export async function trackEvent(params: {
  eventName: string;
  sessionId?: string;
  userId?: string;
  eventSource?: 'client' | 'server';
  eventPayload?: Record<string, unknown>;
}) {
  const store = getSessionStore();
  await store.recordEvent({
    eventName: params.eventName,
    sessionId: params.sessionId,
    userId: params.userId,
    eventSource: params.eventSource ?? 'server',
    eventPayload: params.eventPayload,
  });
}

export async function createCompareSet(params: {
  sessionIds: string[];
  labels?: string[];
  ownerUserId?: string;
}) {
  const store = getSessionStore();
  return store.createCompareSet(params);
}

export async function getCompareSetResults(compareSetId: string) {
  const store = getSessionStore();
  const compareSet = await store.getCompareSet(compareSetId);

  if (!compareSet) {
    return null;
  }

  // Fan out all per-session fetches (session row + stored result) in parallel,
  // then load each unique question set once — avoiding per-item round trips.
  const perItem = await Promise.all(
    compareSet.items.map(async (item) => {
      const [session, result] = await Promise.all([
        store.getSession(item.sessionId),
        store.getResult(item.sessionId),
      ]);
      return { item, session, result };
    }),
  );

  const questionSetIds = Array.from(
    new Set(
      perItem
        .map(({ session }) => session?.questionSetId)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const questionSets = await Promise.all(
    questionSetIds.map(async (id) => [id, await store.getQuestions(id)] as const),
  );
  const questionsBySetId = new Map(questionSets);

  const answersPerItem = await Promise.all(
    perItem.map(({ item }) => store.getAnswers(item.sessionId)),
  );

  const sessions = perItem.flatMap(({ item, session, result }, index) => {
    if (!session || !result) {
      return [];
    }

    const normalized = normalizePersistedResult(result);
    if (!normalized) {
      return [];
    }

    const questions = questionsBySetId.get(session.questionSetId) ?? [];
    const questionsByCode = new Map(questions.map((question) => [question.code, question]));
    const answers = answersPerItem[index];

    const replayAnswers = answers
      .map((answer) => {
        const question = questionsByCode.get(answer.questionCode);
        return {
          questionCode: answer.questionCode,
          questionText: question?.text ?? answer.questionCode,
          selectedValue: answer.rawValue,
          displayOrder: question?.displayOrder ?? Number.MAX_SAFE_INTEGER,
          reasoning: answer.reasoning,
        };
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const evidence = buildEvidence({
      questions,
      answers,
      dimensionBreakdown: normalized.dimensionBreakdown,
    });

    return [
      {
        sessionId: item.sessionId,
        label: item.label,
        intakeMode: session.intakeMode,
        createdAt: session.createdAt,
        result: {
          ...normalized,
          replayAnswers,
          evidence,
        },
      },
    ];
  });

  return {
    compareSet,
    sessions,
  };
}

export async function claimSessionForUser(sessionId: string, userId: string) {
  const store = getSessionStore();
  await store.attachSessionToUser(sessionId, userId);
}

export async function listSessionsForUser(userId: string) {
  const store = getSessionStore();
  return store.listSessionsByUser(userId);
}

export async function requireSession(sessionId: string) {
  const store = getSessionStore();
  const session = await store.getSession(sessionId);

  if (!session) {
    throw new Error('Session not found');
  }

  return session;
}
