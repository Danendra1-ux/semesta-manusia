import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * GET /api/auth/me
 *
 * Returns the current user's public.users row, or 401 if no session.
 * The trigger keeps public.users in sync with auth.users, so we can
 * safely read the data we need from there.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Konfigurasi Supabase tidak ditemukan." },
        { status: 500 }
      );
    }

    // Read the session via SSR client (uses cookies).
    const ssrClient = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op in read-only check.
        },
      },
    });
    const { data: sessionData } = await ssrClient.auth.getUser();
    const authUser = sessionData?.user;
    if (!authUser) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Query the public.users row with the service-role client.
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: row, error } = await adminClient
      .from("users")
      .select(
        "id, email, name, role, is_active, whatsapp, instagram, birth_date, region, institution, created_at, last_login_at"
      )
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If the trigger hasn't fired yet (e.g. signup just happened),
    // fall back to a row built from auth metadata so the UI has data.
    if (!row) {
      const meta = authUser.user_metadata || {};
      return NextResponse.json({
        id: authUser.id,
        email: authUser.email,
        name: meta.name || (authUser.email || "").split("@")[0],
        role: meta.role || "user",
        is_active: true,
        whatsapp: meta.whatsapp || null,
        instagram: meta.instagram || null,
        birth_date: meta.birth_date || null,
        region: meta.region || null,
        institution: meta.institution || null,
        created_at: authUser.created_at,
        last_login_at: authUser.last_sign_in_at,
      });
    }

    return NextResponse.json({ user: row });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}