-- =============================================================================
-- 0003_rls_and_grants.sql
-- Disable RLS + GRANT ke anon/authenticated/service_role untuk testing lokal.
-- Untuk production, ganti dengan RLS policies yang restrict by auth.uid().
-- =============================================================================

-- Drop existing policies kalau ada (defensive — safe kalau belum ada)
DO $$
BEGIN
  PERFORM (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN (
      'programs', 'program_funding_types', 'registrations',
      'registration_files', 'registration_answers'
    )
  );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Disable RLS untuk testing (semua role bisa baca/tulis semua row)
ALTER TABLE public.programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_funding_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_answers DISABLE ROW LEVEL SECURITY;

-- Grant akses ke semua role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
