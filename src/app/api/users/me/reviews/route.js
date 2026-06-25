import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * GET /api/users/me/reviews
 *
 * Returns all reviews submitted by the current user (any publish status),
 * ordered by created_at desc. Used by /user/reviews to show what the user
 * has already submitted.
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
      return NextResponse.json({ reviews: [] }, { status: 401 });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await adminClient
      .from("reviews")
      .select("id, name, program_title, rating, content, is_published, created_at")
      .eq("user_id", authUser.id)
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