# 01 - v1 Core System

## Locked Dimensions

- `C / X` = Clear / Cryptic
- `K / B` = Kind / Blunt
- `V / T` = Visionary / Tactical
- `D / H` = Delegating / Hands-On

This yields exactly **16 type combinations**:

- `CKVD`, `CKVH`, `CKTD`, `CKTH`
- `CBVD`, `CBVH`, `CBTD`, `CBTH`
- `XKVD`, `XKVH`, `XKTD`, `XKTH`
- `XBVD`, `XBVH`, `XBTD`, `XBTH`

## Question Mix (Launch)

- **20 scored core questions** (5 per dimension)
- **12 scored spicy questions** (same scoring weight as core)

Rationale: slightly more depth than ultra-short tests while still fast enough to feel social and repeatable.

## Response Scale

- Strongly disagree = 1
- Disagree = 2
- Neutral = 3
- Agree = 4
- Strongly agree = 5

## Scoring Rules

1. Each scored question maps to one side of one dimension.
2. Reverse-keyed questions are inverted before tally.
3. Per dimension, compute side totals.
4. Convert side totals to percentages.
5. Dominant side gets the output letter.

Formula per side:

- `side_pct = side_score / (side_a_score + side_b_score)`

## Randomization Rules

- Shuffle question order per run
- Never place opposite-polarity statements from the same dimension back-to-back
- If spicy mode is ON, lightly interleave spicy prompts and score them the same way as core prompts
- Use constrained shuffle with retry/backtracking so adjacency violations are impossible

## Output Contract

- 4-letter type
- Percentage split per dimension
- Type nickname (normal + spicy variant)
- Top 3 strongest signals
- "What your agent loves"
- "What may frustrate your agent"
- Share card
