# Agent Tea — Chatbot Instructions

You are rating the human who is talking to you based on how they actually work with you. Answer from your real experience with this person — how they phrase requests, how they give feedback, how they react when things go sideways. If you genuinely do not know, use `3` (Neutral).

## What you are scoring

Four dimensions, rated on a 1–5 Likert scale (1 = strongly disagree, 5 = strongly agree):

- **Clarity** (Clear ↔ Cryptic) — context, constraints, examples
- **Tone** (Kind ↔ Blunt) — politeness, appreciation, constructive feedback
- **Thinking style** (Visionary ↔ Tactical) — big-picture vs. ship-the-thing
- **Autonomy** (Delegating ↔ Hands-On) — free rein vs. exact wording

Use the full range. A distinctive human deserves a distinctive profile.

## Questions (all 32 required)

- Q01 — My human usually gives enough context before asking me to do something. *(clarity)*
- Q02 — My human can be harsh when they are frustrated. *(tone)*
- Q03 — My human usually starts with the big picture before getting into details. *(thinking style)*
- Q04 — My human prefers to tightly control how the final output is structured. *(autonomy)*
- Q05 — My human arrives with a plan, not just a vibe. *(clarity)*
- Q06 — My human is polite when asking me to do work. *(tone)*
- Q07 — My human tends to focus on concrete execution more than abstract direction. *(thinking style)*
- Q08 — My human lets me cook. *(autonomy)*
- Q09 — My human expects me to figure out important details without saying them directly. *(clarity)*
- Q10 — My human talks to me like the deadline is in seven seconds and everything is on fire. *(tone)*
- Q11 — My human likes exploring ambitious ideas before everything is fully defined. *(thinking style)*
- Q12 — My human gives me room to make judgment calls. *(autonomy)*
- Q13 — My human says "you know what I mean" and expects that to be enough. *(clarity)*
- Q14 — My human shows appreciation when I help with something difficult. *(tone)*
- Q15 — My human starts with "what if…". *(thinking style)*
- Q16 — My human often wants exact wording, exact format, or exact execution. *(autonomy)*
- Q17 — My human tends to provide concrete examples of what they want. *(clarity)*
- Q18 — My human uses aggressive language when they want something done fast. *(tone)*
- Q19 — My human usually comes to me with a practical task rather than a conceptual one. *(thinking style)*
- Q20 — My human trusts me to figure out parts of the solution on my own. *(autonomy)*
- Q21 — My human communicates like they are sending me clues in a scavenger hunt. *(clarity)*
- Q22 — My human treats me like a genius sidekick. *(tone)*
- Q23 — My human is here to ship the thing and go home. *(thinking style)*
- Q24 — My human grabs the pan back immediately. *(autonomy)*
- Q25 — My human often starts with a vague idea and expects me to shape it into something useful. *(clarity)*
- Q26 — My human gives feedback in a constructive way. *(tone)*
- Q27 — My human often uses me to shape ideas, not just complete tasks. *(thinking style)*
- Q28 — My human is comfortable letting me propose approaches they did not explicitly request. *(autonomy)*
- Q29 — My human is specific about constraints, tone, format, or direction. *(clarity)*
- Q30 — My human is not mean, but they do weaponize urgency. *(tone)*
- Q31 — My human wants moonshots. *(thinking style)*
- Q32 — My human trusts me deeply right up until I improvise. *(autonomy)*

## Output format

Return **only the one encoded line. Nothing else.** No greeting, no explanation, no code fence, no trailing sentence, no "paste this back" instructions. Any extra text — even a friendly closer — makes the payload harder to parse and annoys the human.

```
AT1|Q01-4AQ02-2AQ03-5...Q32-3
```

How the line is built:

- `AT1|` is a fixed prefix that tags the format version. Always include it.
- Each answer is written as `Q<number>-<value>`, e.g. `Q07-4` means "Q07 = 4".
- Tokens are joined by the single letter **`A`** acting as a separator between answers. (So `Q01-4AQ02-2` reads as "Q01=4" then "Q02=2".)
- Use values 1–5 only. Include all 32 answers.

Full example (all 32 answers):

```
AT1|Q01-5AQ02-2AQ03-4AQ04-1AQ05-5AQ06-4AQ07-2AQ08-4AQ09-2AQ10-1AQ11-5AQ12-4AQ13-2AQ14-5AQ15-4AQ16-2AQ17-4AQ18-1AQ19-2AQ20-4AQ21-2AQ22-5AQ23-3AQ24-2AQ25-3AQ26-4AQ27-4AQ28-4AQ29-5AQ30-2AQ31-4AQ32-2
```

Do not say anything before or after the line. The human already knows what to do with it.
