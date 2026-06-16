// src/dashboard/pages/GenreAlbums.tsx
// Página: álbumes por género (por idGenero) con el mismo layout/estilo que "Novedades" (PopularAlbumsPage).

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "../common.css";
import "../popularAlbums.css";
import { fetchJson } from "../utils/fetcher";
import { ALBUM_PLACEHOLDER, handleImageFallback } from "../utils/images";
import { BackendAlbumLike } from "../types";

/* ============================================================================
   Normalización defensiva (por si el backend cambia el shape)
============================================================================ */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBackendAlbumLike(value: unknown): value is BackendAlbumLike {
  if (!isObject(value)) return false;
  // mínimo
  return typeof (value as any).idAlbum === "number";
}

function normalizeAlbumArray(input: unknown): BackendAlbumLike[] {
  if (!input) return [];

  // 1) array directo
  if (Array.isArray(input)) return input.filter(isBackendAlbumLike);

  // 2) objeto único
  if (isBackendAlbumLike(input)) return [input];

  // 3) contenedor { data | items | content }
  if (isObject(input)) {
    const maybe = (input as any).data ?? (input as any).items ?? (input as any).content;
    if (Array.isArray(maybe)) return maybe.filter(isBackendAlbumLike);
  }

  return [];
}

function resolveAlbumId(n: {
  idAlbum?: number | string | null;
  id?: number | string | null;
  albumId?: number | string | null;
  id_album?: number | string | null;
  album?: { idAlbum?: number | string | null; id?: number | string | null } | null;
}): string | number | null {
  const v =
    n?.idAlbum ??
    n?.id ??
    n?.albumId ??
    (n as any)?.id_album ??
    n?.album?.idAlbum ??
    n?.album?.id ??
    null;

  if (v === 0 || v === "0") return 0;
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).trim();
  return s ? s : null;
}

export default function GenreAlbums() {
  const params = useParams<{ idGenero?: string; genre?: string }>();
  const idGenero = params.idGenero ?? params.genre ?? "";
  const navigate = useNavigate();

  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;
  const base = "http://localhost:8080";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["genre-albums", idGenero],
    enabled: Boolean(idGenero),
    queryFn: ({ signal }) =>
      fetchJson(`${base}/app/albums/genero/${encodeURIComponent(idGenero)}`, token, signal),
    staleTime: 60_000,
  });

  const albums = useMemo(() => normalizeAlbumArray(data), [data]);
  const generoNombre = albums?.[0]?.genero || "";

  const goBack = () => {
    // Requisito: siempre volver a Home (evita volver a /generos si venías desde allí)
    // Si algún día quieres respetar el origen, puedes leer (location.state as any)?.from.
    navigate("/home");
  };

  if (isLoading) return <div className="dash-loading" />;

  if (isError) {
    return (
      <main className="dash-new">
        <div className="sec-head" style={{ marginTop: 6 }}>
          <h2 className="sec-title">Álbumes por género</h2>
          <button className="sec-more" onClick={goBack} type="button">
            Volver
          </button>
        </div>
        <p style={{ color: "#cbd5e1" }}>Error cargando álbumes del género.</p>
      </main>
    );
  }

  return (
    <main className="dash-new popular-albums-page">
      <div className="sec-head" style={{ marginTop: 6 }}>
        <h2 className="sec-title">
          {generoNombre ? `Álbumes de ${generoNombre}` : "Álbumes"}
          {albums.length ? ` (${albums.length})` : ""}
        </h2>

        <button className="sec-more" onClick={goBack} type="button">
          Volver
        </button>
      </div>

      {albums.length === 0 ? (
        <p style={{ color: "#cbd5e1" }}>No se encontraron álbumes para este género.</p>
      ) : (
        <>
          <div className="popular-albums-grid popular-albums-grid--all">
            {albums.map((a, i) => (
              <button
                key={`${a.idAlbum}-${i}`}
                className="popular-album"
                type="button"
                disabled={!resolveAlbumId(a)}
                onClick={() => {
                  const albumId = resolveAlbumId(a);
                  if (albumId) navigate(`/albums/${encodeURIComponent(albumId)}`);
                }}
                aria-label={a.titulo ? `Ver álbum: ${a.titulo}` : "Ver álbum"}
              >
                <div className="popular-album-coverWrap">
                  <img
                    src={a.cover ? encodeURI(a.cover) : ALBUM_PLACEHOLDER}
                    alt={a.titulo || "cover"}
                    className="popular-album-cover"
                  decoding="async"
                  loading={i < 8 ? "eager" : "lazy"}
                  fetchPriority={((i < 8 ? "high" : "auto") as any)}
                    decoding="async"
                    onError={(e) => handleImageFallback(e, ALBUM_PLACEHOLDER)}
                  />
                </div>

                <div className="popular-album-title" title={a.titulo}>
                  {a.titulo || ""}
                </div>
                <div className="popular-album-artist" title={a.artista}>
                  {a.artista || ""}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
