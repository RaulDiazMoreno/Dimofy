export const DEFAULT_ALBUM_IMAGE = "/assets/Cover/default.webp";
export const DEFAULT_ARTIST_IMAGE = "/assets/Artistas/default.webp";

export function normalizeImageFileName(value?: string | null): string {
  if (!value) return "";

  const clean = String(value).split("?")[0].split("#")[0];
  const fileName = clean.split("\\").pop()?.split("/").pop() ?? "";

  return fileName.replace(/\.(jpg|jpeg|png)$/i, ".webp");
}

export function getAlbumImage(cover?: string | null): string {
  if (cover && /^https?:\/\//i.test(cover.trim())) return cover.trim();
  const fileName = normalizeImageFileName(cover);
  return fileName ? `/assets/Cover/${fileName}` : DEFAULT_ALBUM_IMAGE;
}

export function getAlbumThumbnail(cover?: string | null): string {
  if (cover && /^https?:\/\//i.test(cover.trim())) return cover.trim();
  const fileName = normalizeImageFileName(cover);
  return fileName ? `/assets/Cover/thumbs/${fileName}` : DEFAULT_ALBUM_IMAGE;
}

export function getArtistThumbnail(foto?: string | null): string {
  if (foto && /^https?:\/\//i.test(foto.trim())) return foto.trim();
  const fileName = normalizeImageFileName(foto);
  return fileName ? `/assets/Artistas/thumbs/${fileName}` : DEFAULT_ARTIST_IMAGE;
}

export function getArtistImage(foto?: string | null): string {
  if (foto && /^https?:\/\//i.test(foto.trim())) return foto.trim();
  const fileName = normalizeImageFileName(foto);
  return fileName ? `/assets/Artistas/${fileName}` : DEFAULT_ARTIST_IMAGE;
}

export function imageFallback(
  event: React.SyntheticEvent<HTMLImageElement>,
  fallback: string
) {
  const img = event.currentTarget;
  if (img.dataset.fallbackApplied === "true") return;
  img.dataset.fallbackApplied = "true";
  img.src = fallback;
}

export function imageThumbnailFallback(
  event: React.SyntheticEvent<HTMLImageElement>,
  original: string,
  fallback: string
) {
  const img = event.currentTarget;
  const stage = img.dataset.thumbnailFallbackStage;

  if (!stage) {
    img.dataset.thumbnailFallbackStage = "original";
    img.src = encodeURI(original);
    return;
  }

  if (stage === "original") {
    img.dataset.thumbnailFallbackStage = "placeholder";
    img.src = fallback;
  }
}
