import { createSupabaseServerClient } from '@/lib/supabase/server';
import type {
  CompareSetRow,
  EventLogInput,
  FunnelStatsRow,
  PersistedAnswer,
  PersistedResult,
  QuestionRow,
  QuestionSetRow,
  SessionIntakeMode,
  SessionRow,
  SessionStatus,
  SessionStore,
  TypeDistributionRow,
} from '@/lib/server/session-store/types';

function mapSession(row: Record<string, unknown>): SessionRow {
  return {
    id: String(row.id),
    questionSetId: String(row.question_set_id),
    questionSetVersion: String(row.question_set_version),
    intakeMode: row.intake_mode as SessionIntakeMode,
    status: row.status as SessionStatus,
    randomSeed: String(row.random_seed),
    userId: typeof row.user_id === 'string' ? row.user_id : undefined,
    referralCode: typeof row.referral_code === 'string' ? row.referral_code : undefined,
    referrerSessionId: typeof row.referrer_session_id === 'string' ? row.referrer_session_id : undefined,
    completedAt: typeof row.completed_at === 'string' ? row.completed_at : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export const supabaseSessionStore: SessionStore = {
  async getActiveQuestionSet(version) {
    const client = createSupabaseServerClient({ useServiceRole: true });

    const query = client.from('question_sets').select('id, version').eq('is_active', true);

    const filtered = version ? query.eq('version', version) : query;
    const { data, error } = await filtered.order('created_at', { ascending: false }).limit(1).maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      version: data.version,
    } as QuestionSetRow;
  },

  async getQuestions(questionSetId) {
    const client = createSupabaseServerClient({ useServiceRole: true });
    const { data, error } = await client
      .from('questions')
      .select(
        'code, source_id, text, dimension, keyed_side, letter, reverse_coded, question_kind, display_order',
      )
      .eq('question_set_id', questionSetId)
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      code: row.code,
      sourceId: row.source_id,
      text: row.text,
      dimension: row.dimension,
      keyedSide: row.keyed_side,
      letter: row.letter,
      reverseCoded: row.reverse_coded,
      questionKind: row.question_kind,
      displayOrder: row.display_order,
    })) as QuestionRow[];
  },

  async createSession(input) {
    const client = createSupabaseServerClient({ useServiceRole: true });
    const payloadWithReferral = {
      question_set_id: input.questionSetId,
      question_set_version: input.questionSetVersion,
      intake_mode: input.intakeMode,
      random_seed: input.randomSeed,
      referral_code: input.referralCode ?? null,
      referrer_session_id: input.referrerSessionId ?? null,
      status: 'pending',
    };

    const insertWithPayload = async (payload: Record<string, unknown>) =>
      client.from('test_sessions').insert(payload).select('*').single();

    let { data, error } = await insertWithPayload(payloadWithReferral);

    // Backward-compatible fallback when older deployments are missing referral columns.
    if (error && /referral_code|referrer_session_id/i.test(error.message ?? '')) {
      const legacyPayload = {
        question_set_id: input.questionSetId,
        question_set_version: input.questionSetVersion,
        intake_mode: input.intakeMode,
        random_seed: input.randomSeed,
        status: 'pending',
      };
      const legacyInsert = await insertWithPayload(legacyPayload);
      data = legacyInsert.data;
      error = legacyInsert.error;
    }

    if (error) {
      throw error;
    }

    return mapSession(data as Record<string, unknown>);
  },

  async getSession(sessionId) {
    const client = createSupabaseServerClient({ useServiceRole: true });
    const { data, error } = await client.from('test_sessions').select('*').eq('id', sessionId).maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return mapSession(data as Record<string, unknown>);
  },

  async listSessionsByUser(userId) {
    const client = createSupabaseServerClient({ useServiceRole: true });
    const { data, error } = await client
      .from('test_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapSession(row as Record<string, unknown>));
  },

  async attachSessionToUser(sessionId, userId) {
    const client = createSupabaseServerClient({ useServiceRole: true });
    const { error } = await client
      .from('test_sessions')
      .update({ user_id: userId })
      .eq('id', sessionId);

    if (error) {
      throw error;
    }
  },

  async upsertAnswers(sessionId, answers) {
    if (answers.length === 0) {
      return;
    }

    const client = createSupabaseServerClient({ useServiceRole: true });
    const payload = answers.map((answer) => ({
      session_id: sessionId,
      question_code: answer.questionCode,
      raw_value: answer.rawValue,
      normalized_value: answer.normalizedValue,
      reasoning: answer.reasoning ?? null,
      source: answer.source,
    }));

    const { error } = await client.from('session_answers').upsert(payload, {
      onConflict: 'session_id,question_code',
      ignoreDuplicates: false,
    });

    if (error) {
      throw error;
    }
  },

  async getAnswers(sessionId) {
    const client = createSupabaseServerClient({ useServiceRole: true });
    const { data, error } = await client
      .from('session_answers')
      .select('question_code, raw_value, normalized_value, reasoning, source')
      .eq('session_id', sessionId);

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      questionCode: row.question_code,
      rawValue: row.raw_value,
      normalizedValue: row.normalized_value,
      reasoning: row.reasoning ?? undefined,
      source: row.source,
    })) as PersistedAnswer[];
  },

  async setSessionStatus(sessionId, status) {
    const client = createSupabaseServerClient({ useServiceRole: true });
    const { error } = await client
      .from('test_sessions')
      .update({
        status,
        completed_at: status === 'scored' ? new Date().toISOString() : null,
      })
      .eq('id', sessionId);

    if (error) {
      throw error;
    }
  },

  async recordInstructionRun(input) {
    const client = createSupabaseServerClient({ useServiceRole: true });
    const { error } = await client.from('instruction_runs').insert({
      session_id: input.sessionId,
      intake_mode: input.intakeMode,
      raw_payload: input.rawPayload,
      normalized_payload: input.normalizedPayload ?? null,
      parse_status: input.parseStatus,
      warnings: input.warnings,
      errors: input.errors,
    });

    if (error) {
      throw error;
    }
  },

  async recordEvent(input: EventLogInput) {
    const client = createSupabaseServerClient({ useServiceRole: true });
    const { error } = await client.from('event_log').insert({
      session_id: input.sessionId ?? null,
      user_id: input.userId ?? null,
      event_name: input.eventName,
      event_source: input.eventSource ?? 'server',
      event_payload: input.eventPayload ?? {},
    });

    if (error) {
      throw error;
    }
  },

  async upsertResult(sessionId, result) {
    const client = createSupabaseServerClient({ useServiceRole: true });
    const { error } = await client.from('session_results').upsert(
      {
        session_id: sessionId,
        type_code: result.typeCode,
        dimension_breakdown: result.dimensionBreakdown,
        strongest_signals: result.strongestSignals,
        tie_flags: result.tieFlags,
        score_summary: result.scoreSummary ?? {},
      },
      { onConflict: 'session_id', ignoreDuplicates: false },
    );

    if (error) {
      throw error;
    }
  },

  async getResult(sessionId) {
    const client = createSupabaseServerClient({ useServiceRole: true });
    const { data, error } = await client
      .from('session_results')
      .select('type_code, dimension_breakdown, strongest_signals, tie_flags, score_summary')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      typeCode: data.type_code,
      dimensionBreakdown: data.dimension_breakdown,
      strongestSignals: data.strongest_signals,
      tieFlags: data.tie_flags,
      scoreSummary: data.score_summary,
    } as PersistedResult;
  },

  async getTypeDistribution(days: number): Promise<TypeDistributionRow[]> {
    const client = createSupabaseServerClient({ useServiceRole: true });
    const cutoffIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await client
      .from('session_results')
      .select('type_code, test_sessions!inner(created_at)')
      .gte('test_sessions.created_at', cutoffIso);

    if (error) {
      throw error;
    }

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const typeCode = row.type_code as string;
      counts.set(typeCode, (counts.get(typeCode) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([typeCode, count]) => ({ typeCode, count }))
      .sort((a, b) => b.count - a.count);
  },

  async getFunnelStats(days: number): Promise<FunnelStatsRow[]> {
    const client = createSupabaseServerClient({ useServiceRole: true });
    // When days differs from 7 we still reuse the same ordering logic by querying raw events.
    if (days !== 7) {
      const cutoffIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await client
        .from('event_log')
        .select('event_name')
        .gte('created_at', cutoffIso)
        .in('event_name', ['landing_view', 'session_created', 'session_scored', 'share_click']);

      if (error) {
        throw error;
      }

      const stages: Record<string, number> = {
        landing_view: 0,
        session_created: 0,
        session_scored: 0,
        share_click: 0,
      };

      for (const row of data ?? []) {
        const name = row.event_name as keyof typeof stages;
        if (name in stages) {
          stages[name] += 1;
        }
      }

      const landing = stages.landing_view;
      const created = stages.session_created;
      const scored = stages.session_scored;
      const shared = stages.share_click;

      return [
        { stage: 'landing_view', count: landing, conversionFromPrevious: null, conversionFromStart: landing === 0 ? null : 1 },
        {
          stage: 'session_created',
          count: created,
          conversionFromPrevious: landing === 0 ? null : created / landing,
          conversionFromStart: landing === 0 ? null : created / landing,
        },
        {
          stage: 'session_scored',
          count: scored,
          conversionFromPrevious: created === 0 ? null : scored / created,
          conversionFromStart: landing === 0 ? null : scored / landing,
        },
        {
          stage: 'share_click',
          count: shared,
          conversionFromPrevious: scored === 0 ? null : shared / scored,
          conversionFromStart: landing === 0 ? null : shared / landing,
        },
      ];
    }

    const { data, error } = await client
      .from('v_funnel_7d')
      .select('stage, sample_count, conversion_rate_from_previous, conversion_rate_from_start')
      .order('stage_order', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      stage: row.stage as string,
      count: Number(row.sample_count ?? 0),
      conversionFromPrevious:
        typeof row.conversion_rate_from_previous === 'number'
          ? row.conversion_rate_from_previous
          : null,
      conversionFromStart:
        typeof row.conversion_rate_from_start === 'number'
          ? row.conversion_rate_from_start
          : null,
    }));
  },

  async createCompareSet(input): Promise<CompareSetRow> {
    const client = createSupabaseServerClient({ useServiceRole: true });
    const { data: compareSet, error: compareSetError } = await client
      .from('compare_sets')
      .insert({
        owner_user_id: input.ownerUserId ?? null,
      })
      .select('id, owner_user_id, created_at, updated_at')
      .single();

    if (compareSetError) {
      throw compareSetError;
    }

    const itemsPayload = input.sessionIds.map((sessionId, index) => ({
      compare_set_id: compareSet.id,
      session_id: sessionId,
      label: input.labels?.[index] ?? null,
    }));

    const { data: items, error: itemsError } = await client
      .from('compare_set_items')
      .insert(itemsPayload)
      .select('session_id, label');

    if (itemsError) {
      throw itemsError;
    }

    return {
      id: compareSet.id,
      ownerUserId: compareSet.owner_user_id ?? undefined,
      createdAt: compareSet.created_at,
      updatedAt: compareSet.updated_at,
      items: (items ?? []).map((item) => ({
        sessionId: item.session_id,
        label: item.label ?? undefined,
      })),
    };
  },

  async getCompareSet(compareSetId): Promise<CompareSetRow | null> {
    const client = createSupabaseServerClient({ useServiceRole: true });
    const { data: compareSet, error: compareSetError } = await client
      .from('compare_sets')
      .select('id, owner_user_id, created_at, updated_at')
      .eq('id', compareSetId)
      .maybeSingle();

    if (compareSetError) {
      throw compareSetError;
    }

    if (!compareSet) {
      return null;
    }

    const { data: items, error: itemsError } = await client
      .from('compare_set_items')
      .select('session_id, label')
      .eq('compare_set_id', compareSetId)
      .order('created_at', { ascending: true });

    if (itemsError) {
      throw itemsError;
    }

    return {
      id: compareSet.id,
      ownerUserId: compareSet.owner_user_id ?? undefined,
      createdAt: compareSet.created_at,
      updatedAt: compareSet.updated_at,
      items: (items ?? []).map((item) => ({
        sessionId: item.session_id,
        label: item.label ?? undefined,
      })),
    };
  },
};
