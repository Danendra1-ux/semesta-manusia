/**
 * Upload helper: file di-PUT langsung ke Supabase Storage via signed URL.
 *
 * Alasan: Vercel Serverless Functions memiliki body limit 4.5 MB. Kalau file
 * dikirim sebagai multipart/form-data lewat /api/upload-file, file besar akan
 * ditolak dengan 413. Solusinya: API route hanya mengembalikan signed upload
 * URL (payload kecil), lalu browser PUT file langsung ke Supabase.
 */

const BUCKET_FIELD_REGEX = /^[a-z0-9][a-z0-9-]*\.[a-z0-9]+$/i;

/**
 * Build a safe, randomized file name. Client-generated agar tidak ada 2 tab
 * browser yang tabrakan di nama yang sama persis.
 */
export function buildFileName(prefix, originalName) {
  const ext = (originalName?.split('.').pop() || 'bin').toLowerCase().slice(0, 8);
  const safeExt = /^[a-z0-9]+$/i.test(ext) ? ext : 'bin';
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}.${safeExt}`;
}

/**
 * Validate a candidate fileName against the policy enforced by the API
 * (no slashes, no path traversal, must have an extension).
 */
function assertValidFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('fileName harus berupa string');
  }
  if (fileName.includes('/') || fileName.includes('..') || fileName.startsWith('.')) {
    throw new Error(`fileName tidak valid: ${fileName}`);
  }
  if (!BUCKET_FIELD_REGEX.test(fileName)) {
    throw new Error(`fileName harus berekstensi (contoh: poster.png): ${fileName}`);
  }
}

/**
 * Upload a single file directly to Supabase Storage.
 *
 * @param {File|Blob} file - file object dari <input type="file"> atau drag-drop
 * @param {object} options
 * @param {string} options.bucket - "program-files" atau "program-images"
 * @param {string} options.fileName - nama file di storage (pakai buildFileName())
 * @param {string|null} options.accessToken - token user (opsional, default null)
 * @param {string|null} options.contentType - override contentType (default: file.type)
 * @returns {Promise<{url: string, fileName: string}>}
 */
export async function uploadFileDirect(file, options) {
  const { bucket, fileName, accessToken, contentType } = options;

  assertValidFileName(fileName);

  // 1. Minta signed upload URL dari API route (body kecil, JSON)
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const signedRes = await fetch('/api/upload-file', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fileName,
      bucket,
      contentType: contentType || file.type || 'application/octet-stream',
    }),
  });

  if (!signedRes.ok) {
    const err = await signedRes.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${signedRes.status}`);
  }

  const { signedUrl, publicUrl, contentType: returnedType } = await signedRes.json();

  // 2. Upload file LANGSUNG ke Supabase via signed URL — tidak melewati Vercel
  const putRes = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType || file.type || returnedType || 'application/octet-stream',
    },
    body: file,
  });

  if (!putRes.ok) {
    let detail = '';
    try {
      detail = (await putRes.json()).message || (await putRes.text());
    } catch {
      detail = putRes.statusText;
    }
    throw new Error(`Supabase upload gagal (${putRes.status}): ${detail}`);
  }

  return { url: publicUrl, fileName };
}
