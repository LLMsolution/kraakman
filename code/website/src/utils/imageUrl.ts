/**
 * Convert Supabase Storage URL to use image transforms for optimized loading.
 * Falls back to original URL for non-Supabase images.
 */
export function optimizedImageUrl(url: string, width = 800): string {
  if (!url.includes('supabase.co/storage/v1/object/public/')) return url;
  return url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  ) + `?width=${width}&resize=contain&quality=75`;
}

/** Small thumbnail for card grids (max 600px wide) */
export function thumbnailUrl(url: string): string {
  return optimizedImageUrl(url, 600);
}

/** Medium image for detail page gallery (max 1200px wide) */
export function galleryUrl(url: string): string {
  return optimizedImageUrl(url, 1200);
}

/** Full-size lightbox image (max 1920px wide) */
export function lightboxUrl(url: string): string {
  return optimizedImageUrl(url, 1920);
}
