import { jsonResponse } from '@/lib/server/http';
import { claimSessionForUser, requireSession, trackEvent } from '@/lib/server/session-service';
import { createSupabaseAuthServerClient } from '@/lib/supabase/auth-server';

type ParamsContext = {
  params: { sessionId: string } | Promise<{ sessionId: string }>;
};

export async function POST(_request: Request, context: ParamsContext) {
  try {
    const { sessionId } = await Promise.resolve(context.params);
    const supabase = await createSupabaseAuthServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return jsonResponse({ error: 'Sign in to save this reveal.' }, 401);
    }

    const session = await requireSession(sessionId);

    // Idempotent: already owned by this user — report success without re-writing or re-logging.
    if (session.userId === user.id) {
      return jsonResponse({ ok: true, sessionId, userId: user.id, alreadyClaimed: true });
    }

    if (session.userId && session.userId !== user.id) {
      return jsonResponse({ error: 'This reveal is already saved to another profile.' }, 409);
    }

    await claimSessionForUser(sessionId, user.id);
    await trackEvent({
      sessionId,
      userId: user.id,
      eventName: 'session_claimed',
      eventSource: 'server',
    });

    return jsonResponse({ ok: true, sessionId, userId: user.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save this reveal.';
    const status = message === 'Session not found' ? 404 : 500;

    return jsonResponse({ error: message }, status);
  }
}
