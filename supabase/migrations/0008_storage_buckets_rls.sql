-- =============================================================================
-- 0008_storage_buckets_rls.sql
-- Make storage.buckets readable by anon / authenticated / public.
--
-- Symptom: volunteer upload returns 400 "new row violates row-level security
-- policy" even though INSERT policy on storage.objects is correct.
-- Cause: storage.buckets has zero policies (query confirmed empty), so the
-- Storage API's getBucket() lookup for anon/authenticated is denied. The
-- subsequent insert hits an internal storage check and fails with an
-- opaque RLS error.
--
-- Apply: Supabase Dashboard → SQL Editor → paste & run. Idempotent.
-- =============================================================================

DROP POLICY IF EXISTS "buckets are publicly readable" ON storage.buckets;

CREATE POLICY "buckets are publicly readable"
  ON storage.buckets
  FOR SELECT
  TO public, authenticated, anon
  USING (true);