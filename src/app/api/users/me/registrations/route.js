import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * GET /api/users/me/registrations
 *
 * Returns all program registrations tied to the current user's email.
 * Since registrations don't have a user_id FK, we link by email.
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
      return NextResponse.json({ registrations: [] }, { status: 401 });
    }

    const email = (authUser.email || "").toLowerCase();
    if (!email) {
      return NextResponse.json({ registrations: [] });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await adminClient
      .from("registrations")
      .select(
        "id, registration_code, status, registered_at, email, funding_type_id, program_id, programs!inner(id, title, slug, category, image_url, event_start_date, event_end_date), program_funding_types(code, label)"
      )
      .ilike("email", email)
      .order("registered_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const registrations = (data || []).map((r) => {
      const programCategory = r.programs?.category;
      const fundingCode = r.program_funding_types?.code;
      const fundingLabel = r.program_funding_types?.label;
      return {
        id: r.id,
        registration_code: r.registration_code,
        status: r.status,
        status_label: r.status,
        title: r.programs?.title || null,
        program_title: r.programs?.title || null,
        program_banner: r.programs?.image_url || null,
        program_start: r.programs?.event_start_date || null,
        program_end: r.programs?.event_end_date || null,
        registered_at: r.registered_at,
        program_category: programCategory,
        funding_type_code: fundingCode || null,
        funding_type_label: fundingLabel || null,
      };
    });

    return NextResponse.json({ registrations });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}