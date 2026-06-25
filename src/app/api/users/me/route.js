import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * GET  /api/users/me  — returns the current user's public.users row.
 * PATCH /api/users/me — updates editable profile fields on public.users AND
 *                       mirrors them to auth.users.user_metadata so login
 *                       sessions stay consistent.
 *
 * Body fields (all optional, at least one required): name, whatsapp,
 * instagram, birth_date (YYYY-MM-DD or null), region, institution.
 */
export async function GET() {
  try {
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
    const { data: sessionData } = await ssrClient.auth.getUser();
    const authUser = sessionData?.user;
    if (!authUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: row, error } = await adminClient
      .from("users")
      .select(
        "id, email, name, role, avatar_url, is_active, whatsapp, instagram, birth_date, region, institution, created_at, last_login_at"
      )
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!row) {
      const meta = authUser.user_metadata || {};
      return NextResponse.json({
        id: authUser.id,
        email: authUser.email,
        name: meta.name || (authUser.email || "").split("@")[0],
        role: meta.role || "user",
        avatar_url: null,
        is_active: true,
        whatsapp: meta.whatsapp || null,
        instagram: meta.instagram || null,
        birth_date: meta.birth_date || null,
        region: meta.region || null,
        institution: meta.institution || null,
        created_at: authUser.created_at,
        last_login_at: authUser.last_sign_in_at,
      });
    }

    return NextResponse.json({ user: row });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
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
    const { data: sessionData } = await ssrClient.auth.getUser();
    const authUser = sessionData?.user;
    if (!authUser) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, whatsapp, instagram, birth_date, region, institution } = body || {};

    // Build the update payload with strict field whitelisting.
    const update = {};
    const metaUpdate = {};

    if (typeof name === "string") {
      const trimmed = name.trim();
      if (trimmed.length < 2) {
        return NextResponse.json(
          { error: "Nama minimal 2 karakter." },
          { status: 400 }
        );
      }
      if (trimmed.length > 200) {
        return NextResponse.json(
          { error: "Nama maksimal 200 karakter." },
          { status: 400 }
        );
      }
      update.name = trimmed;
      metaUpdate.name = trimmed;
    }

    if (typeof whatsapp === "string") {
      const trimmed = whatsapp.trim();
      if (trimmed && !/^[\d+\-\s()]{6,20}$/.test(trimmed)) {
        return NextResponse.json(
          { error: "Format WhatsApp tidak valid." },
          { status: 400 }
        );
      }
      update.whatsapp = trimmed || null;
      metaUpdate.whatsapp = trimmed || "";
    }

    if (typeof instagram === "string") {
      const trimmed = instagram.trim().replace(/^@/, "");
      if (trimmed && !/^[a-zA-Z0-9._]{1,30}$/.test(trimmed)) {
        return NextResponse.json(
          { error: "Format Instagram tidak valid." },
          { status: 400 }
        );
      }
      update.instagram = trimmed || null;
      metaUpdate.instagram = trimmed || "";
    }

    if (birth_date !== undefined) {
      if (birth_date === null || birth_date === "") {
        update.birth_date = null;
        metaUpdate.birth_date = "";
      } else {
        const d = new Date(birth_date);
        if (Number.isNaN(d.getTime())) {
          return NextResponse.json(
            { error: "Format tanggal lahir tidak valid." },
            { status: 400 }
          );
        }
        if (d > new Date()) {
          return NextResponse.json(
            { error: "Tanggal lahir tidak boleh di masa depan." },
            { status: 400 }
          );
        }
        const iso = d.toISOString().slice(0, 10);
        update.birth_date = iso;
        metaUpdate.birth_date = iso;
      }
    }

    if (typeof region === "string") {
      update.region = region.trim() || null;
      metaUpdate.region = region.trim();
    }

    if (typeof institution === "string") {
      update.institution = institution.trim() || null;
      metaUpdate.institution = institution.trim();
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada perubahan untuk disimpan." },
        { status: 400 }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // 1) Update public.users
    const { data: updated, error: updErr } = await adminClient
      .from("users")
      .update(update)
      .eq("id", authUser.id)
      .select(
        "id, email, name, role, avatar_url, is_active, whatsapp, instagram, birth_date, region, institution, created_at, last_login_at"
      )
      .single();

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    // 2) Mirror to auth.users.user_metadata so the cookie session stays fresh.
    // Skip on failure - the public.users update is the source of truth.
    if (Object.keys(metaUpdate).length > 0) {
      const merged = { ...(authUser.user_metadata || {}), ...metaUpdate };
      try {
        await adminClient.auth.admin.updateUserById(authUser.id, {
          user_metadata: merged,
        });
      } catch (e) {
        console.warn("Failed to mirror user_metadata:", e?.message || e);
      }
    }

    return NextResponse.json({ user: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}