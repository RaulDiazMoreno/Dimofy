// src/dashboard/hooks/useUserPlaylists.ts
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "../utils/fetcher";
import { ALBUM_PLACEHOLDER } from "../utils/images";
import {
  extractArrayContainer,
  isObject,
  isWrappedBackendItem,
} from "../utils/NormalizeHelpers";

export type UserPlaylist = {
  /** id de la playlist/lista (necesario para navegar a detalle) */
  id?: number | string;
  titulo: string;
  artista: string; // usamos este campo como subtítulo (p.ej. "10 canciones")
  cover: string;
};

function resolvePlaylistId(l: any): number | string | undefined {
  if (!l) return undefined;
  return (
    l.idLista ??
    l.idPlaylist ??
    l.idListaReproduccion ??
    l.id ??
    l.playlistId ??
    l.listaId ??
    l?.playlist?.id ??
    l?.playlist?.idPlaylist ??
    l?.lista?.id ??
    l?.lista?.idLista
  );
}

function normalizePlaylists(raw: any): UserPlaylist[] {
  const arr = (() => {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw;
    const inner = extractArrayContainer(raw);
    if (inner) return inner;
    if (isObject(raw)) return [raw];
    return [];
  })()
    .map((x: any) => (isWrappedBackendItem(x) ? x.json : x))
    .filter(Boolean);

  return arr.map((l: any) => {
    const id = resolvePlaylistId(l);

    const titulo =
      l.nombre ??
      l.titulo ??
      l.nombreLista ??
      l.nombrePlaylist ??
      l.playlist ??
      "Lista";

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
}

export function useUserPlaylists(userName: string, token?: string, all?: boolean) {
  const safeUser = (userName || "").trim();
  const enc = encodeURIComponent(safeUser);
  const base = "http://localhost:8080";

  return useQuery({
    queryKey: ["playlists", safeUser, all ? "all" : "preview"],
    enabled: Boolean(safeUser),
    queryFn: ({ signal }) =>
      fetchJson<any>(
        `${base}/app/dashboard/recomendaciones/listas?userName=${enc}${
          all ? "&all=true" : ""
        }`,
        token,
        signal
      ),
    staleTime: 60_000,
    select: (raw) => normalizePlaylists(raw),
  });
}
