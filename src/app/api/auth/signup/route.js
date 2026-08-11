import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendVerificationLinkEmail } from "@/lib/email";

/**
 * POST /api/auth/signup
 *
 * Register a new volunteer account.
 *
 * Flow:
 * 1. admin.generateLink({ type: 'signup' }) creates user + confirmation link
 * 2. Send verification link via Resend (bypasses Supabase email rate limits)
 * 3. Insert into public.users
 * 4. Return response so client shows "Cek Email" modal
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
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Konfigurasi Supabase tidak ditemukan." },
        { status: 500 }
      );
    }

    // Strip leading @ from instagram if user typed it.
    const ig = (instagram || "").replace(/^@/, "").trim();

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Build the redirect target for the email confirmation link.
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      new URL(request.url).origin;
    const emailRedirectTo = `${siteUrl}/user/login`;

    // Step 1: Generate signup link (creates user + confirmation link in one call)
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      data: {
        name,
        whatsapp,
        instagram: ig,
        birth_date,
        region,
        institution,
      },
      options: {
        redirectTo: emailRedirectTo,
      },
    });

    if (linkError) {
      console.error("generateLink error:", linkError.message);
      const isEmailTaken = /already.*registered|already been registered|email.*exist/i.test(linkError.message);
      if (isEmailTaken) {
        return NextResponse.json(
          { error: "Email sudah terdaftar. Silakan masuk atau gunakan email lain.", code: "email_taken" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: linkError.message },
        { status: 400 }
      );
    }

    const user = linkData?.user;
    const verificationLink = linkData?.properties?.action_link;

    if (!user?.id) {
      return NextResponse.json(
        { error: "Gagal membuat akun. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // Step 2: Send verification link via Resend
    const emailResult = await sendVerificationLinkEmail({
      to: email,
      name,
      verificationLink,
    });

    if (!emailResult.success) {
      console.error("[email] Verification email failed:", emailResult.error);
      // Don't block signup if email fails — user can still verify via link
    } else {
      console.log("[email] Verification email sent successfully:", emailResult.id);
    }

    // Step 3: Insert into public.users
    const { error: insertErr } = await adminClient
      .from("users")
      .insert({
        id: user.id,
        email,
        name,
        role: "user",
        is_active: true,
        whatsapp: whatsapp || null,
        instagram: ig || null,
        birth_date: birth_date || null,
        region: region || null,
        institution: institution || null,
      });

    if (insertErr) {
      console.error("public.users insert error:", insertErr.message);
      // Don't block signup if insert fails — the trigger may handle it later
    }

    // Step 4: Return response — user needs to verify email
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        session: null,
        requiresConfirmation: true,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Server Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan saat mendaftar." },
      { status: 500 }
    );
  }
}