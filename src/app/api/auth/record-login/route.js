import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseAnonKey } from "@/lib/supabaseKeys";

/**
 * POST /api/auth/record-login
 */

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = getSupabaseAnonKey();
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
    const { data: sessionData } = await ssrClient.auth.getUser();
    const authUser = sessionData?.user;
    if (!authUser) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();
    const nowIso = now.toISOString();

    const { data: existing, error: lookupErr } = await adminClient
      .from("users")
      .select("last_login_at, is_active")
      .eq("id", authUser.id)
      .maybeSingle();

    if (lookupErr) {
      return NextResponse.json({ error: lookupErr.message }, { status: 500 });
    }

    const previousLoginAt = existing?.last_login_at
      ? new Date(existing.last_login_at)
      : null;
    const wasDormant =
      previousLoginAt && now.getTime() - previousLoginAt.getTime() > SIX_MONTHS_MS;

    const update = { last_login_at: nowIso };
    let reactivated = false;
    if (wasDormant && existing && existing.is_active === false) {
      update.is_active = true;
      reactivated = true;
    }

    const { error } = await adminClient
      .from("users")
      .update(update)
      .eq("id", authUser.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, last_login_at: nowIso, reactivated });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}