# Agent Tea Implementation Roadmap

> **Execution model:** Build in vertical slices so each milestone ships usable value.
> **Infra constraints:** UI deploys on Vercel, data/auth/storage on Supabase.
> **Prompt format:** Every milestone includes a copy-paste prompt you can hand to a coding agent.

## Architecture Baseline

- **Frontend/Web:** Next.js (App Router, TypeScript), deployed to Vercel
- **Database:** Supabase Postgres (SQL migrations + RLS)
- **APIs:** Next.js Route Handlers (`/api/*`) for scoring, ingestion, results, sharing
- **Auth (phase-gated):** Anonymous first-run for viral flow, optional account linking later
- **Analytics:** Event table in Supabase + optional Vercel Analytics
- **Asset pipeline:** Character illustration manifests + share card render endpoint

## Milestone Map

- `AT-1` to `AT-6`: Foundation and core test flow
- `AT-7` to `AT-12`: Results depth, shareability, viral loops
- `AT-13` to `AT-17`: Compare mode, social proof, optional accounts
- `AT-18` to `AT-22`: Hardening, observability, launch operations

---

## Phase 1: Foundation and Scoring Core

### AT-1: Project Bootstrap (Next.js + Tooling + CI)

**Goal**
Create production-ready app scaffold with lint/test/build gates and Vercel-compatible setup.

**Deliverables**
- Next.js App Router TypeScript app initialized
- ESLint + Prettier + strict TS config
- Test runner setup (Vitest + RTL for unit, Playwright skeleton for e2e)
- CI workflow for `lint`, `test`, `build`

**Acceptance Criteria**
- `npm run lint && npm run test && npm run build` pass locally and in CI

**Coding Agent Prompt**
```text
Implement AT-1 for Agent Tea.

Requirements:
1) Initialize a Next.js (App Router, TypeScript) project suitable for Vercel deployment.
2) Add ESLint, Prettier, strict tsconfig, Vitest, and Playwright skeleton.
3) Add scripts: lint, test, test:e2e (placeholder allowed), build, dev.
4) Add GitHub Actions CI workflow running lint/test/build.
5) Add a concise README section "Local Development".

Output:
- List all created/modified files.
- Show exact commands to run.
- Confirm lint/test/build results.
```

### AT-2: Supabase Provisioning + Local Env Contract

**Goal**
Define local/dev/prod environment strategy and Supabase project wiring.

**Deliverables**
- `.env.example` with all required variables
- Supabase client wrappers (`server` + `browser`)
- Docs for local secrets and Vercel environment setup

**Acceptance Criteria**
- App boots with clear env validation and no silent failures

**Coding Agent Prompt**
```text
Implement AT-2 for Agent Tea.

Requirements:
1) Add `.env.example` including NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL.
2) Create typed env loader with runtime validation.
3) Add Supabase client helpers for server and browser usage.
4) Document Vercel env var setup in docs/deployment-env.md.
5) Ensure missing env vars fail fast with actionable error messages.

Output:
- File list and key code excerpts.
- Verification steps for local and Vercel env setup.
```

### AT-3: Database Schema v1 (Core Entities)

**Goal**
Create base schema for sessions, answers, results, spicy responses, and share cards.

**Deliverables**
- SQL migrations for v1 tables
- Indexes for hot read paths
- RLS policies for anonymous session-safe access patterns

**Schema (minimum)**
- `test_sessions`
- `session_answers`
- `session_results`
- `share_cards`
- `event_log`

**Acceptance Criteria**
- Migration applies cleanly; core create/read paths tested

**Coding Agent Prompt**
```text
Implement AT-3 for Agent Tea using Supabase SQL migrations.

Requirements:
1) Create tables: test_sessions, session_answers, session_results, share_cards, event_log.
2) Include timestamps, foreign keys, and indexes (session_id, created_at, type_code).
3) Add RLS policies supporting anonymous first-run sessions while preventing broad data exposure.
4) Add SQL seed for dimension metadata (C/Y, K/B, V/T, G/O).
5) Add docs/schema-v1.md with ERD-style explanation.

Output:
- Migration SQL files.
- Policy summary and security rationale.
- Commands used to apply/verify migrations.
```

### AT-4: Question Bank Ingestion and Versioning

**Goal**
Load `20 core + 12 spicy` question spec into DB with version support.

**Deliverables**
- Script to ingest JSON spec from `docs/launch-pack/09-question-bank-spec.json`
- `question_sets` and `questions` tables (if not embedded in AT-3)
- Version pinning on sessions

**Acceptance Criteria**
- New session stores question set version and deterministic prompt order seed

**Coding Agent Prompt**
```text
Implement AT-4 for Agent Tea.

Requirements:
1) Create/import question bank tables with versioning.
2) Build idempotent ingestion script reading docs/launch-pack/09-question-bank-spec.json.
3) Save reverse_coded, dimension, keyed_side, and spicy/core flags.
4) Ensure each session references a question_set_id and randomization seed.
5) Add a verification script that prints loaded counts by dimension.

Output:
- DB changes, ingestion script, and verification output.
- Instructions for adding future question set versions.
```

### AT-5: Scoring Engine (Deterministic + Tested)

**Goal**
Implement pure scoring module that outputs type code, percentages, strongest signals, and tie flags.

**Deliverables**
- `scoreSession()` library with unit tests
- Reverse-coding and percentage normalization
- Tie-break logic documented

**Acceptance Criteria**
- 95%+ coverage on scoring module
- Fixed fixture inputs produce stable outputs

**Coding Agent Prompt**
```text
Implement AT-5 for Agent Tea.

Requirements:
1) Build a pure TypeScript scoring module using 1-5 Likert values.
2) Apply reverse coding where needed.
3) Compute per-dimension percentages and dominant letter by C/K/V/G order.
4) Return type_code, dimension_breakdown, strongest_signals, tie_flags.
5) Add robust unit tests including edge cases (ties, all-neutral, extreme responses).

Output:
- Scoring API signature.
- Test cases and results.
- Example JSON output for one fixture.
```

### AT-6: Anonymous Session API + Persistence

**Goal**
Enable end-to-end save/score/fetch flow without account creation.

**Deliverables**
- `POST /api/sessions`
- `POST /api/sessions/:id/answers`
- `POST /api/sessions/:id/score`
- `GET /api/sessions/:id/result`

**Acceptance Criteria**
- User can complete test and view persistent result from a single session URL

**Coding Agent Prompt**
```text
Implement AT-6 for Agent Tea.

Requirements:
1) Add session creation endpoint returning session_id and question payload.
2) Add answer submission endpoint supporting batched writes.
3) Add score endpoint invoking scoring engine and persisting result.
4) Add result endpoint returning display-ready payload.
5) Add request validation, error handling, and integration tests for all endpoints.

Output:
- API routes and validation strategy.
- Integration test results.
- Example request/response payloads.
```

---

## Phase 2: Viral Product Experience

### AT-7: Landing Page + Brand Voice (Agent Tea)

**Goal**
Ship homepage with final name and launch line: "Your AI has tea about you."

**Deliverables**
- Hero section + CTA + quick explainer
- Agent selector (Coding Agent / Chatbot)
- Prompt copy panels with one-click copy

**Acceptance Criteria**
- First-time user can reach test flow in under 2 clicks

**Coding Agent Prompt**
```text
Implement AT-7 for Agent Tea frontend.

Requirements:
1) Build responsive landing page with headline: "Your AI has tea about you."
2) Add clear CTA to start test.
3) Add agent type selector with tailored prompt blocks (markdown and plain prompt variants).
4) Add copy-to-clipboard UI and success feedback.
5) Keep visual style playful, bold, and mobile-friendly.

Output:
- Component/file map.
- Screenshots or textual UI walkthrough.
- Accessibility notes (focus states, contrast, keyboard nav).
```

### AT-8: Test Runner UI (Shuffled + Smooth UX)

**Goal**
Create fast test-taking UI with anti-adjacent-opposites logic.

**Deliverables**
- Question renderer with 5-point Likert controls
- Progress indicator and save-on-change behavior
- Shuffle logic respecting "no direct opposite back-to-back"

**Acceptance Criteria**
- Test completion under 2-3 minutes with no data loss on refresh

**Coding Agent Prompt**
```text
Implement AT-8 for Agent Tea.

Requirements:
1) Build test runner UI for 20 core + optional spicy interleaving.
2) Implement deterministic shuffle using session seed.
3) Enforce rule: opposite-paired prompts cannot appear consecutively.
4) Auto-save answers and recover state on refresh.
5) Add progress bar and completion gate.

Output:
- Shuffle algorithm details.
- UX flow for load/save/recover.
- Manual QA checklist.
```

### AT-9: Results Page v1 (Type + Bars + Signals)

**Goal**
Render highly shareable results page sections A-E from product spec.

**Deliverables**
- Type headline + nickname
- Dimension bars with percentages
- Strongest signals (top 3)
- "What agent loves" and "What may frustrate" cards

**Acceptance Criteria**
- Results page is fully generated from API payload with no hardcoded type

**Coding Agent Prompt**
```text
Implement AT-9 for Agent Tea.

Requirements:
1) Build results page components for type code, nickname, and one-line summary.
2) Render 4 dimension bars with percent labels and side descriptions.
3) Add strongest signals block (top 3 traits by magnitude).
4) Add two narrative cards: "loves" and "frustrates".
5) Ensure responsive layout and screenshot-ready composition.

Output:
- Component architecture.
- Example payload mapping.
- QA notes for mobile + desktop.
```

### AT-10: Normal vs Intrusive Thoughts Mode

**Goal**
Add dual-tone narrative toggle with safe spicy transforms.

**Deliverables**
- Toggle control on results
- Copy variants for normal/spicy labels and summaries
- Intensity guardrails based on confidence/tie flags

**Acceptance Criteria**
- Spicy mode feels funny, not abusive, across test fixtures

**Coding Agent Prompt**
```text
Implement AT-10 for Agent Tea.

Requirements:
1) Add mode toggle: Normal / Intrusive Thoughts.
2) Add copy generation layer with safe spicy transformations.
3) Use tie_flags/confidence to soften spicy output when signal is weak.
4) Add unit tests for guardrail rules (no hostile phrasing categories).
5) Include content config file for editable phrasing.

Output:
- Copy transform strategy.
- Test coverage summary.
- Example outputs for 3 type cases.
```

### AT-11: Share Card Generator (Web + OG Image)

**Goal**
Generate social cards with type, nickname, and top stats.

**Deliverables**
- `GET /api/share-card/:sessionId` image endpoint (OG-compatible)
- Card templates for normal + intrusive modes
- Download/share buttons on results page

**Acceptance Criteria**
- Generated card is crisp on X/LinkedIn/Discord previews

**Coding Agent Prompt**
```text
Implement AT-11 for Agent Tea.

Requirements:
1) Build dynamic share-card image endpoint (e.g., @vercel/og or Satori stack).
2) Include type code, nickname, and 3 metric highlights.
3) Support normal and intrusive visual variants.
4) Add caching headers and stable URLs.
5) Wire share actions from results page.

Output:
- Endpoint implementation details.
- Example generated URLs.
- Cross-platform preview verification notes.
```

### AT-12: Character Figure System v1

**Goal**
Implement consistent illustration pipeline with type-aware variants.

**Deliverables**
- Illustration manifest mapping 16 types to character assets
- Shared visual style tokens (palette, shape language)
- Result page + share card figure integration

**Acceptance Criteria**
- Every type maps to a consistent figure without layout breakage

**Coding Agent Prompt**
```text
Implement AT-12 for Agent Tea.

Requirements:
1) Add figure asset manifest keyed by 16 type codes.
2) Define design tokens for consistent palette/background motif.
3) Integrate figures into result page and share cards.
4) Add fallback image behavior for missing assets.
5) Document asset naming and contribution rules.

Output:
- Asset manifest format.
- Integration points.
- Screenshot references for 4 sample types.
```

---

## Phase 3: Retention and Credibility Loops

### AT-13: Social Proof Module (Most Common + Rarest)

**Goal**
Add weekly type frequency insights to result and landing pages.

**Deliverables**
- Aggregation query/job for rolling 7-day distribution
- UI module for "Most common" and "Rarest"
- Minimum sample-size guardrail

**Acceptance Criteria**
- Stats hide automatically under threshold and never show misleading rarity

**Coding Agent Prompt**
```text
Implement AT-13 for Agent Tea.

Requirements:
1) Build 7-day aggregation for type frequencies from completed sessions.
2) Add API endpoint returning most_common and rarest with sample count.
3) Add threshold behavior for low sample sizes.
4) Render module on result page (and optional landing snippet).
5) Add tests for distribution logic and threshold fallback.

Output:
- Query/API details.
- UI behavior under low/high sample scenarios.
- Test results.
```

### AT-14: Compare Mode v1 (Cross-Agent Results)

**Goal**
Let users compare multiple agent perspectives side-by-side.

**Deliverables**
- Comparison entity linking multiple sessions
- Compare page showing matching and differing letters
- CTA from result page: "Try another agent"

**Acceptance Criteria**
- User can run two sessions and see a clean compare view

**Coding Agent Prompt**
```text
Implement AT-14 for Agent Tea.

Requirements:
1) Create compare model to link 2+ session results.
2) Add API to create/fetch compare sets.
3) Build compare UI showing per-dimension agreement/disagreement.
4) Add "Try another agent" from results into compare flow.
5) Add integration tests for compare creation and retrieval.

Output:
- Data model and route summary.
- UX flow from first result to compare page.
- Test evidence.
```

### AT-15: Evidence Layer v1 (Optional Expand Section)

**Goal**
Add credibility details without slowing default viral flow.

**Deliverables**
- Collapsible evidence section with "why" excerpts
- Strongest/contradictory response highlights
- Agent quote snippets (if provided)

**Acceptance Criteria**
- Evidence section is optional and does not block core share flow

**Coding Agent Prompt**
```text
Implement AT-15 for Agent Tea.

Requirements:
1) Add optional "Show why" section on results page.
2) Surface strongest supporting answers and contradiction signals.
3) Render short agent explanation snippets when available.
4) Keep default results uncluttered when section is collapsed.
5) Add tests for evidence ranking logic.

Output:
- Evidence ranking rules.
- UI state behavior.
- Example payloads with and without evidence.
```

### AT-16: Optional Account Linking (Post-Result Only)

**Goal**
Introduce optional accounts for saved history and multi-agent profiles.

**Deliverables**
- Supabase Auth (email/social) integration
- "Save my results" post-result CTA
- Backfill: attach anonymous sessions to authenticated user

**Acceptance Criteria**
- First run remains fully anonymous; account prompts appear only after value delivery

**Coding Agent Prompt**
```text
Implement AT-16 for Agent Tea.

Requirements:
1) Add Supabase Auth with optional sign-in/sign-up flow.
2) Keep anonymous test flow unchanged before first result.
3) After result, allow linking session history to user account.
4) Add user profile page with prior runs and compare links.
5) Add RLS updates for user-owned data access.

Output:
- Auth flow diagram.
- Migration/policy updates.
- QA steps proving anonymous-first behavior remains intact.
```

### AT-17: Growth Hooks (Referrals + Re-share)

**Goal**
Increase replay and distribution through built-in growth mechanics.

**Deliverables**
- Re-share prompts tailored by mode
- "Challenge a friend" copy links
- Basic referral attribution params

**Acceptance Criteria**
- Share and retake events are measurable and attributable

**Coding Agent Prompt**
```text
Implement AT-17 for Agent Tea.

Requirements:
1) Add referral query param support and attribution persistence.
2) Add UI CTAs: "Challenge a friend" and "Try another agent".
3) Add re-share prompts with prefilled social copy.
4) Track conversion from invite click to completed test.
5) Add analytics events and dashboard-friendly schema notes.

Output:
- Referral flow details.
- Event definitions.
- Verification scenario from invite to completion.
```

---

## Phase 4: Hardening and Launch Ops

### AT-18: Analytics and Funnel Instrumentation

**Goal**
Track drop-off and optimize completion/share loops.

**Deliverables**
- Event taxonomy doc + event emitters
- Funnel metrics (landing -> start -> complete -> share)
- Lightweight dashboard query pack

**Acceptance Criteria**
- Team can answer where users drop and which type outputs share best

**Coding Agent Prompt**
```text
Implement AT-18 for Agent Tea.

Requirements:
1) Define canonical event names and required properties.
2) Instrument client/server events across full journey.
3) Add Supabase SQL views for funnel conversion reporting.
4) Add basic analytics dashboard docs in docs/analytics.md.
5) Ensure PII-safe event payloads.

Output:
- Event schema.
- SQL views.
- Example funnel readout.
```

### AT-19: Content Moderation and Safety Guardrails

**Goal**
Prevent abusive spicy output and unsafe generated text.

**Deliverables**
- Allow/deny phrase lists and severity tiers
- Guardrail transform tests
- Moderation fallback messaging

**Acceptance Criteria**
- Unsafe phrasing blocked in tests and staging fixtures

**Coding Agent Prompt**
```text
Implement AT-19 for Agent Tea.

Requirements:
1) Add content guardrail layer for spicy and narrative outputs.
2) Implement denylist + severity-based rewrite fallback.
3) Add unit tests for prohibited categories.
4) Add moderation audit logging for blocked/rewritten lines.
5) Document policy in docs/safety.md.

Output:
- Guardrail architecture.
- Test matrix.
- Sample before/after rewrites.
```

### AT-20: Performance and Reliability

**Goal**
Ensure fast global experience and stable API behavior on Vercel.

**Deliverables**
- Caching strategy for share cards and static assets
- API timeout/retry strategy and error boundaries
- SLO targets for critical routes

**Acceptance Criteria**
- P95 page load and route latency within launch targets

**Coding Agent Prompt**
```text
Implement AT-20 for Agent Tea.

Requirements:
1) Add caching headers and revalidation strategy for static and dynamic resources.
2) Add robust API error handling and user-safe fallback states.
3) Add load/perf test scripts for critical endpoints.
4) Define SLO targets and add basic alert conditions.
5) Document performance checklist in docs/performance.md.

Output:
- Perf strategy and measured baseline.
- Critical route timings.
- Reliability notes.
```

### AT-21: Staging-to-Prod Release Pipeline

**Goal**
Establish safe deploy workflow via Vercel previews and protected production promotion.

**Deliverables**
- Preview environment checks
- Production deployment checklist
- DB migration runbook for Supabase

**Acceptance Criteria**
- Each release follows repeatable checklist with rollback plan

**Coding Agent Prompt**
```text
Implement AT-21 for Agent Tea.

Requirements:
1) Document branch-to-preview-to-prod workflow for Vercel.
2) Add release checklist including schema migration gates.
3) Add rollback runbook for app deploy and DB migration incidents.
4) Add smoke test script for post-deploy verification.
5) Store runbooks in docs/release-ops.md.

Output:
- Release process doc.
- Smoke test command list.
- Rollback decision tree.
```

### AT-22: Launch Readiness and Backlog Split

**Goal**
Finalize v1 launch scope and separate v1.1+ backlog.

**Deliverables**
- Launch checklist with owners/status
- Post-launch experiment backlog
- KPI targets for first 30 days

**Acceptance Criteria**
- Team has clear go/no-go criteria and first-month iteration plan

**Coding Agent Prompt**
```text
Implement AT-22 for Agent Tea.

Requirements:
1) Create launch checklist doc with pass/fail criteria.
2) Define first 30-day KPI targets (completion, share rate, retake, compare usage).
3) Create v1.1 backlog grouped by impact/effort.
4) Add experiment templates for A/B copy and spicy-mode intensity.
5) Add weekly operating cadence doc for launch month.

Output:
- Launch checklist.
- KPI table.
- Prioritized backlog.
```

---

## Recommended Execution Order (Practical)

1. Ship `AT-1` through `AT-6` first (functional test loop)
2. Ship `AT-7` through `AT-11` second (viral UX + shareability)
3. Add `AT-13` and `AT-14` next (social proof + compare loop)
4. Delay `AT-16` optional accounts until post-traction unless needed earlier
5. Run `AT-18` to `AT-22` before broad launch

## MVP Scope Cutline (If You Need Speed)

If you need a fast public beta, launch with:

- Required: `AT-1` to `AT-11`
- Nice-to-have: `AT-12`, `AT-13`
- Defer: `AT-14` to `AT-22` (except essential safety from `AT-19`)

This gets you a viral-ready version quickly while preserving the roadmap for depth.
