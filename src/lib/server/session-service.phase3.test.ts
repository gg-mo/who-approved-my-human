import { beforeEach, describe, expect, it } from 'vitest';

import {
  createCompareSet,
  createSession,
  getCompareSetResults,
  getSessionResultById,
  getTypeDistributionSummary,
  ingestDirectAnswers,
  scoreSessionById,
} from '@/lib/server/session-service';
import { getSessionStore } from '@/lib/server/session-store';
import { resetInMemorySessionStore } from '@/lib/server/session-store/in-memory';

function fakePersistedResult(typeCode: string) {
  return {
    typeCode,
    dimensionBreakdown: {},
    strongestSignals: [],
    tieFlags: {},
    scoreSummary: {},
  };
}

describe('phase 3/4 session service behavior', () => {
  beforeEach(() => {
    process.env.USE_IN_MEMORY_DB = '1';
    resetInMemorySessionStore();
  });

  it('hides social-proof type winners below minimum sample threshold', async () => {
    const store = getSessionStore();

    for (let i = 0; i < 10; i += 1) {
      const { session } = await createSession({ intakeMode: 'manual' });
      await store.upsertResult(session.id, fakePersistedResult('CKVD'));
    }

    const summary = await getTypeDistributionSummary(7);

    expect(summary.sampleCount).toBe(10);
    expect(summary.minimumSample).toBe(24);
    expect(summary.mostCommon).toBeNull();
    expect(summary.rarest).toBeNull();
  });

  it('returns most common and rarest types when sample threshold is met', async () => {
    const store = getSessionStore();

    for (let i = 0; i < 20; i += 1) {
      const { session } = await createSession({ intakeMode: 'manual' });
      await store.upsertResult(session.id, fakePersistedResult('CKVD'));
    }

    for (let i = 0; i < 4; i += 1) {
      const { session } = await createSession({ intakeMode: 'manual' });
      await store.upsertResult(session.id, fakePersistedResult('XBTH'));
    }

    const summary = await getTypeDistributionSummary(7);

    expect(summary.sampleCount).toBe(24);
    expect(summary.mostCommon?.typeCode).toBe('CKVD');
    expect(summary.mostCommon?.count).toBe(20);
    expect(summary.rarest?.typeCode).toBe('XBTH');
    expect(summary.rarest?.count).toBe(4);
  });

  it('includes evidence support and contradiction highlights in session results', async () => {
    const { session } = await createSession({ intakeMode: 'manual' });

    await ingestDirectAnswers(session, [
      { questionCode: 'Q01', value: 5, reasoning: 'My human usually gives clear context first.' },
      { questionCode: 'Q02', value: 5, reasoning: 'They also sometimes make me infer missing pieces.' },
      { questionCode: 'Q03', value: 5 },
      { questionCode: 'Q04', value: 1 },
    ]);
    await scoreSessionById(session);

    const result = await getSessionResultById(session.id);

    expect(result).not.toBeNull();
    expect(result?.evidence?.strongestSupport.length).toBeGreaterThan(0);
    expect(result?.evidence?.strongestContradictions.length).toBeGreaterThan(0);
    expect(result?.evidence?.strongestContradictions.some((row) => row.questionCode === 'Q02')).toBe(true);
  });

  it('filters compare sessions down to scored results only', async () => {
    const scored = await createSession({ intakeMode: 'manual' });
    await ingestDirectAnswers(scored.session, [
      { questionCode: 'Q01', value: 5 },
      { questionCode: 'Q02', value: 1 },
      { questionCode: 'Q03', value: 5 },
      { questionCode: 'Q04', value: 1 },
    ]);
    await scoreSessionById(scored.session);

    const unscored = await createSession({ intakeMode: 'manual' });

    const compareSet = await createCompareSet({
      sessionIds: [scored.session.id, unscored.session.id],
      labels: ['Scored run', 'Pending run'],
    });

    const compare = await getCompareSetResults(compareSet.id);

    expect(compare).not.toBeNull();
    expect(compare?.sessions.length).toBe(1);
    expect(compare?.sessions[0]?.sessionId).toBe(scored.session.id);
    expect(compare?.sessions[0]?.result.typeCode).toHaveLength(4);
  });
});
