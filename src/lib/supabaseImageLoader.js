// Supabase Image Transformation Loader for Next.js
// Docs: https://supabase.com/docs/guides/storage/image-transformations#nextjs-loader
export default function supabaseLoader({ src, width, quality }) {
  let imageUrl;
  if (typeof src === 'object' && src !== null && 'url' in src) {
    imageUrl = src.url;
  } else {
    imageUrl = src;
  }

  // Only transform absolute URLs that point to Supabase storage
  // Pass through all other URLs (internal paths, relative paths, etc.) unchanged
  try {
    const url = new URL(imageUrl);
    if (!url.hostname.includes('supabase.co')) {
      return imageUrl;
    }
    url.searchParams.set('width', width.toString());
    url.searchParams.set('quality', (quality || 75).toString());
    return url.href;
  } catch {
    return imageUrl;
  }
}
