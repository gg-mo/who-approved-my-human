import { createSupabaseAuthServerClient } from '@/lib/supabase/auth-server';
import type { SessionRow } from '@/lib/server/session-store/types';

export class SessionAccessError extends Error {
  constructor(
    public readonly status: 401 | 403 | 409,
    message: string,
  ) {
    super(message);
    this.name = 'SessionAccessError';
  }
}

/**
 * Resolves the authenticated user if present. Returns `null` for anonymous
 * requests — we intentionally allow anonymous mutations on unclaimed sessions
 * because the test flow is anonymous-first.
 */
export async function getOptionalAuthenticatedUser() {
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

/**
 * Verifies that the current requester may mutate the given session.
 *
 * Rules:
 * - If the session has no owner, any requester may proceed (anonymous-first).
 * - If the session has an owner, the requester must be signed in as that
 *   owner. Anonymous requests are treated as unauthorized to prevent a
 *   trivial takeover of claimed sessions by session-ID guess.
 */
export async function assertSessionMutationAllowed(session: SessionRow) {
  if (!session.userId) {
    return { user: null };
  }

  const user = await getOptionalAuthenticatedUser();

  if (!user) {
    throw new SessionAccessError(401, 'Sign in to modify this reveal.');
  }

  if (user.id !== session.userId) {
    throw new SessionAccessError(403, 'This reveal belongs to another profile.');
  }

  return { user };
}
