/**
 * Optimise une URL d'image selon sa source (Cloudinary, Unsplash, ou autre).
 * @param {string} url - URL originale de l'image
 * @param {object} options - { width, quality }
 */
export function optimizeImage(url, { width = 800, quality = 75 } = {}) {
  if (!url) return url;

  // ─── Cloudinary ─────────────────────────────────────────────
  // Format typique : https://res.cloudinary.com/<cloud>/image/upload/v123/xxx.jpg
  // On insère les transformations juste après "/upload/"
  if (url.includes('res.cloudinary.com')) {
    const transform = `f_auto,q_auto:${quality >= 80 ? 'good' : 'eco'},w_${width},c_limit`;
    return url.replace('/upload/', `/upload/${transform}/`);
  }

  // ─── Unsplash ───────────────────────────────────────────────
  if (url.includes('images.unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=${quality}&auto=format&fit=crop`;
  }

  // ─── Autre source (fallback, ne rien changer) ──────────────
  return url;
}