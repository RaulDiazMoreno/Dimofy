
// src/dashboard/adapters/dashboardAdapter.ts
import {
  normalizeWrappedArray,
  dedupeBy,
  norm,
  extractArrayContainer,
  isObject,
  isWrappedBackendItem,
} from "../utils/NormalizeHelpers";
import { ALBUM_PLACEHOLDER, ARTIST_PLACEHOLDER } from "../utils/images";
import { getArtistImage } from "../../utils/imagePaths";

export function adaptDashboardData(raw) {
  // Si el backend devuelve géneros "globales", intentamos derivar los géneros
  // del usuario a partir de los datos que sí dependen del usuario (novedades,
  // artistas, listas). Esto es defensivo porque el backend a veces cambia el shape.
  const extractGenreName = (v: any): string => {
    if (!v) return "";
    if (typeof v === "string") return v.trim();
    if (typeof v === "number") return String(v);
    if (typeof v === "object") {
      return (
        v.nombre ??
        v.name ??
        v.genero ??
        v.genre ??
        ""
      ).toString().trim();
    }
    return "";
  };

  const userGenreSet = (() => {
    const s = new Set<string>();

    const novedadesArr = Array.isArray(raw?.novedades) ? raw.novedades : [];
    for (const n of novedadesArr) {
      const g =
        extractGenreName(n?.genero) ||
        extractGenreName(n?.genre) ||
        extractGenreName(n?.nombreGenero) ||
        extractGenreName(n?.generoMusical) ||
        extractGenreName(n?.album?.genero) ||
        extractGenreName(n?.album?.genre);
      if (g) s.add(norm(g));
    }

    const artistasArr = Array.isArray(raw?.artistas) ? raw.artistas : [];
    for (const a of artistasArr) {
      const g =
        extractGenreName(a?.genero) ||
        extractGenreName(a?.genre) ||
        extractGenreName(a?.nombreGenero);
      if (g) s.add(norm(g));
    }

    const listasArr = Array.isArray(raw?.listas) ? raw.listas : [];
    for (const l of listasArr) {
      const g =
        extractGenreName(l?.genero) ||
        extractGenreName(l?.genre) ||
        extractGenreName(l?.nombreGenero);
      if (g) s.add(norm(g));
    }

    return s;
  })();

  // GENEROS
  const baseGenres = normalizeWrappedArray(raw.generos);
  const dedupedGenres = dedupeBy(baseGenres, (g) => norm(g.genero));
  // Si conseguimos inferir géneros del usuario, filtramos.
  // Si no, pero el backend ya devuelve una lista pequeña, asumimos que ya son del usuario.
  // (evita dejar "Tus Géneros" vacío en backends que no incluyen género en novedades/artistas).
  const filteredGenres = (() => {
    // Si el backend devuelve TODOS los géneros de la app (globales), suele ser una lista grande.
    // En ese caso, intentamos quedarnos SOLO con los géneros asociados al usuario (inferidos).
    const looksGlobal = dedupedGenres.length > 20;

    if (looksGlobal) {
      return userGenreSet.size > 0
        ? dedupedGenres.filter((g) => userGenreSet.has(norm(g.genero)))
        : [];
    }

    // Si no parece global (lista pequeña), asumimos que ya viene filtrada por usuario
    // (p.ej. top del usuario o lista de usuario).
    return dedupedGenres;
  })();

  const generos =
 filteredGenres.map((g) => ({ genero: g.genero }));

  // ARTISTAS
  // Formato nuevo recomendado: { idArtista, nombre, foto }.
  // También mantenemos compatibilidad con el formato antiguo basado en AlbumDTO.
  const artistasRaw = (() => {
    const v = raw.artistas;
    if (v == null) return [];
    if (Array.isArray(v)) return v;
    const inner = extractArrayContainer(v);
    if (inner) return inner;
    if (isObject(v)) return [v];
    return [];
  })()
    .map((x: any) => (isWrappedBackendItem(x) ? x.json : x))
    .filter(Boolean);

  const artistas = dedupeBy(
    artistasRaw
      .map((a: any) => {
        const nombre = String(a?.nombre ?? a?.artista ?? "").trim();
        if (!nombre) return null;
        const foto = a?.foto ?? a?.fotoArtista ?? null;
        return {
          idArtista: a?.idArtista ?? a?.id ?? null,
          artista: nombre,
          // Una sola URL determinista. Si BBDD no tiene foto, usamos Nombre.webp.
          imagen: getArtistImage(foto || `${nombre}.webp`),
        };
      })
      .filter(Boolean),
    (a: any) => norm(a.artista)
  );

  // PLAYLISTS
  // El backend de listas no comparte el mismo shape que AlbumDTO.
  // Puede venir como array, objeto único, contenedor {data/items/content}, o envuelto {json:{...}}.
  const listasRaw = (() => {
    const v = raw.listas;
    if (v == null) return [];
    if (Array.isArray(v)) return v;
    const inner = extractArrayContainer(v);
    if (inner) return inner;
    if (isObject(v)) return [v];
    return [];
  })()
    .map((x: any) => (isWrappedBackendItem(x) ? x.json : x))
    .filter(Boolean);

  const listas = listasRaw.map((l: any) => {
    const id =
      l.idLista ??
      l.idPlaylist ??
      l.idListaReproduccion ??
      l.id ??
      l.playlistId ??
      l.listaId ??
      l?.playlist?.id ??
      l?.playlist?.idPlaylist ??
      l?.lista?.id ??
      l?.lista?.idLista ??
      null;
    const titulo =
      l.nombre ??
      l.titulo ??
      l.nombreLista ??
      l.nombrePlaylist ??
      l.playlist ??
      "";

    const num =
      l.numeroCanciones ??
      l.numCanciones ??
      l.totalCanciones ??
      (Array.isArray(l.canciones) ? l.canciones.length : undefined) ??
      (Array.isArray(l.tracks) ? l.tracks.length : undefined) ??
      0;

    const cover =
      l.cover ??
      l.caratula ??
      l.portada ??
      l.imagen ??
      l.image ??
      null;

    return {
      id,
      titulo: String(titulo || "Lista"),
      artista: `${Number(num) || 0} canciones`,
      cover: cover || ALBUM_PLACEHOLDER,
    };
  });

  // NOVEDADES
  const novedades = (raw.novedades ?? []).map((n) => ({
    // El backend suele exponer el id como idAlbum, pero a veces cambia el nombre.
    idAlbum:
      n.idAlbum ??
      n.id ??
      n.albumId ??
      n.id_album ??
      n.album?.idAlbum ??
      n.album?.id ??
      null,
    titulo: n.titulo,
    artista: n.artista,
    cover: n.cover,
    genero: n.genero ?? n.genre ?? null,
    // El backend a veces expone el año con distintas claves
    anio: n.anio ?? n.año ?? n.year ?? null,
  }));

  return { generos, artistas, listas, novedades };
}
