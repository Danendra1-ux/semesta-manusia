// Resolves the Supabase public/anon key from env, accepting either naming.
// Newer Supabase dashboards issue `sb_publishable_*` keys under
// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; older setups use a JWT under
// NEXT_PUBLIC_SUPABASE_ANON_KEY. This helper falls back across both so
// we support either convention without forcing a rename.
export function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

export function getSupabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}
