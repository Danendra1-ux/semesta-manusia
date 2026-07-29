import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getBucketClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export async function POST(request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Konfigurasi Supabase tidak ditemukan." },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const ssr = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });
    const { data: userData } = await ssr.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return NextResponse.json(
        { error: "Anda harus login untuk mengunggah file." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const fieldKey = formData.get("fieldKey");
    const programId = formData.get("programId");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }
    if (!fieldKey || !programId) {
      return NextResponse.json(
        { error: "Field key dan program id wajib diisi." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file melebihi 10 MB." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop().toLowerCase();
    const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "bin";
    const fileName = `${programId}-${Date.now()}-${fieldKey}.${safeExt}`;

    const buf = Buffer.from(await file.arrayBuffer());
    const supabase = getBucketClient();
    const { error: uploadError } = await supabase.storage
      .from("registration-files")
      .upload(fileName, buf, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Gagal upload ${fieldKey}: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("registration-files")
      .getPublicUrl(fileName);

    return NextResponse.json({
      field_key: fieldKey,
      file_url: publicUrlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan." },
      { status: 500 }
    );
  }
}