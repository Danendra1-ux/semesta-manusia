import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAnonKey } from "./supabaseKeys";

/**
 * Read the current volunteer (non-admin) session from Supabase cookies.
 *
 * Returns { user, role } if a session is found, or null otherwise.
 * Unlike getAdminSession, this does NOT filter by role - any signed-in
 * user (admin or volunteer) is returned.
 */
export async function getUserSession() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op in a read-only check.
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return null;

    const role =
      user.app_metadata?.role || user.user_metadata?.role || user.role || "user";

    return { user, role };
  } catch {
    return null;
  }
}
