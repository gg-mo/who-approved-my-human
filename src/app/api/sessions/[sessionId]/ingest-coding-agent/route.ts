import { codingAgentIngestBodySchema } from '@/lib/ingestion/ingestion-schemas';
import { assertSessionMutationAllowed, SessionAccessError } from '@/lib/server/authorization';
import {
  ingestCodingAgentAnswers,
  requireSession,
  scoreSessionById,
  trackEvent,
} from '@/lib/server/session-service';
import { jsonResponse, safeParseJson } from '@/lib/server/http';

type ParamsContext = {
  params: { sessionId: string } | Promise<{ sessionId: string }>;
};

export async function POST(request: Request, context: ParamsContext) {
  try {
    const { sessionId } = await Promise.resolve(context.params);
    const session = await requireSession(sessionId);
    await assertSessionMutationAllowed(session);
    const body = await safeParseJson<unknown>(request);
    const parsed = codingAgentIngestBodySchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Invalid request body', details: parsed.error.flatten() }, 400);
    }

    const ingestion = await ingestCodingAgentAnswers(
      session,
      parsed.data.answers,
      JSON.stringify(parsed.data),
    );

    await trackEvent({
      sessionId,
      eventName: 'answers_ingested',
      eventSource: 'server',
      eventPayload: {
        source: 'coding_agent',
        accepted: ingestion.accepted,
        agentName: parsed.data.agentName ?? null,
      },
    });

    const result = await scoreSessionById(session);

    return jsonResponse({
      sessionId,
      accepted: ingestion.accepted,
      status: 'scored',
      source: 'coding_agent',
      result,
      resultUrl: `/results/${sessionId}`,
    });
  } catch (error) {
    if (error instanceof SessionAccessError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    const message =
      error instanceof Error
        ? error.message
        : error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to ingest coding-agent answers';
    const status = message === 'Session not found' ? 404 : 500;

    console.error('ingest-coding-agent failed', error);

    return jsonResponse({ error: message }, status);
  }
}
