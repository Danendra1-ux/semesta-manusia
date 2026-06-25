import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getAdminSession } from "@/lib/adminAuth";

/**
 * GET    /api/admin/reviews             Admin only: list ALL reviews (published + unpublished)
 * PATCH  /api/admin/reviews             Admin only: toggle is_published on a review
 *   body: { id: string, is_published: boolean }
 * DELETE /api/admin/reviews?id={id}     Admin only: delete a review
 */

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return {
      error: NextResponse.json(
        { error: "Konfigurasi Supabase tidak ditemukan." },
        { status: 500 }
      ),
    };
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
    return {
      error: NextResponse.json({ error: "Akses ditolak." }, { status: 403 }),
    };
  }

  return { adminClient: createClient(supabaseUrl, supabaseServiceKey) };
}

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const { data, error } = await guard.adminClient
      .from("reviews")
      .select(
        "id, user_id, name, program_title, rating, content, is_published, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ reviews: data || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
    }

    const id = (body?.id || "").toString();
    if (!id) {
      return NextResponse.json(
        { error: "ID ulasan wajib diisi." },
        { status: 400 }
      );
    }
    if (typeof body?.is_published !== "boolean") {
      return NextResponse.json(
        { error: "is_published harus boolean." },
        { status: 400 }
      );
    }

    const { data, error } = await guard.adminClient
      .from("reviews")
      .update({ is_published: body.is_published })
      .eq("id", id)
      .select(
        "id, user_id, name, program_title, rating, content, is_published, created_at"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ review: data });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const { searchParams } = new URL(request.url);
    const id = (searchParams.get("id") || "").toString();
    if (!id) {
      return NextResponse.json(
        { error: "ID ulasan wajib diisi." },
        { status: 400 }
      );
    }

    const { error } = await guard.adminClient
      .from("reviews")
      .delete()
      .eq("id", id);

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