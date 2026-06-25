import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/auth/signup
 *
 * Register a new volunteer account. Forwards Data Diri fields to
 * auth.users.raw_user_meta_data so the on_auth_user_created trigger
 * can populate public.users on insert.
 *
 * Uses the anon key (NOT service role) so the auth flow runs as the
 * new user - this is what triggers the cookie/session creation.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      whatsapp,
      instagram,
      birth_date,
      region,
      institution,
    } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
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

    // Strip leading @ from instagram if user typed it.
    const ig = (instagram || "").replace(/^@/, "").trim();

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Build the redirect target for the email confirmation link.
    // Priority: NEXT_PUBLIC_SITE_URL env > request origin. Always point to
    // /user/login so the link bounces back to our app after the user clicks
    // "Confirm" in their inbox.
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      new URL(request.url).origin;
    const emailRedirectTo = `${siteUrl}/user/login`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          name,
          whatsapp: whatsapp || "",
          instagram: ig,
          birth_date: birth_date || "",
          region: region || "",
          institution: institution || "",
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If Supabase returned a session, the user is auto-signed-in
    // (email confirmation disabled). Otherwise they must confirm via email.
    const requiresConfirmation = !data?.session;

    return NextResponse.json(
      {
        user: data?.user || null,
        session: data?.session || null,
        requiresConfirmation,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan saat mendaftar." },
      { status: 500 }
    );
  }
}