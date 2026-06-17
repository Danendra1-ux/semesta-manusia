import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_EMAILS = ['admin@semestamanusia.id'];

export async function POST(request) {
  try {
    // 1. Ambil token dari Header Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verifikasi token menggunakan Supabase Admin
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token or user not found' }, { status: 401 });
    }

    // 3. Pengecekan Role (Fallback)
    const role = user.app_metadata?.role || user.user_metadata?.role;
    if (role !== 'admin' && !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: 'Unauthorized: User is not an admin' }, { status: 401 });
    }

    // 4. Proses Upload Form Data
    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = formData.get('bucket') || 'program-files';
    const filePathOverride = formData.get('filePath');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = filePathOverride || `program-file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Upload ke Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 6. Ambil Public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      fileName: fileName,
      originalName: file.name,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
