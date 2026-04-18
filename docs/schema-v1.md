# Agent Tea Schema v1 (AE-3)

This schema supports anonymous-first test sessions, answer ingestion (coding-agent and chatbot flows), deterministic scoring output, and share-card/event data.

## Core Tables

- `question_sets`: versioned question bank metadata.
- `questions`: version-scoped question definitions with scoring metadata.
- `test_sessions`: one user run with `intake_mode`, `random_seed`, and `question_set_version` pinning.
- `session_answers`: normalized answers (+ optional coding-agent reasoning snippets).
- `session_results`: computed type code, dimension breakdown, strongest signals, tie flags.
- `instruction_runs`: raw/normalized payload audit trail for parser behavior and correction hints.
- `share_cards`: generated share-card metadata.
- `event_log`: analytics and operational event stream.
- `dimension_metadata`: seeded dimension pair definitions (`C/Y`, `K/B`, `V/T`, `G/O`).

## Relationship Overview

- `question_sets 1 -> N questions`
- `question_sets 1 -> N test_sessions`
- `test_sessions 1 -> N session_answers`
- `test_sessions 1 -> 1 session_results`
- `test_sessions 1 -> N instruction_runs`
- `test_sessions 1 -> N share_cards`
- `test_sessions 1 -> N event_log`

## Anonymous-First RLS

RLS is enabled on all application tables.

Current policy posture for phase 1 favors low-friction anonymous usage:

- public read access for question metadata
- public insert/select/update for session lifecycle tables

This is intentionally permissive for v1 speed and should be tightened in a later hardening phase (for example: signed session tokens, scoped row filters, anti-abuse limits).

## Apply and Verify

From a Supabase-enabled project:

```bash
supabase db push
```

Quick verify checks:

```sql
select count(*) from public.dimension_metadata;
select count(*) from public.question_sets;
select count(*) from public.questions;
```
