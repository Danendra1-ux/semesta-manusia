import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseAnonKey } from "@/lib/supabaseKeys";

/**
 * GET  /api/reviews?is_published=true    Public: only published reviews (for landingpage)
 *      /api/reviews?is_published=false   Auth: own unpublished reviews (for /user/reviews page)
 *
 * POST /api/reviews                       Auth required: submit a new review (always is_published=false).
 */

const MAX_CONTENT = 2000;
const MIN_CONTENT = 10;
const MIN_NAME = 2;

function mapInsertError(err) {
  if (!err) return "Gagal menyimpan ulasan.";
  const msg = err.message || "";
  if (msg.includes("reviews_rating_check")) {
    return "Rating harus bernilai antara 1 sampai 5.";
  }
  if (msg.includes("reviews_content_length")) {
    return "Ulasan terlalu panjang (maksimal 2000 karakter).";
  }
  return msg;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wantPublishedOnly = searchParams.get("is_published") !== "false";
    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10) || 12, 50);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Konfigurasi Supabase tidak ditemukan." },
        { status: 500 }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    let query = adminClient
      .from("reviews")
      .select("id, name, institution, program_title, rating, content, is_published, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (wantPublishedOnly) {
      query = query.eq("is_published", true);
    } else {
      // Own unpublished: requires session, filter by user_id.
      const cookieStore = await cookies();
      const ssrClient = createServerClient(
        supabaseUrl,
        getSupabaseAnonKey(),
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {},
          },
        }
      );
      const { data: sessionData } = await ssrClient.auth.getUser();
      const authUser = sessionData?.user;
      if (!authUser) {
        return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
      }
      query = query.eq("user_id", authUser.id);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const reviews = (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      program_title: row.program_title,
      rating: row.rating,
      content: row.content,
      is_published: row.is_published,
      created_at: row.created_at,
      institution: row.institution || null,
    }));

    return NextResponse.json({ reviews });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}

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
    if (!authUser) {
      return NextResponse.json(
        { error: "Kamu harus login terlebih dahulu untuk memberi ulasan." },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
    }

    const name = (body?.name || "").trim();
    const institution = (body?.institution || "").trim() || null;
    const programTitle = (body?.program_title || "").trim();
    const content = (body?.content || "").trim();
    const ratingRaw = body?.rating;

    if (name.length < MIN_NAME) {
      return NextResponse.json(
        { error: `Nama minimal ${MIN_NAME} karakter.` },
        { status: 400 }
      );
    }
    if (institution && institution.length > 200) {
      return NextResponse.json(
        { error: "Instansi maksimal 200 karakter." },
        { status: 400 }
      );
    }
    if (!programTitle) {
      return NextResponse.json(
        { error: "Nama program wajib dipilih." },
        { status: 400 }
      );
    }
    if (content.length < MIN_CONTENT) {
      return NextResponse.json(
        { error: `Ulasan minimal ${MIN_CONTENT} karakter.` },
        { status: 400 }
      );
    }
    if (content.length > MAX_CONTENT) {
      return NextResponse.json(
        { error: `Ulasan maksimal ${MAX_CONTENT} karakter.` },
        { status: 400 }
      );
    }
    const rating = Number(ratingRaw);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating harus bernilai antara 1 sampai 5." },
        { status: 400 }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await adminClient
      .from("reviews")
      .insert({
        user_id: authUser.id,
        name,
        institution: institution,
        program_title: programTitle,
        rating,
        content,
        is_published: false,
      })
      .select("id, name, institution, program_title, rating, content, is_published, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: mapInsertError(error) }, { status: 400 });
    }

    return NextResponse.json({ review: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}