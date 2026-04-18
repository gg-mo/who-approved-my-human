import { assertSessionMutationAllowed, SessionAccessError } from '@/lib/server/authorization';
import { requireSession, scoreSessionById } from '@/lib/server/session-service';
import { jsonResponse } from '@/lib/server/http';

type ParamsContext = {
  params: { sessionId: string } | Promise<{ sessionId: string }>;
};

export async function POST(_request: Request, context: ParamsContext) {
  try {
    const { sessionId } = await Promise.resolve(context.params);
    const session = await requireSession(sessionId);
    await assertSessionMutationAllowed(session);

    const result = await scoreSessionById(session);

    return jsonResponse({
      sessionId,
      result,
      status: 'scored',
    });
  } catch (error) {
    if (error instanceof SessionAccessError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    const message = error instanceof Error ? error.message : 'Failed to score session';
    const status = message === 'Session not found' ? 404 : 500;

    return jsonResponse({ error: message }, status);
  }
}
