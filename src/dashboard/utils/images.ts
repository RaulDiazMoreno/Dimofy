
// src/dashboard/utils/images.ts

/* ============================================================================
   Placeholders
============================================================================ */
export const ALBUM_PLACEHOLDER = "/images/album-placeholder.png";
export const ARTIST_PLACEHOLDER = "/images/artist-placeholder.png";
export const GENRE_ICON_PLACEHOLDER = "/images/genre-placeholder.png";

/* ============================================================================
   Fallbacks de imagen
============================================================================ */
export function handleImageFallback(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string
) {
  const img = e.currentTarget;
  if (img.dataset.fallbackDone) return;
  img.src = fallback;
  img.dataset.fallbackDone = "true";
}

/**
 * Rota entre candidatos (cambiando src). Si se agotan, usa placeholder.
 * Incluye un pequeño truco de cache-busting para evitar que un 404 quede cacheado.
 */
export function tryImageCandidates(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  candidates: string[],
  placeholder: string
) {
  const img = e.currentTarget;
  const idx = Number(img.getAttribute("data-src-idx") || "0");
  const nextIdx = idx + 1;

  if (nextIdx < candidates.length) {
    img.setAttribute("data-src-idx", String(nextIdx));
    // cache-busting opcional por si el navegador cacheó un 404
    const nextSrc = candidates[nextIdx];
    const withNoCache =
      nextSrc.indexOf("?") === -1 ? `${nextSrc}?v=${Date.now()}` : nextSrc;
    img.src = withNoCache;
  } else {
    img.src = placeholder;
  }
}

/** Alias opcional por compatibilidad previa */
export const tryArtistSources = tryImageCandidates;

/* ============================================================================
   Saneado de nombres (sin regex de control chars: OK para ESLint)
============================================================================ */
export function sanitizeForPath(
  name: string,
  opts: {
    removeDiacritics?: boolean;
    toLowerCase?: boolean;
    trim?: boolean;
  } = { removeDiacritics: true, toLowerCase: true, trim: true }
): string {
  const { removeDiacritics = true, toLowerCase = true, trim = true } = opts;

  let out = String(name ?? "");
  if (trim) out = out.trim();

  // invalid FS chars
  const invalidSet = new Set(['<', '>', ':', '"', '/', '\\', '|', '?', '*']);
  out = Array.from(out).filter((ch) => !invalidSet.has(ch)).join("");

  // remove control chars
  out = Array.from(out).filter((ch) => ch.charCodeAt(0) >= 0x20).join("");

  // collapse spaces
  out = out.replace(/ {2,}/g, " ");

  if (removeDiacritics) {
    out = out.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  if (toLowerCase) out = out.toLowerCase();

  return out;
}

/* ============================================================================
   ARTISTAS (por si lo necesitas aquí también)
============================================================================ */
export function buildArtistSources(artistName: string): string[] {
  const baseDir = "/assets/Artistas";
  const original = String(artistName ?? "");
  const noDiacriticsPreservingCase = original
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const lower = original.toLowerCase();
  const lowerNoSpaces = lower.replace(/\s+/g, "");
  const lowerUnderscore = lower.replace(/\s+/g, "_");

  const nameVariants = [
    original,                    // "U2" / "3 Doors Down" / "Beyoncé"
    noDiacriticsPreservingCase,  // "Beyonce"
    lower,
    lowerNoSpaces,
    lowerUnderscore,
  ].filter((v, i, arr) => v && arr.indexOf(v) === i);

  const exts = ["webp", "jpg", "jpeg", "png"];

  const candidates: string[] = [];
  for (const v of nameVariants) {
    for (const ext of exts) {
      candidates.push(`${baseDir}/${v}.${ext}`);
    }
  }
  return candidates;
}

/* ============================================================================
   GÉNEROS
   - Ruta: /assets/Iconos/<nombregenero>.png
   - Intentamos PRIMERO el nombre EXACTO tal como llega del backend.
   - Después, variantes: minúsculas, sin espacios, con guiones bajos, sin acentos.
============================================================================ */
export function buildGenreIconSources(genreName: string): string[] {
  const baseDir = "/assets/Iconos";
  const original = String(genreName ?? ""); // ej. "ALTERNATIVE", "HIP HOP"

  const lower = original.toLowerCase();
  const lowerNoSpaces = lower.replace(/\s+/g, "");
  const lowerUnderscore = lower.replace(/\s+/g, "_");
  const lowerNoDiacritics = sanitizeForPath(original, {
    removeDiacritics: true,
    toLowerCase: true,
    trim: true,
  });

  const variantsInOrder = [
    original,           // EXACTO primero (por si el archivo es "ALTERNATIVE.png")
    lower,              // "alternative"
    lowerNoSpaces,      // "hiphop"
    lowerUnderscore,    // "hip_hop"
    lowerNoDiacritics,  // "musica urbana"
  ];

  // dedupe preservando orden
  const seen = new Set<string>();
  const unique = variantsInOrder.filter((v) => {
    const keep = !!v && !seen.has(v);
    if (keep) seen.add(v);
    return keep;
  });

  // Solo .png como pediste
  return unique.map((v) => `${baseDir}/${v}.png`);
}


// src/dashboard/utils/images.ts


/* ============================================================================
   Colores para tarjetas de GÉNERO (gradiente estable por género)
   - Genera un gradiente HSL según un hash -> prácticamente único por género
============================================================================ */

/** Hash estable -> hue 0..359 */
function hashToHue(s: string): number {
  let h = 0;
  const str = (s || "").trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 360;
}

/** Devuelve el background para la tarjeta del género */
export function getGenreBackground(genreName: string): string {
  const hue = hashToHue(genreName);
  const hue2 = (hue + 32) % 360;

  return `linear-gradient(135deg,
    hsl(${hue} 75% 38%),
    hsl(${hue2} 80% 52%)
  )`;
}







