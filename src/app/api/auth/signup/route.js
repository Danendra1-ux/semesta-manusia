import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey } from "@/lib/supabaseKeys";

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
    const supabaseAnonKey = getSupabaseAnonKey();
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

    // Pre-flight: pastikan email belum terdaftar.
    let adminClient = null;
    if (supabaseServiceKey) {
      adminClient = createClient(supabaseUrl, supabaseServiceKey, {
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

    // [LOCAL TESTING] Email verification fully disabled.
    //
    // Pakai admin.createUser langsung (bukan anon signUp) supaya:
    // 1. Tidak ada email konfirmasi yang dikirim (lewati Supabase rate limit).
    // 2. email_confirm: true set dari awal, jadi user auto-verified.
    // 3. signInWithPassword di bawah mengembalikan session → client auto-login.
    //
    // Fallback ke signUp() anonim hanya kalau service role key tidak ada.

    let data = null;
    let error = null;

    if (adminClient) {
      const result = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          whatsapp,
          instagram: ig,
          birth_date,
          region,
          institution,
        },
      });
      data = result.data ? { user: result.data.user, session: null } : null;
      error = result.error;

      // auth.admin.createUser bypasses on_auth_user_created trigger — insert
      // public.users row manually so the rest of the app (record-login,
      // admin/users list, /api/auth/me) sees the new account.
      if (!error && result.data?.user?.id) {
        const { error: insertErr } = await adminClient
          .from("users")
          .insert({
            id: result.data.user.id,
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
        }
      }
    } else {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            whatsapp,
            instagram: ig,
            birth_date,
            region,
            institution,
          },
        },
      });
      data = result.data;
      error = result.error;
    }


    // Untuk admin.createUser, session=null di data → signInWithPassword akan kerja.
    let session = null;
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!signInErr && signInData?.session) {
      session = signInData.session;
    }

    const requiresConfirmation = !session;

    return NextResponse.json(
      {
        user: data?.user || null,
        session,
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