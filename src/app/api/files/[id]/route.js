import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);

    // Look up the file record from registration_files
    const { data: fileRecord, error: fetchError } = await supabase
      .from('registration_files')
      .select('id, file_url, file_name, file_size, mime_type')
      .eq('id', numericId)
      .single();

    if (fetchError || !fileRecord) {
      console.error('[Proxy] Lookup error for id=' + id, fetchError?.message || 'record not found');
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    console.log('[Proxy] file_record:', JSON.stringify({ file_url: fileRecord.file_url, file_name: fileRecord.file_name }));

    // Parse the stored file_url to extract bucket and path
    // URL format: https://hzzquqbbjormybsfmutd.supabase.co/storage/v1/object/public/registration-files/abc123.pdf
    let fullPath = fileRecord.file_url;
    const idx = fullPath.indexOf('/storage/v1/object/');
    if (idx === -1) {
      return NextResponse.json({ error: 'Invalid file_url format in database' }, { status: 500 });
    }

    let afterObject = fullPath.slice(idx + '/storage/v1/object/'.length);

    // Strip 'public/' or 'signed/' prefix
    if (afterObject.startsWith('public/')) {
      afterObject = afterObject.slice('public/'.length);
    } else if (afterObject.startsWith('signed/')) {
      afterObject = afterObject.slice('signed/'.length);
    }

    const slashIdx = afterObject.indexOf('/');
    if (slashIdx === -1) {
      return NextResponse.json({ error: 'Could not parse bucket name from URL' }, { status: 500 });
    }

    const bucket = afterObject.slice(0, slashIdx);
    const filePath = afterObject.slice(slashIdx + 1);

    if (!bucket || !filePath) {
      return NextResponse.json({ error: 'Empty bucket or filePath' }, { status: 500 });
    }

    console.log('[Proxy] bucket=', bucket, ' filePath=', filePath);

    // Download via service role (works for public & private buckets)
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (downloadError) {
      console.error('[Proxy] Supabase download error:', JSON.stringify(downloadError));
      return NextResponse.json({ error: 'Failed to download file from storage' }, { status: 500 });
    }

    if (!fileData) {
      console.error('[Proxy] No data returned from download');
      return NextResponse.json({ error: 'No file data' }, { status: 500 });
    }

    console.log('[Proxy] download success, type=', fileData.constructor?.name);

    // Convert Blob to Buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('[Proxy] Buffer size=', buffer.byteLength);

    return new NextResponse(
      buffer,
      {
        status: 200,
        headers: {
          'Content-Type': fileRecord.mime_type || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${fileRecord.file_name}"`,
          'Content-Length': buffer.byteLength.toString(),
        },
      },
    );
  } catch (error) {
    console.error('[Proxy] Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
