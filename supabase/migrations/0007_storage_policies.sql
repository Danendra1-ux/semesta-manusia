-- =============================================================================
-- 0007_storage_policies.sql
-- Add the missing storage policies for the registration-files bucket.
--
-- Symptom: volunteer upload returns 400 "new row violates row-level security
-- policy". Supabase storage RLS policies must include the `owner = auth.uid()`
-- check on INSERT — the bucket-id-only check is not enough because storage
-- auto-fills owner from the JWT, and the policy must allow that row in.
--
-- Drop any partial policies from 0006 first, then recreate them with the
-- correct shape. Idempotent.
-- =============================================================================

DROP POLICY IF EXISTS "volunteer upload to registration-files" ON storage.objects;
DROP POLICY IF EXISTS "anyone can read registration-files" ON storage.objects;
DROP POLICY IF EXISTS "volunteer uploads to registration-files" ON storage.objects;
DROP POLICY IF EXISTS "registration-files read" ON storage.objects;

-- Authenticated volunteers can upload. Bucket-scoped + owner-scoped.
-- Storage treats `owner` as the upload's authenticated user.
CREATE POLICY "volunteer uploads to registration-files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'registration-files'
    AND owner = auth.uid()
  );

-- Authenticated volunteers can read back their own uploads (used by
-- preview during the multi-step registration form).
CREATE POLICY "registration-files read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'registration-files');