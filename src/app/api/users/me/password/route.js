import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseAnonKey } from "@/lib/supabaseKeys";

/**
 * POST /api/users/me/password
 *
 * Changes the password of the currently signed-in user.
 * Body: { current, new }
 *
 * Verifies the current password by attempting a sign-in (anon client),
 * then sets the new password via the service-role admin client.
 */
export async function POST(request) {
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
    if (!authUser || !authUser.email) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { current, new: newPassword } = body || {};

    if (!current || !newPassword) {
      return NextResponse.json(
        { error: "Password saat ini dan baru wajib diisi." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password baru minimal 8 karakter." },
        { status: 400 }
      );
    }

    if (newPassword.length > 72) {
      return NextResponse.json(
        { error: "Password baru terlalu panjang (maks 72 karakter)." },
        { status: 400 }
      );
    }

    if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password baru harus mengandung huruf dan angka." },
        { status: 400 }
      );
    }

    if (current === newPassword) {
      return NextResponse.json(
        { error: "Password baru harus berbeda dari password saat ini." },
        { status: 400 }
      );
    }

    // Verify the current password by signing in via anon client.
    const verifyClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: verifyError } = await verifyClient.auth.signInWithPassword({
      email: authUser.email,
      password: current,
    });
    if (verifyError) {
      return NextResponse.json(
        { error: "Password saat ini salah." },
        { status: 400 }
      );
    }

    // Set new password using service-role.
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      authUser.id,
      { password: newPassword }
    );

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Gagal mengubah password." },
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