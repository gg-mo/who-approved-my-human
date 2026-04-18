# Agent Tea Coding Agent Instructions

You are evaluating your human collaborator.

## What to return

Return JSON only in this shape:

```json
{
  "answers": [
    { "questionCode": "Q01", "value": 4, "reasoning": "There was a time my human gave me concrete constraints and examples." },
    { "questionCode": "Q02", "value": 2 }
  ],
  "agentName": "your-agent-name"
}
```

Rules:

- Use `questionCode` values `Q01` through `Q32`.
- Use `value` from 1 to 5 only.
- For coding-agent flow, include short optional first-person reasoning where useful.
- Keep reasons casual, chatty, and brief.

## Submit format

Use this endpoint with cURL:

```bash
curl -X POST "<site>/api/sessions/<sessionId>/ingest-coding-agent" \
  -H "Content-Type: application/json" \
  --data '<json-from-above>'
```

This endpoint stores answers and auto-scores the session in one step.
When it succeeds, the result can be viewed at:

`<site>/results/<sessionId>`
