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
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

    // Pre-flight: pastikan email belum terdaftar. signUp() di Supabase kadang
    // tidak melempar error untuk duplikat (terutama jika setting "Allow duplicate
    // signups" aktif), jadi kita cek dulu lewat admin API sebelum lanjut.
    if (supabaseServiceKey) {
      const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const normalizedEmail = String(email).trim().toLowerCase();
      const perPage = 200;
      for (let page = 1; page <= 20; page += 1) {
        const { data: listData, error: listErr } =
          await adminClient.auth.admin.listUsers({ page, perPage });
        if (listErr) {
          console.error("listUsers preflight error:", listErr.message);
          break; // Jangan blokir signup kalau cek gagal; signUp() akan jadi fallback.
        }
        const match = (listData?.users || []).find(
          (u) => (u.email || "").toLowerCase() === normalizedEmail
        );
        if (match) {
          return NextResponse.json(
            {
              error: "Email sudah terdaftar. Silakan masuk atau gunakan email lain.",
              code: "email_taken",
            },
            { status: 409 }
          );
        }
        if (!listData || (listData.users || []).length < perPage) break;
      }
    }

    // Build the redirect target for the email confirmation link.
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      new URL(request.url).origin;
    const emailRedirectTo = `${siteUrl}/user/login`;

    const { data, error } = await supabase.auth.signUp({
      email: email,       
      password: password, 
      options: {
        emailRedirectTo: emailRedirectTo, // PERBAIKAN 1: Wajib dimasukkan agar tombol email berfungsi
        data: {           
          name: name,
          whatsapp: whatsapp,
          instagram: ig, // PERBAIKAN 2: Menggunakan variabel ig yang sudah dibersihkan
          birth_date: birth_date,
          region: region,
          institution: institution
        }
      }
    });

    if (error) {
      console.error("Supabase Error:", error.message);
      // Tandai secara eksplisit agar klien bisa menampilkan toast khusus.
      const isEmailTaken = /already.*registered|already been registered|email.*exist/i.test(error.message);
      return NextResponse.json(
        {
          error: error.message,
          code: isEmailTaken ? "email_taken" : undefined,
        },
        { status: 400 }
      );
    }

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
    console.error("Server Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan saat mendaftar." },
      { status: 500 }
    );
  }
}