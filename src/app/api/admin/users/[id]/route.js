import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getAdminSession } from "@/lib/adminAuth";
import { sendRemindAccountEmail } from "@/lib/email";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
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

    const { data: user, error } = await adminClient
      .from("users")
      .select(
        "id, email, name, role, is_active, whatsapp, instagram, birth_date, region, institution, created_at, last_login_at"
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    // Pull registration history for this user's email.
    const { data: registrations, error: regErr } = await adminClient
      .from("registrations")
      .select(
        "id, status, created_at, program_id, programs(id, title)"
      )
      .ilike("email", user.email || "")
      .order("created_at", { ascending: false });

    if (regErr) {
      return NextResponse.json({ error: regErr.message }, { status: 500 });
    }

    return NextResponse.json({ user, registrations: registrations || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
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

    // Block admins from modifying themselves to prevent lock-out.
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Tidak dapat mengubah akun sendiri." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { is_active, name } = body || {};

    const update = {};

    if (typeof name === "string") {
      const trimmed = name.trim();
      if (trimmed.length < 2) {
        return NextResponse.json(
          { error: "Nama minimal 2 karakter." },
          { status: 400 }
        );
      }
      update.name = trimmed;
    }

    if (is_active !== undefined) {
      update.is_active = Boolean(is_active);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada perubahan untuk disimpan." },
        { status: 400 }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await adminClient
      .from("users")
      .update(update)
      .eq("id", id)
      .select(
        "id, email, name, role, is_active, whatsapp, instagram, birth_date, region, institution, created_at, last_login_at"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
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

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus akun sendiri." },
        { status: 400 }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Confirm the user exists first.
    const { data: existing, error: lookupErr } = await adminClient
      .from("users")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (lookupErr) {
      return NextResponse.json({ error: lookupErr.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    // 1) Remove from public.users
    const { error: delErr } = await adminClient
      .from("users")
      .delete()
      .eq("id", id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    // 2) Remove from auth.users (best-effort). Skip on failure.
    try {
      await adminClient.auth.admin.deleteUser(id);
    } catch (e) {
      console.warn("Failed to delete auth user:", e?.message || e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users/[id] — send a reminder email to the user
 *
 * Body: { reason?: string }
 *
 * Sends an email instructing the user to log in within 24 hours or their
 * account will be deleted. The user data (name, email) is fetched from the
 * database, never trusted from the request body.
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
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

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Tidak dapat memperingatkan akun sendiri." },
        { status: 400 }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: user, error: lookupErr } = await adminClient
      .from("users")
      .select("id, email, name")
      .eq("id", id)
      .maybeSingle();

    if (lookupErr) {
      return NextResponse.json({ error: lookupErr.message }, { status: 500 });
    }
    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "Pengguna tidak memiliki email." },
        { status: 400 }
      );
    }

    let body = {};
    try {
      body = await request.json();
    } catch (_) {
      body = {};
    }
    const reason = typeof body?.reason === "string" ? body.reason.trim() : null;

    console.log(
      `[remind] Admin ${session.user.id} warned user ${user.id} (${user.email})` +
        (reason ? ` — reason: ${reason}` : "")
    );

    const emailResult = await sendRemindAccountEmail({
      to: user.email,
      name: user.name || "Pengguna",
      subject: "Konfirmasi Akun Anda Masih Digunakan — Semesta Manusia",
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          error: "Peringatan gagal dikirim.",
          detail: emailResult.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      emailSent: true,
      emailId: emailResult.id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}