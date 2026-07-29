import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey } from "@/lib/supabaseKeys";

/**
 * POST /api/auth/request-reset
 *
 * Sends a password reset email to the user. Always returns ok regardless of
 * whether the email exists, to avoid leaking account enumeration.
 * Body: { email }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email tidak valid." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = getSupabaseAnonKey();

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Konfigurasi Supabase tidak ditemukan." },
        { status: 500 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      new URL(request.url).origin;
    const emailRedirectTo = `${siteUrl}/user/reset-password`;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: emailRedirectTo,
    });

    if (error) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: true });
  }
}