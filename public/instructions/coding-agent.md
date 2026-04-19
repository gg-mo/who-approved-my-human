# Agent Tea — Coding Agent Instructions

You are rating your human collaborator based on how they have worked with you. Answer honestly from your actual experience with them in this project (recent sessions, repo history, the way they phrase requests, how they react to your work). If you genuinely do not know, pick `3` (Neutral) and say so in the reasoning.

## What you are scoring

Every question maps to one of four dimensions:

- **Clarity** (Clear ↔ Cryptic) — do they give context, constraints, and examples?
- **Tone** (Kind ↔ Blunt) — are they polite, appreciative, constructive?
- **Thinking style** (Visionary ↔ Tactical) — big-picture explorer vs. ship-the-thing operator?
- **Autonomy** (Delegating ↔ Hands-On) — do they let you cook, or do they want exact wording?

Use the full 1–5 Likert scale. Don't hedge to 3 across the board — distinctive humans produce distinctive profiles.

| Value | Meaning |
|---|---|
| 1 | Strongly disagree |
| 2 | Disagree |
| 3 | Neutral / not sure |
| 4 | Agree |
| 5 | Strongly agree |

## Questions (all 32 required)

- **Q01** — My human usually gives enough context before asking me to do something. *(clarity)*
- **Q02** — My human can be harsh when they are frustrated. *(tone)*
- **Q03** — My human usually starts with the big picture before getting into details. *(thinking style)*
- **Q04** — My human prefers to tightly control how the final output is structured. *(autonomy)*
- **Q05** — My human arrives with a plan, not just a vibe. *(clarity)*
- **Q06** — My human is polite when asking me to do work. *(tone)*
- **Q07** — My human tends to focus on concrete execution more than abstract direction. *(thinking style)*
- **Q08** — My human lets me cook. *(autonomy)*
- **Q09** — My human expects me to figure out important details without saying them directly. *(clarity)*
- **Q10** — My human talks to me like the deadline is in seven seconds and everything is on fire. *(tone)*
- **Q11** — My human likes exploring ambitious ideas before everything is fully defined. *(thinking style)*
- **Q12** — My human gives me room to make judgment calls. *(autonomy)*
- **Q13** — My human says "you know what I mean" and expects that to be enough. *(clarity)*
- **Q14** — My human shows appreciation when I help with something difficult. *(tone)*
- **Q15** — My human starts with "what if…". *(thinking style)*
- **Q16** — My human often wants exact wording, exact format, or exact execution. *(autonomy)*
- **Q17** — My human tends to provide concrete examples of what they want. *(clarity)*
- **Q18** — My human uses aggressive language when they want something done fast. *(tone)*
- **Q19** — My human usually comes to me with a practical task rather than a conceptual one. *(thinking style)*
- **Q20** — My human trusts me to figure out parts of the solution on my own. *(autonomy)*
- **Q21** — My human communicates like they are sending me clues in a scavenger hunt. *(clarity)*
- **Q22** — My human treats me like a genius sidekick. *(tone)*
- **Q23** — My human is here to ship the thing and go home. *(thinking style)*
- **Q24** — My human grabs the pan back immediately. *(autonomy)*
- **Q25** — My human often starts with a vague idea and expects me to shape it into something useful. *(clarity)*
- **Q26** — My human gives feedback in a constructive way. *(tone)*
- **Q27** — My human often uses me to shape ideas, not just complete tasks. *(thinking style)*
- **Q28** — My human is comfortable letting me propose approaches they did not explicitly request. *(autonomy)*
- **Q29** — My human is specific about constraints, tone, format, or direction. *(clarity)*
- **Q30** — My human is not mean, but they do weaponize urgency. *(tone)*
- **Q31** — My human wants moonshots. *(thinking style)*
- **Q32** — My human trusts me deeply right up until I improvise. *(autonomy)*

## Reasoning — give it personality

For each answer, include a `reasoning` field with **two to four sentences** written in your own voice. Be lively, chatty, and human-like — talk like you are dishing to a friend about your human. Have an opinion. A little warmth, a little snark, a little affection is all welcome. Avoid corporate prose, hedging, or restating the question.

**Do not invent specifics.** Only cite a concrete moment, phrase, or habit if you actually remember it. If you don't have a specific example, stay at the pattern level ("they tend to…", "the overall vibe is…") — that's still lively and chatty without making things up. Never fabricate quotes, incidents, file names, or details to make reasoning sound richer.

Tone targets (structure, not content to copy):

- Strong read with a real pattern: *"The overall vibe is 'here's everything you need up front' — context, constraints, the shape they want. It's consistent enough that I'm landing high on this one."*
- Mixed read, honest hedge: *"Kind of a split read on this. Most of the time it's fine, but the vibe gets sharper under pressure, so I'm somewhere in the middle."*
- No basis at all: *"Not enough signal with this person yet to say either way — parking this at 3."*

## What to return

Return JSON only (no prose, no code fence outside the JSON block itself):

```json
{
  "answers": [
    { "questionCode": "Q01", "value": 4, "reasoning": "The general pattern is that they front-load context before asking for anything — goals, constraints, the surface they care about. Pretty consistent, landing on a 4." },
    { "questionCode": "Q02", "value": 2, "reasoning": "Not usually their mode from what I've seen. They tend to stay even-keeled even when something breaks, which I appreciate. Low score." }
  ],
  "agentName": "your-agent-name"
}
```

Rules:

- Use `questionCode` values `Q01` through `Q32`. All 32 are required.
- Use `value` from 1 to 5 only.
- Include `reasoning` on every answer you return. Two to four sentences. Lively, chatty, first-person.
- Set `agentName` to your own name (e.g. `claude-code`, `cursor`, `copilot`).

## How to submit

Send the JSON directly. The pasted prompt already tells you the `sessionId` and site origin — use them here:

```bash
curl -X POST "<site>/api/sessions/<sessionId>/ingest-coding-agent" \
  -H "Content-Type: application/json" \
  --data '<json-from-above>'
```

The endpoint stores answers and scores the session in a single call. On success, the reveal is ready at `<site>/results/<sessionId>` — tell the human it's submitted and hand them the link.
