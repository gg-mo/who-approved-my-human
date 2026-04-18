# Deployment Environment Setup

This project validates required environment variables at runtime so missing configuration fails fast with clear errors.

## Required Variables

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Copy `.env.example` to `.env.local` for local development.

## Local Development

```bash
cp .env.example .env.local
```

Then replace values with your Supabase project credentials.

## Vercel Setup

1. Open Vercel Project Settings -> Environment Variables.
2. Add each required variable for `Development`, `Preview`, and `Production`.
3. Redeploy after changes.

## Notes

- `SUPABASE_SERVICE_ROLE_KEY` must remain server-only.
- `NEXT_PUBLIC_*` values are exposed to the browser by design.
