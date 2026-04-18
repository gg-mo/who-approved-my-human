-- AE-3: Core schema for Agent Tea Phase 1

create extension if not exists pgcrypto;

create type public.intake_mode as enum ('coding_agent', 'chatbot', 'manual');
create type public.parse_status as enum ('success', 'partial', 'error');
create type public.session_status as enum ('pending', 'ingested', 'scored');
create type public.share_mode as enum ('normal', 'intrusive');
create type public.question_side as enum ('positive', 'negative');
create type public.question_kind as enum ('core', 'spicy');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.question_sets (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  name text not null default 'default',
  spec_hash text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  question_set_id uuid not null references public.question_sets(id) on delete cascade,
  code text not null,
  source_id text not null,
  text text not null,
  dimension text not null check (dimension in ('clarity', 'tone', 'thinking_style', 'autonomy')),
  keyed_side public.question_side not null,
  letter char(1) not null,
  reverse_coded boolean not null default false,
  question_kind public.question_kind not null,
  display_order integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique(question_set_id, code)
);

create table if not exists public.test_sessions (
  id uuid primary key default gen_random_uuid(),
  question_set_id uuid references public.question_sets(id),
  question_set_version text,
  intake_mode public.intake_mode not null default 'manual',
  status public.session_status not null default 'pending',
  random_seed text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.session_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.test_sessions(id) on delete cascade,
  question_code text not null,
  raw_value smallint not null check (raw_value between 1 and 5),
  normalized_value smallint not null check (normalized_value between 1 and 5),
  reasoning text,
  source text not null default 'manual',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(session_id, question_code)
);

create table if not exists public.session_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.test_sessions(id) on delete cascade,
  type_code char(4) not null,
  dimension_breakdown jsonb not null,
  strongest_signals jsonb not null default '[]'::jsonb,
  tie_flags jsonb not null default '{}'::jsonb,
  score_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.share_cards (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.test_sessions(id) on delete cascade,
  mode public.share_mode not null default 'normal',
  share_slug text unique,
  image_url text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.event_log (
  id bigserial primary key,
  session_id uuid references public.test_sessions(id) on delete set null,
  event_name text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.instruction_runs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.test_sessions(id) on delete cascade,
  intake_mode public.intake_mode not null,
  raw_payload text,
  normalized_payload text,
  parse_status public.parse_status not null,
  warnings jsonb not null default '[]'::jsonb,
  errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.dimension_metadata (
  id text primary key,
  positive_letter char(1) not null,
  negative_letter char(1) not null,
  positive_label text not null,
  negative_label text not null,
  description text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_questions_question_set on public.questions(question_set_id);
create index if not exists idx_questions_dimension on public.questions(dimension);
create index if not exists idx_test_sessions_created_at on public.test_sessions(created_at desc);
create index if not exists idx_test_sessions_question_set on public.test_sessions(question_set_id);
create index if not exists idx_test_sessions_intake_status on public.test_sessions(intake_mode, status);
create index if not exists idx_session_answers_session on public.session_answers(session_id);
create index if not exists idx_session_results_type_code on public.session_results(type_code);
create index if not exists idx_share_cards_session on public.share_cards(session_id);
create index if not exists idx_event_log_event_name_created_at on public.event_log(event_name, created_at desc);
create index if not exists idx_instruction_runs_session_status on public.instruction_runs(session_id, parse_status);

create trigger set_updated_at_question_sets
before update on public.question_sets
for each row
execute procedure public.set_updated_at();

create trigger set_updated_at_test_sessions
before update on public.test_sessions
for each row
execute procedure public.set_updated_at();

create trigger set_updated_at_session_answers
before update on public.session_answers
for each row
execute procedure public.set_updated_at();

create trigger set_updated_at_session_results
before update on public.session_results
for each row
execute procedure public.set_updated_at();

alter table public.question_sets enable row level security;
alter table public.questions enable row level security;
alter table public.test_sessions enable row level security;
alter table public.session_answers enable row level security;
alter table public.session_results enable row level security;
alter table public.share_cards enable row level security;
alter table public.event_log enable row level security;
alter table public.instruction_runs enable row level security;
alter table public.dimension_metadata enable row level security;

-- Public read-only metadata
create policy "question_sets_select_public"
  on public.question_sets
  for select
  to anon, authenticated
  using (true);

create policy "questions_select_public"
  on public.questions
  for select
  to anon, authenticated
  using (true);

create policy "dimension_metadata_select_public"
  on public.dimension_metadata
  for select
  to anon, authenticated
  using (true);

-- Anonymous-first session writes and reads
create policy "test_sessions_select_public"
  on public.test_sessions
  for select
  to anon, authenticated
  using (true);

create policy "test_sessions_insert_public"
  on public.test_sessions
  for insert
  to anon, authenticated
  with check (true);

create policy "test_sessions_update_public"
  on public.test_sessions
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "session_answers_select_public"
  on public.session_answers
  for select
  to anon, authenticated
  using (true);

create policy "session_answers_insert_public"
  on public.session_answers
  for insert
  to anon, authenticated
  with check (true);

create policy "session_answers_update_public"
  on public.session_answers
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "session_results_select_public"
  on public.session_results
  for select
  to anon, authenticated
  using (true);

create policy "session_results_insert_public"
  on public.session_results
  for insert
  to anon, authenticated
  with check (true);

create policy "session_results_update_public"
  on public.session_results
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "share_cards_select_public"
  on public.share_cards
  for select
  to anon, authenticated
  using (true);

create policy "share_cards_insert_public"
  on public.share_cards
  for insert
  to anon, authenticated
  with check (true);

create policy "instruction_runs_select_public"
  on public.instruction_runs
  for select
  to anon, authenticated
  using (true);

create policy "instruction_runs_insert_public"
  on public.instruction_runs
  for insert
  to anon, authenticated
  with check (true);

create policy "event_log_insert_public"
  on public.event_log
  for insert
  to anon, authenticated
  with check (true);

create policy "event_log_select_public"
  on public.event_log
  for select
  to anon, authenticated
  using (true);

insert into public.dimension_metadata (id, positive_letter, negative_letter, positive_label, negative_label, description)
values
  ('clarity', 'C', 'Y', 'Clear', 'Cryptic', 'Measures how understandable the human is in requests.'),
  ('tone', 'K', 'B', 'Kind', 'Combative', 'Measures interpersonal style and tone toward the agent.'),
  ('thinking_style', 'V', 'T', 'Visionary', 'Tactical', 'Measures whether requests start from vision or execution.'),
  ('autonomy', 'G', 'O', 'Delegating', 'Controlling', 'Measures how much autonomy the human gives the agent.')
on conflict (id) do update set
  positive_letter = excluded.positive_letter,
  negative_letter = excluded.negative_letter,
  positive_label = excluded.positive_label,
  negative_label = excluded.negative_label,
  description = excluded.description;
