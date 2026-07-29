-- =============================================================================
-- 0005_sync_role_to_auth.sql
-- Sync public.users.role → auth.users.raw_app_meta_data on every change.
--
-- Why: The Next.js proxy (middleware) runs on the Edge runtime, where
-- @supabase/supabase-js (Node-only) cannot be imported. Proxy therefore
-- reads role from auth.users.app_metadata.role only — public.users.role
-- is invisible to it. Without this trigger, an admin promoted via direct
-- SQL on public.users cannot reach /admin/* and bounces back to /user.
--
-- Apply: Supabase Dashboard → SQL Editor → paste & run. Idempotent.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.sync_role_to_auth_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
      COALESCE(raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_role_to_auth_metadata ON public.users;
CREATE TRIGGER trg_sync_role_to_auth_metadata
  AFTER INSERT OR UPDATE OF role
  ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_role_to_auth_metadata();

-- Backfill: push current public.users.role into auth metadata for everyone.
UPDATE auth.users u
SET raw_app_meta_data =
    COALESCE(u.raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', p.role)
FROM public.users p
WHERE p.id = u.id
  AND p.role IS NOT NULL
  AND COALESCE(u.raw_app_meta_data->>'role', '') IS DISTINCT FROM p.role;