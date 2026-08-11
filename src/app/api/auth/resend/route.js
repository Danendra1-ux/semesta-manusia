import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendVerificationLinkEmail } from "@/lib/email";

/**
 * POST /api/auth/resend
 *
 * Re-sends the verification link to a user who hasn't verified yet.
 * Uses admin.generateLink to create a fresh link (no rate limit),
 * then sends via Resend.
 *
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
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Konfigurasi Supabase tidak ditemukan." },
        { status: 500 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      new URL(request.url).origin;
    const emailRedirectTo = `${siteUrl}/user/login`;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Generate a fresh signup link (creates fresh token, no rate limit)
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "signup",
      email,
      options: { redirectTo: emailRedirectTo },
    });

    if (linkError) {
      console.error("generateLink resend error:", linkError.message);
      return NextResponse.json({ error: linkError.message }, { status: 400 });
    }

    const user = linkData?.user;
    const verificationLink = linkData?.properties?.action_link;

    if (!user?.id || !verificationLink) {
      return NextResponse.json(
        { error: "Gagal membuat link verifikasi." },
        { status: 500 }
      );
    }

    // Get name from user metadata or email
    const name = user.user_metadata?.name || (email || "").split("@")[0] || "Pengguna";

    // Send via Resend
    const emailResult = await sendVerificationLinkEmail({
      to: email,
      name,
      verificationLink,
    });

    if (!emailResult.success) {
      console.error("[email] Verification email resend failed:", emailResult.error);
      return NextResponse.json(
        { error: "Gagal mengirim email. Coba lagi nanti." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}