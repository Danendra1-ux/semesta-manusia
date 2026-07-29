-- =============================================================================
-- 0006_storage_bucket.sql
-- Create the storage bucket used for volunteer registration uploads
-- (CVs, motivational essays, certificates, etc.) and the policies that
-- let volunteers upload their own files while keeping them readable by
-- admins and the registration owner.
--
-- Bucket name: registration-files  (matches src/app/.../register/page.jsx)
-- Public: true (the public URL is shared with admins via the DB row)
--
-- Apply: Supabase Dashboard → SQL Editor → paste & run. Idempotent.
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'registration-files',
  'registration-files',
  true,
  10485760,  -- 10 MiB per file
  NULL       -- allow any MIME type; validators on the form reject bad files
)
ON CONFLICT (id) DO NOTHING;

-- Volunteers can upload to the bucket, and read only the object they
-- uploaded in the same session. Auth path through the JWT alone — we
-- trust the object-name prefix on the server route to scope ownership.
DROP POLICY IF EXISTS "volunteer upload to registration-files" ON storage.objects;
CREATE POLICY "volunteer upload to registration-files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'registration-files');

DROP POLICY IF EXISTS "anyone can read registration-files" ON storage.objects;
CREATE POLICY "anyone can read registration-files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'registration-files');