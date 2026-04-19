export type ParseHint = {
  token: string;
  errorCode: string;
  message: string;
  suggestedFix: string;
};

export type EncodedParseResult =
  | {
      ok: true;
      normalizedPayload: string;
      answers: Array<{ questionCode: string; value: number }>;
      warnings: string[];
      hints: ParseHint[];
    }
  | {
      ok: false;
      normalizedPayload: string;
      warnings: string[];
      hints: ParseHint[];
    };

import { LIKERT_SCALE } from '@/lib/scoring/constants';

const VALUE_RANGE = Array.from(
  { length: LIKERT_SCALE.MAX - LIKERT_SCALE.MIN + 1 },
  (_, i) => LIKERT_SCALE.MIN + i,
);

function extractPayloadLine(raw: string): string {
  // Chatbots often wrap the payload with prose like "Paste this back into Agent Tea".
  // Isolate just the AT1| line so surrounding text doesn't pollute the token stream.
  const match = raw.match(/AT1\s*\|[^\n\r]*/i);
  if (match) {
    return match[0];
  }
  // Fallback: if there's no prefix, take the longest line that contains Q-digit tokens.
  const lines = raw.split(/[\n\r]+/).map((line) => line.trim()).filter(Boolean);
  const tokenLine = lines
    .filter((line) => /Q\s*\d{1,2}\s*[-:=_]\s*\d/i.test(line))
    .sort((a, b) => b.length - a.length)[0];
  return tokenLine ?? raw;
}

function normalizePayload(raw: string): string {
  return extractPayloadLine(raw)
    .trim()
    .replace(/\s+/g, '')
    .replace(/:+|=+|_+/g, '-')
    .replace(/a/gi, 'A');
}

function toToken(rawToken: string): string {
  return rawToken.replace(/^q/i, 'Q').replace(/--+/g, '-');
}

export function parseEncodedAnswers(params: {
  payload: string;
  requiredQuestionCodes: string[];
}): EncodedParseResult {
  const warnings: string[] = [];
  const hints: ParseHint[] = [];

  const normalized = normalizePayload(params.payload);
  let working = normalized;

  if (working.startsWith('AT1|')) {
    working = working.slice(4);
  } else {
    warnings.push('Missing AT1| prefix. Attempted recovery.');
    hints.push({
      token: 'PREFIX',
      errorCode: 'PREFIX_MISSING',
      message: 'Expected payload to begin with AT1|.',
      suggestedFix: 'Prepend AT1| to the encoded string.',
    });
  }

  const sections = working.split('|');
  const coreSection = sections.find((section) => section && !section.startsWith('S:') && !section.startsWith('C:'));

  if (!coreSection) {
    return {
      ok: false,
      normalizedPayload: normalized,
      warnings,
      hints: [
        ...hints,
        {
          token: 'PAYLOAD',
          errorCode: 'NO_CORE_SECTION',
          message: 'No core answer section was found.',
          suggestedFix: 'Include tokens like Q01-5AQ02-3 in the payload body.',
        },
      ],
    };
  }

  const rawTokens = coreSection.split('A').filter(Boolean);
  const answers = new Map<string, number>();

  for (const rawToken of rawTokens) {
    const token = toToken(rawToken);
    const match = token.match(/^Q(\d{1,2})-(\d)$/);

    if (!match) {
      hints.push({
        token,
        errorCode: 'TOKEN_FORMAT_INVALID',
        message: `Token ${token} is not in QNN-V format.`,
        suggestedFix: 'Use format like Q07-4.',
      });
      continue;
    }

    const questionCode = `Q${match[1].padStart(2, '0')}`;
    const value = Number(match[2]);

    if (!VALUE_RANGE.includes(value)) {
      hints.push({
        token,
        errorCode: 'VALUE_OUT_OF_RANGE',
        message: `${questionCode} expects a value between 1 and 5.`,
        suggestedFix: `Replace ${token} with ${questionCode}-<1..5>.`,
      });
      continue;
    }

    if (answers.has(questionCode)) {
      hints.push({
        token,
        errorCode: 'DUPLICATE_QUESTION',
        message: `${questionCode} appears more than once.`,
        suggestedFix: `Keep only one entry for ${questionCode}.`,
      });
      continue;
    }

    answers.set(questionCode, value);
  }

  for (const requiredCode of params.requiredQuestionCodes) {
    if (!answers.has(requiredCode)) {
      hints.push({
        token: requiredCode,
        errorCode: 'MISSING_ANSWER',
        message: `${requiredCode} is required for scoring.`,
        suggestedFix: `Add ${requiredCode}-<1..5> to the payload.`,
      });
    }
  }

  if (hints.some((hint) => hint.errorCode !== 'PREFIX_MISSING')) {
    return {
      ok: false,
      normalizedPayload: normalized,
      warnings,
      hints,
    };
  }

  return {
    ok: true,
    normalizedPayload: normalized,
    warnings,
    hints,
    answers: [...answers.entries()].map(([questionCode, value]) => ({ questionCode, value })),
  };
}
