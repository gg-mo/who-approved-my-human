import '@testing-library/jest-dom/vitest';

process.env.NEXT_PUBLIC_SITE_URL ??= 'http://localhost:3000';
process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'anon-test-key';
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'service-role-test-key';
