import { directAnswersBodySchema } from '@/lib/ingestion/ingestion-schemas';
import { assertSessionMutationAllowed, SessionAccessError } from '@/lib/server/authorization';
import { ingestDirectAnswers, requireSession } from '@/lib/server/session-service';
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
    const parsed = directAnswersBodySchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse({ error: 'Invalid request body', details: parsed.error.flatten() }, 400);
    }

    const ingestion = await ingestDirectAnswers(session, parsed.data.answers);

    return jsonResponse({
      sessionId,
      accepted: ingestion.accepted,
      status: 'ingested',
    });
  } catch (error) {
    if (error instanceof SessionAccessError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    const message = error instanceof Error ? error.message : 'Failed to ingest answers';
    const status = message === 'Session not found' ? 404 : 500;

    return jsonResponse({ error: message }, status);
  }
}
