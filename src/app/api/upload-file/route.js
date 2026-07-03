import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_EMAILS = ['semestamanusia.indonesia@gmail.com'];

// Allowed buckets for admin uploads — keep tight to avoid abuse
const ALLOWED_BUCKETS = new Set(['program-files', 'program-images']);

/**
 * POST /api/upload-file
 *
 * Mode: SIGNED-URL bootstrap. Menghindari batasan body 4.5 MB Vercel dengan
 * mengembalikan signed upload URL ke client, sehingga file di-PUT langsung
 * ke Supabase Storage tanpa melewati Vercel function body.
 *
 * Body (JSON kecil, ~200 byte):
 *   { fileName: string, bucket: 'program-files' | 'program-images', contentType?: string }
 *
 * Response:
 *   { signedUrl, token, path, publicUrl }
 */
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

    // 4. Parse JSON body (bukan formData — file tidak ikut lewat Vercel)
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { fileName, bucket, contentType } = body || {};

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json({ error: 'Missing fileName' }, { status: 400 });
    }
    if (!bucket || !ALLOWED_BUCKETS.has(bucket)) {
      return NextResponse.json({ error: 'Invalid or unauthorized bucket' }, { status: 400 });
    }

    // Sanitize fileName: tidak boleh slash/path traversal. Client mengirim nama
    // file random seperti `program-file-<ts>-<rand>.<ext>` atau `poster-<ts>.<ext>`.
    if (fileName.includes('/') || fileName.includes('..') || fileName.startsWith('.')) {
      return NextResponse.json({ error: 'Invalid fileName' }, { status: 400 });
    }

    // 5. Buat signed upload URL (expired 5 menit — cukup untuk browser upload)
    const { data: signed, error: signedError } = await supabaseAdmin
      .storage
      .from(bucket)
      .createSignedUploadUrl(fileName);

    if (signedError || !signed) {
      return NextResponse.json(
        { error: signedError?.message || 'Failed to create signed upload URL' },
        { status: 500 }
      );
    }

    // 6. Ambil Public URL untuk dikembalikan ke client
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({
      signedUrl: signed.signedUrl,
      token: signed.token,
      path: fileName,
      publicUrl: publicUrlData.publicUrl,
      contentType: contentType || 'application/octet-stream',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
