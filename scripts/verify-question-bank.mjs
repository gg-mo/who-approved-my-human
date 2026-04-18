import { createClient } from '@supabase/supabase-js';
import { loadScriptEnv } from './load-script-env.mjs';

loadScriptEnv();

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function requireAnyEnv(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }

  throw new Error(`Missing required environment variable: ${names.join(' or ')}`);
}

function getSupabaseAdminClient() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRole = requireAnyEnv(['SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY']);

  return createClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function run() {
  const supabase = getSupabaseAdminClient();

  const { data: activeSet, error: setError } = await supabase
    .from('question_sets')
    .select('id, version')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (setError) {
    throw setError;
  }

  const { data: questions, error: questionError } = await supabase
    .from('questions')
    .select('dimension, question_kind')
    .eq('question_set_id', activeSet.id);

  if (questionError) {
    throw questionError;
  }

  const counts = questions.reduce((acc, question) => {
    const key = `${question.dimension}:${question.question_kind}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  console.log('Active question set verification');
  console.log(`- version: ${activeSet.version}`);
  console.log(`- question_set_id: ${activeSet.id}`);
  console.log(`- total_questions: ${questions.length}`);

  for (const [key, value] of Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`- ${key}: ${value}`);
  }
}

run().catch((error) => {
  console.error('Failed to verify question bank.');
  console.error(error);
  process.exit(1);
});
