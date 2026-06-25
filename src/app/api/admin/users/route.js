import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getAdminSession } from "@/lib/adminAuth";

/**
 * GET /api/admin/users
 *
 * Returns all registered volunteer users (the only role stored in
 * public.users). Admin accounts live in Supabase auth only and are
 * intentionally excluded from this listing.
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
        "id, email, name, role, avatar_url, is_active, whatsapp, instagram, region, institution, created_at, last_login_at"
      )
      // Only volunteer / Pengguna rows. Admin lives in Supabase auth only.
      .or("role.eq.user,role.is.null")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}