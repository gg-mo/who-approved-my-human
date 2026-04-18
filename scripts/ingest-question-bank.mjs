import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { loadScriptEnv } from './load-script-env.mjs';

const defaultSpecPath = 'docs/launch-pack/09-question-bank-spec.json';
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

function sha256(input) {
  return createHash('sha256').update(input).digest('hex');
}

function toQuestionRows(spec, questionSetId) {
  const dimensionMap = new Map(spec.type_system.dimensions.map((item) => [item.id, item]));

  const coreRows = spec.core_questions.map((question, index) => {
    const dimension = dimensionMap.get(question.dimension);
    const letter = question.letter ?? dimension.letters[question.keyed_side];

    return {
      question_set_id: questionSetId,
      code: `Q${String(index + 1).padStart(2, '0')}`,
      source_id: question.id,
      text: question.text,
      dimension: question.dimension,
      keyed_side: question.keyed_side,
      letter,
      reverse_coded: Boolean(question.reverse_coded),
      question_kind: 'core',
      display_order: index + 1,
    };
  });

  const spicyRows = spec.spicy_questions.map((question, index) => {
    const dimension = dimensionMap.get(question.dimension);
    const codeOffset = coreRows.length + index + 1;
    const keyedSide = question.lean;
    const letter = dimension.letters[keyedSide];

    return {
      question_set_id: questionSetId,
      code: `Q${String(codeOffset).padStart(2, '0')}`,
      source_id: question.id,
      text: question.text,
      dimension: question.dimension,
      keyed_side: keyedSide,
      letter,
      reverse_coded: false,
      question_kind: 'spicy',
      display_order: codeOffset,
    };
  });

  return [...coreRows, ...spicyRows];
}

async function run() {
  const specPath = resolve(process.cwd(), process.argv[2] ?? defaultSpecPath);
  const rawSpec = await readFile(specPath, 'utf8');
  const spec = JSON.parse(rawSpec);

  const supabase = getSupabaseAdminClient();
  const specHash = sha256(rawSpec);
  const version = spec.spec_version;

  const { data: questionSet, error: questionSetError } = await supabase
    .from('question_sets')
    .upsert(
      {
        version,
        name: 'Agent Tea Launch Bank',
        spec_hash: specHash,
        is_active: true,
      },
      { onConflict: 'version' },
    )
    .select('id, version')
    .single();

  if (questionSetError) {
    throw questionSetError;
  }

  const { error: deactivateError } = await supabase
    .from('question_sets')
    .update({ is_active: false })
    .neq('id', questionSet.id);

  if (deactivateError) {
    throw deactivateError;
  }

  const rows = toQuestionRows(spec, questionSet.id);

  const { error: questionError } = await supabase
    .from('questions')
    .upsert(rows, { onConflict: 'question_set_id,code' });

  if (questionError) {
    throw questionError;
  }

  const knownCodes = rows.map((row) => row.code);
  const { error: cleanupError } = await supabase
    .from('questions')
    .delete()
    .eq('question_set_id', questionSet.id)
    .not('code', 'in', `(${knownCodes.map((code) => `"${code}"`).join(',')})`);

  if (cleanupError) {
    throw cleanupError;
  }

  console.log('Question bank ingested successfully.');
  console.log(`- version: ${version}`);
  console.log(`- question_set_id: ${questionSet.id}`);
  console.log(`- total_questions: ${rows.length}`);
  console.log(`- core_questions: ${rows.filter((row) => row.question_kind === 'core').length}`);
  console.log(`- spicy_questions: ${rows.filter((row) => row.question_kind === 'spicy').length}`);
}

run().catch((error) => {
  console.error('Failed to ingest question bank.');
  console.error(error);
  process.exit(1);
});
