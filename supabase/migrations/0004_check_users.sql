-- =============================================================================
-- 0004_check_users.sql
-- Diagnostic query: cek state tabel public.users dan trigger
-- setelah UUID migration.
-- =============================================================================

-- 1) Apakah tabel public.users ada?
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

-- 2) Skema kolom public.users
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 3) Apakah trigger on_auth_user_created masih ada?
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_schema = 'auth';

-- 4) Berapa row di public.users?
SELECT COUNT(*) AS users_count FROM public.users;

-- 5) Sample 3 row terakhir (kalau ada)
SELECT id, email, name, role, created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 3;