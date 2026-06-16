
import { useDashboardData } from "./hooks/useDashboardData";
import AlbumGrid from "./sections/AlbumGrid";
import Artistas from "./sections/Artistas";
import Generos from "./sections/Generos";
import {
  Genero,
  ArtistaUI,
  AlbumItem,
  BackendAlbumLike,
  WrappedBackendItem,
} from "./types";
import { buildArtistSources } from "./utils/images";

/* ============================================================================
   Type guards y helpers tipados (sin any)
============================================================================ */

/** Objeto no nulo */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** ¿Tiene la forma { json: BackendAlbumLike } ? */
function isWrappedBackendItem(value: unknown): value is WrappedBackendItem {
  return isObject(value) && "json" in value && isObject((value as any).json);
}

/** ¿Es BackendAlbumLike plano? (validamos claves mínimas) */
function isBackendAlbumLike(value: unknown): value is BackendAlbumLike {
  if (!isObject(value)) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.idAlbum === "number" &&
    typeof o.genero === "string" &&
    typeof o.artista === "string"
  );
}

/** ¿Es array de { json: BackendAlbumLike }? */
function isArrayOfWrapped(items: unknown): items is WrappedBackendItem[] {
  return Array.isArray(items) && items.every(isWrappedBackendItem);
}

/** ¿Es array de BackendAlbumLike plano? */
function isArrayOfBackendAlbumLike(items: unknown): items is BackendAlbumLike[] {
  return Array.isArray(items) && items.every(isBackendAlbumLike);
}

/** Extrae posible array desde { data } | { items } | { content } */
function extractArrayContainer(value: unknown): unknown[] | null {
  if (!isObject(value)) return null;
  const maybe =
    (value as any).data ??
    (value as any).items ??
    (value as any).content ??
    null;
  return Array.isArray(maybe) ? (maybe as unknown[]) : null;
}

/**
 * Normaliza cualquier respuesta a BackendAlbumLike[].
 * Soporta:
 * - Array de { json: {...} }
 * - Objeto { json: {...} } (un solo elemento)
 * - Array de objetos planos BackendAlbumLike
 * - Objeto con { data: [...] } | { items: [...] } | { content: [...] }
 */
function normalizeWrappedArray(input: unknown): BackendAlbumLike[] {
  if (input == null) return [];

  // 1) Array directo
  if (Array.isArray(input)) {
    if (isArrayOfWrapped(input)) {
      return input
        .map((w) => w.json)
        .filter(isBackendAlbumLike);
    }
    if (isArrayOfBackendAlbumLike(input)) {
      return input;
    }
    // Array desconocido: intentamos mapear a BackendAlbumLike si tienen forma compatible
    return (input as unknown[])
      .map((x) => (isWrappedBackendItem(x) ? x.json : x))
      .filter(isBackendAlbumLike);
  }

  // 2) Objeto singular { json: {...} }
  if (isWrappedBackendItem(input) && isBackendAlbumLike(input.json)) {
    return [input.json];
  }

  // 3) Contenedor { data: [...] } | { items: [...] } | { content: [...] }
  const inner = extractArrayContainer(input);
  if (inner) {
    return normalizeWrappedArray(inner); // reutiliza la lógica de array
  }

  // 4) Objeto plano único BackendAlbumLike
  if (isBackendAlbumLike(input)) {
    return [input];
  }

  // 5) Cualquier otra cosa: vacío
  return [];
}

/** Normaliza texto para claves (dedupe case-insensitive, trim) */
function norm(text: string) {
  return (text || "").trim().toLocaleLowerCase();
}

/** Deduplicación genérica por clave calculada */
function dedupeBy<T>(arr: T[], getKey: (item: T) => string): T[] {
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

/* ============================================================================
   Componente principal
============================================================================ */

export default function DashboardData({ userName }: { userName: string }) {
  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;

  const { generos, artistas, listas, novedades, loading } =
    useDashboardData(userName, token);

  if (loading) return <div className="loading-section" />;

  // ---------- Géneros ----------
  // El backend devuelve elementos estilo álbum envueltos; nos quedamos con el campo `genero`.
  const baseGeneros = normalizeWrappedArray(generos);
  const MAX_GENEROS = 12;

  const generosUI: Genero[] = dedupeBy(baseGeneros, (g) => norm(g.genero))
    .slice(0, MAX_GENEROS)
    .map((g) => ({ genero: g.genero }));

  // ---------- Artistas ----------
  // El backend trae { artista, cover... }, pero NO usamos cover (es del álbum).
  // Construimos la ruta de imagen en /public/assets/Artistas/{artista}.{ext}
  const baseArtistas = normalizeWrappedArray(artistas);
  const MAX_ARTISTAS = 15;

  const artistasUI: ArtistaUI[] = dedupeBy(baseArtistas, (a) => norm(a.artista))
    .slice(0, MAX_ARTISTAS)
    .map((a) => {
      const candidates = buildArtistSources(a.artista); // genera rutas candidatas (webp/jpg/jpeg/png + variantes)
      const first = candidates[0] || null;
      return { artista: a.artista, imagen: first };
    });

  // ---------- Listas (sin cambios) ----------
  const listasUI: AlbumItem[] = (listas || []).map((l) => ({
    titulo: l.nombre,
    artista: `${l.numeroCanciones} canciones`,
    cover: l.cover || l.caratula,
  }));

  // ---------- Novedades (sin cambios) ----------
  const novedadesUI: AlbumItem[] = (novedades || []).map((n) => ({
    titulo: n.titulo,
    artista: n.artista,
    cover: n.cover,
  }));

  return (
    <>
      <Generos items={generosUI} />
      <Artistas items={artistasUI} />
      <AlbumGrid title="Tus Listas" items={listasUI} />
      <AlbumGrid title="Novedades" items={novedadesUI} />
    </>
  );
}





