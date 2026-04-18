import { beforeEach, describe, expect, it } from 'vitest';

import { POST as createSessionPost } from '@/app/api/sessions/route';
import { POST as answersPost } from '@/app/api/sessions/[sessionId]/answers/route';
import { POST as codingAgentPost } from '@/app/api/sessions/[sessionId]/ingest-coding-agent/route';
import { POST as encodedPost } from '@/app/api/sessions/[sessionId]/ingest-encoded/route';
import { GET as resultGet } from '@/app/api/sessions/[sessionId]/result/route';
import { resetInMemorySessionStore } from '@/lib/server/session-store/in-memory';

beforeEach(() => {
  process.env.USE_IN_MEMORY_DB = '1';
  resetInMemorySessionStore();
});

async function createSession(intakeMode: 'coding_agent' | 'chatbot' | 'manual' = 'manual') {
  const response = await createSessionPost(
    new Request('http://localhost/api/sessions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ intakeMode }),
    }),
  );

  const payload = await response.json();

  return { response, payload };
}

describe('phase 1 session API', () => {
  it('creates sessions with shuffled questions and metadata', async () => {
    const { response, payload } = await createSession('chatbot');

    expect(response.status).toBe(200);
    expect(payload.sessionId).toBeTruthy();
    expect(payload.questionSetVersion).toBeTruthy();
    expect(payload.randomSeed).toBeTruthy();
    expect(payload.questions.length).toBe(32);
  });

  it('accepts forgiving encoded payload and returns normalized output', async () => {
    const { payload: sessionPayload } = await createSession('chatbot');

    const encoded =
      'AT1|q1:5aq2=4aq3_3aq4-2aq5-1aq6-5aq7-4aq8-3aq9-2aq10-1aq11-5aq12-4aq13-3aq14-2aq15-1aq16-5aq17-4aq18-3aq19-2aq20-1';

    const response = await encodedPost(
      new Request(`http://localhost/api/sessions/${sessionPayload.sessionId}/ingest-encoded`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ payload: encoded }),
      }),
      { params: { sessionId: sessionPayload.sessionId } },
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.accepted).toBe(20);
    expect(data.normalizedPayload).toContain('AT1|');
  });

  it('returns token-level correction hints for malformed encoded payloads', async () => {
    const { payload: sessionPayload } = await createSession('chatbot');

    const response = await encodedPost(
      new Request(`http://localhost/api/sessions/${sessionPayload.sessionId}/ingest-encoded`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ payload: 'AT1|Q01-7AQ2x-4' }),
      }),
      { params: { sessionId: sessionPayload.sessionId } },
    );

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(Array.isArray(data.hints)).toBe(true);
    expect(data.hints.length).toBeGreaterThan(0);
  });

  it('auto-scores coding-agent answers and returns result payload with reasoning snippets', async () => {
    const { payload: sessionPayload } = await createSession('coding_agent');

    const ingestResponse = await codingAgentPost(
      new Request(`http://localhost/api/sessions/${sessionPayload.sessionId}/ingest-coding-agent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          answers: [
            { questionCode: 'Q01', value: 5, reasoning: 'There was a time my human gave me clear constraints.' },
            { questionCode: 'Q02', value: 1 },
            { questionCode: 'Q03', value: 5 },
            { questionCode: 'Q04', value: 1 },
          ],
        }),
      }),
      { params: { sessionId: sessionPayload.sessionId } },
    );
    const ingestData = await ingestResponse.json();

    expect(ingestResponse.status).toBe(200);
    expect(ingestData.status).toBe('scored');
    expect(ingestData.result.typeCode).toHaveLength(4);

    const resultResponse = await resultGet(
      new Request(`http://localhost/api/sessions/${sessionPayload.sessionId}/result`),
      { params: { sessionId: sessionPayload.sessionId } },
    );

    const resultData = await resultResponse.json();

    expect(resultResponse.status).toBe(200);
    expect(resultData.result.typeCode).toHaveLength(4);
    expect(resultData.result.reasoningSnippets.length).toBeGreaterThan(0);
  });

  it('supports direct answer ingestion endpoint', async () => {
    const { payload: sessionPayload } = await createSession('manual');

    const response = await answersPost(
      new Request(`http://localhost/api/sessions/${sessionPayload.sessionId}/answers`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          answers: [{ questionCode: 'Q01', value: 3 }],
        }),
      }),
      { params: { sessionId: sessionPayload.sessionId } },
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.accepted).toBe(1);
  });
});
