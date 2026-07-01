import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getAdminSession } from "@/lib/adminAuth";

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

/**
 * GET /api/admin/users
 *
 * Returns all registered volunteer users (the only role stored in
 * public.users). Admin accounts live in Supabase auth only and are
 * intentionally excluded from this listing.
 *
 * The effective status of a user is computed on read: a user is treated as
 * "Nonaktif" when their last_login_at is older than 6 months. The stored
 * is_active flag is preserved alongside for admin context, and is what gets
 * updated by the manual toggle endpoint.
 *
 * Uses service role to bypass RLS for the listing query.
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

    const ssrClient = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });
    const session = await getAdminSession(ssrClient);
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await adminClient
      .from("users")
      .select(
        "id, email, name, role, is_active, whatsapp, instagram, region, institution, created_at, last_login_at"
      )
      // Only volunteer / Pengguna rows. Admin lives in Supabase auth only.
      .or("role.eq.user,role.is.null")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = Date.now();
    const users = (data || []).map((u) => {
      const last = u.last_login_at ? new Date(u.last_login_at).getTime() : null;
      const isInactiveByLogin = last !== null && now - last > SIX_MONTHS_MS;
      return {
        ...u,
        // Effective status used by the UI: dormant login OR explicit flag.
        // Treat null is_active the same as true (presumably from a legacy row).
        effective_is_active:
          u.is_active === true && !isInactiveByLogin,
      };
    });

    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}