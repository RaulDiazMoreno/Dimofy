
/* ============================================================================
   NORMALIZATION HELPERS
   - Limpian y unifican datos del backend
   - Se usan por el adapter del dashboard
   - Sin dependencias externas
============================================================================ */

/** Comprueba si algo es un objeto no nulo */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/* -------------------------------------------------------
   BACKEND TYPES (pero sin importar los tuyos directamente)
   Para evitar dependencias circulares en el adapter
--------------------------------------------------------- */
export interface BackendAlbumLike {
  idAlbum: number;
  genero: string;
  artista: string;
  cover?: string;
  titulo?: string;
  anyo?: string;
}

export interface WrappedBackendItem {
  json: BackendAlbumLike;
}

/* ============================================================================
   TYPE GUARDS
============================================================================ */

/** Determina si un valor es { json: BackendAlbumLike } */
export function isWrappedBackendItem(value: unknown): value is WrappedBackendItem {
  return isObject(value) && "json" in value && isObject((value as any).json);
}

/** Determina si un valor es un BackendAlbumLike plano */
export function isBackendAlbumLike(value: unknown): value is BackendAlbumLike {
  if (!isObject(value)) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.idAlbum === "number" &&
    typeof o.genero === "string" &&
    typeof o.artista === "string"
  );
}

/* ============================================================================
   VALIDADORES DE ARRAYS
============================================================================ */

/** Array de { json: {...} } */
export function isArrayOfWrapped(items: unknown): items is WrappedBackendItem[] {
  return Array.isArray(items) && items.every(isWrappedBackendItem);
}

/** Array de BackendAlbumLike plano */
export function isArrayOfBackendAlbumLike(items: unknown): items is BackendAlbumLike[] {
  return Array.isArray(items) && items.every(isBackendAlbumLike);
}

/* ============================================================================
   EXTRACTOR DE CONTENEDORES { data: [...] } | { items: [...] } | { content: [...] }
============================================================================ */

export function extractArrayContainer(value: unknown): unknown[] | null {
  if (!isObject(value)) return null;
  const maybe =
    (value as any).data ??
    (value as any).items ??
    (value as any).content ??
    null;

  return Array.isArray(maybe) ? (maybe as unknown[]) : null;
}

/* ============================================================================
   NORMALIZADOR PRINCIPAL
   - Puedes pasarle lo que sea y devolverá BackendAlbumLike[]
============================================================================ */

export function normalizeWrappedArray(input: unknown): BackendAlbumLike[] {
  if (input == null) return [];

  // 1) Si ya es array
  if (Array.isArray(input)) {
    // Array de { json: {...} }
    if (isArrayOfWrapped(input)) {
      return input
        .map((w) => w.json)
        .filter(isBackendAlbumLike);
    }

    // Array plano válido
    if (isArrayOfBackendAlbumLike(input)) {
      return input;
    }

    // Array mixto o desconocido → intentar mapear
    return (input as unknown[])
      .map((x) => (isWrappedBackendItem(x) ? x.json : x))
      .filter(isBackendAlbumLike);
  }

  // 2) Objeto singular { json: {...} }
  if (isWrappedBackendItem(input) && isBackendAlbumLike(input.json)) {
    return [input.json];
  }

  // 3) Contenedor { data: [...] } o similares
  const inner = extractArrayContainer(input);
  if (inner) return normalizeWrappedArray(inner);

  // 4) Objeto plano único BackendAlbumLike
  if (isBackendAlbumLike(input)) return [input];

  // 5) Nada válido
  return [];
}

/* ============================================================================
   UTILIDADES PARA CLAVES & DEDUPLICACIÓN
============================================================================ */

/** Normaliza texto: lower-case + trim */
export function norm(text: string) {
  return (text || "").trim().toLocaleLowerCase();
}

/** Deduplicación genérica */
export function dedupeBy<T>(arr: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of arr) {
    const k = getKey(it);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(it);
    }
  }
  return out;
}
