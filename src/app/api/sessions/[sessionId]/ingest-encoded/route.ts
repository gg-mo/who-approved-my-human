import { encodedIngestBodySchema } from '@/lib/ingestion/ingestion-schemas';
import { assertSessionMutationAllowed, SessionAccessError } from '@/lib/server/authorization';
import { ingestEncodedPayload, requireSession, trackEvent } from '@/lib/server/session-service';
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
    const parsed = encodedIngestBodySchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Invalid request body', details: parsed.error.flatten() }, 400);
    }

    const ingestion = await ingestEncodedPayload(session, parsed.data.payload);

    if (!ingestion.ok) {
      await trackEvent({
        sessionId,
        eventName: 'answers_ingest_failed',
        eventSource: 'server',
        eventPayload: {
          source: 'chatbot',
          hintCount: ingestion.hints.length,
        },
      });

      return jsonResponse(
        {
          ok: false,
          sessionId,
          hints: ingestion.hints,
          warnings: ingestion.warnings,
          normalizedPayload: ingestion.normalizedPayload,
        },
        400,
      );
    }

    await trackEvent({
      sessionId,
      eventName: 'answers_ingested',
      eventSource: 'server',
      eventPayload: {
        source: 'chatbot',
        accepted: ingestion.answers.length,
        warningCount: ingestion.warnings.length,
      },
    });

    return jsonResponse({
      ok: true,
      sessionId,
      accepted: ingestion.answers.length,
      warnings: ingestion.warnings,
      hints: ingestion.hints,
      normalizedPayload: ingestion.normalizedPayload,
      status: 'ingested',
      source: 'chatbot',
    });
  } catch (error) {
    if (error instanceof SessionAccessError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    const message = error instanceof Error ? error.message : 'Failed to ingest encoded payload';
    const status = message === 'Session not found' ? 404 : 500;

    return jsonResponse({ error: message }, status);
  }
}
