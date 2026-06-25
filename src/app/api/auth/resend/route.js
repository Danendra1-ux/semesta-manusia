import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/auth/resend
 *
 * Re-sends the "Confirm signup" email to a user who hasn't verified yet.
 * Body: { email }
 *
 * Rate limit: Supabase itself caps resends (≈ 1 per minute per email), so
 * we don't need a server-side counter — clients should debounce the button
 * themselves to avoid a wasted round-trip.
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
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Konfigurasi Supabase tidak ditemukan." },
        { status: 500 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      new URL(request.url).origin;
    const emailRedirectTo = `${siteUrl}/user/login`;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}