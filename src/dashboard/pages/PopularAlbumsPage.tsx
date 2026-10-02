// src/dashboard/pages/PopularAlbumsPage.tsx
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import "../common.css";
import "../popularAlbums.css";
import { fetchJson } from "../utils/fetcher";
import { ALBUM_PLACEHOLDER } from "../utils/images";
import { BackendAlbumLike } from "../types";
import LazyImage from "../components/LazyImage";
import PaginationControls from "../../PaginationControls";
import { getAlbumImage, getAlbumThumbnail } from "../../utils/imagePaths";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBackendAlbumLike(value: unknown): value is BackendAlbumLike {
  if (!isObject(value)) return false;
  return typeof (value as any).idAlbum === "number";
}

type PageResp<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

const ALBUMS_PER_PAGE = 12;

type Props = {
  userName?: string;
};

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

function resolveUserName(propUserName?: string): string {
  let storageUser: any = {};
  try {
    storageUser = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    storageUser = {};
  }

  return (
    propUserName ||
    storageUser?.userName ||
    storageUser?.username ||
    storageUser?.nombre ||
    storageUser?.name ||
    storageUser?.user?.userName ||
    storageUser?.user?.username ||
    storageUser?.user?.nombre ||
    storageUser?.user?.name ||
    ""
  );
}

export default function PopularAlbumsPage({ userName }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const generoId = (searchParams.get("genero") || "").trim();
  const letraFromUrl = (searchParams.get("letra") || "").trim().toUpperCase();
  const origen = (searchParams.get("origen") || "").trim().toLowerCase();
  const backTo = origen === "generos" ? "/generos" : "/home";

  let storageUser: any = {};
  try {
    storageUser = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    storageUser = {};
  }

  const token = storageUser?.token;
  const resolvedUserName = resolveUserName(userName);
  const base = "http://localhost:8080";

  const novedadesQuery = useQuery({
    queryKey: ["all-novedades", resolvedUserName],
    enabled: Boolean(!generoId && resolvedUserName),
    queryFn: ({ signal }) =>
      fetchJson(
        `${base}/app/dashboard/recomendaciones/novedades?userName=${encodeURIComponent(
          resolvedUserName
        )}&all=true`,
        token,
        signal
      ) as Promise<any>,
    staleTime: 60_000,
  });

  const novedades = useMemo(() => {
    const raw = novedadesQuery.data as any;
    const source = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.content)
      ? raw.content
      : Array.isArray(raw?.novedades)
      ? raw.novedades
      : [];

    return source.map((n: any) => ({
      idAlbum:
        n?.idAlbum ??
        n?.id ??
        n?.albumId ??
        n?.id_album ??
        n?.album?.idAlbum ??
        n?.album?.id ??
        null,
      titulo: n?.titulo ?? n?.title ?? "",
      artista: n?.artista ?? n?.artist ?? "",
      cover: n?.cover ?? n?.caratula ?? n?.portada ?? n?.imagen ?? "",
      genero: n?.genero ?? n?.genre ?? "",
    }));
  }, [novedadesQuery.data]);

  const [currentGenrePage, setCurrentGenrePage] = useState(() => {
    const pageFromUrl = Number(searchParams.get("page"));
    return Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;
  });

  const initialsQuery = useQuery({
    queryKey: ["artist-initials-by-genre", generoId],
    enabled: Boolean(generoId),
    queryFn: ({ signal }) =>
      fetchJson(
        `${base}/app/albums/genero/${encodeURIComponent(generoId)}/iniciales-artistas`,
        token,
        signal
      ) as Promise<string[]>,
    staleTime: 5 * 60_000,
  });

  const artistInitials = useMemo(() => {
    const raw = Array.isArray(initialsQuery.data) ? initialsQuery.data : [];
    return raw
      .map((value) => String(value ?? "").trim().toUpperCase())
      .filter(Boolean);
  }, [initialsQuery.data]);

  const selectedInitial =
    letraFromUrl && artistInitials.includes(letraFromUrl)
      ? letraFromUrl
      : artistInitials[0] || "";

  useEffect(() => {
    if (!generoId || !artistInitials.length) return;

    const params = new URLSearchParams(searchParams);
    const urlLetter = (params.get("letra") || "").trim().toUpperCase();
    if (!artistInitials.includes(urlLetter)) {
      params.set("letra", artistInitials[0]);
      params.set("page", "1");
      setCurrentGenrePage(1);
      setSearchParams(params, { replace: true });
    }
  }, [generoId, artistInitials.join("|")]);

  useEffect(() => {
    if (!generoId) return;
    const pageFromUrl = Number(searchParams.get("page"));
    const normalizedPage =
      Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;
    setCurrentGenrePage(normalizedPage);
  }, [generoId, letraFromUrl]);

  useEffect(() => {
    if (!generoId || !selectedInitial) return;
    const params = new URLSearchParams(searchParams);
    params.set("letra", selectedInitial);
    params.set("page", String(currentGenrePage));
    setSearchParams(params, { replace: true });
  }, [currentGenrePage, generoId, selectedInitial]);

  const genreQuery = useQuery({
    queryKey: ["albums-by-genre-initial-paged", generoId, selectedInitial, currentGenrePage, ALBUMS_PER_PAGE],
    enabled: Boolean(generoId && selectedInitial),
    queryFn: ({ signal }) =>
      fetchJson(
        `${base}/app/albums/genero/${encodeURIComponent(
          generoId
        )}/inicial/${encodeURIComponent(selectedInitial)}?page=${currentGenrePage - 1}&size=${ALBUMS_PER_PAGE}`,
        token,
        signal
      ) as Promise<PageResp<BackendAlbumLike>>,
    staleTime: 60_000,
  });

  const genreAlbums = useMemo(() => {
    const content = genreQuery.data?.content;
    return (Array.isArray(content) ? content : []).filter(isBackendAlbumLike);
  }, [genreQuery.data]);

  const items = (generoId
    ? (genreAlbums as any)
    : (novedades as any[])) as Array<{
    idAlbum?: number | string;
    id?: number | string;
    albumId?: number | string;
    cover?: string;
    titulo?: string;
    artista?: string;
    genero?: string;
  }>;

  const effectiveLoading = generoId
    ? initialsQuery.isLoading || (Boolean(selectedInitial) && genreQuery.isLoading)
    : novedadesQuery.isLoading;
  const effectiveError = generoId
    ? initialsQuery.isError || genreQuery.isError
    : novedadesQuery.isError;
  const generoNombre = generoId ? (items?.[0] as any)?.genero || "" : "";

  const [currentPopularPage, setCurrentPopularPage] = useState(1);

  useEffect(() => {
    setCurrentPopularPage(1);
  }, [generoId]);

  const totalPopularPages = !generoId
    ? Math.max(1, Math.ceil(items.length / ALBUMS_PER_PAGE))
    : 1;

  const shownItems = useMemo(() => {
    if (generoId) return items;

    const start = (currentPopularPage - 1) * ALBUMS_PER_PAGE;
    return items.slice(start, start + ALBUMS_PER_PAGE);
  }, [generoId, items, currentPopularPage]);

  const totalGenrePages = generoId ? Math.max(1, genreQuery.data?.totalPages ?? 1) : 1;

  if (effectiveLoading) return <div className="dash-loading" />;

  return (
    <main className="dash-new popular-albums-page">
      <div className="sec-head" style={{ marginTop: 6 }}>
        <h2 className="sec-title">
          {generoId
            ? generoNombre
              ? `Álbumes de ${generoNombre}`
              : "Álbumes por género"
            : "Novedades"}
        </h2>
        <Link className="sec-more" to={backTo}>
          Volver
        </Link>
      </div>

      {generoId && artistInitials.length > 0 && (
        <nav className="artist-initial-menu" aria-label="Filtrar álbumes por inicial del artista">
          {artistInitials.map((letter) => (
            <button
              key={letter}
              type="button"
              className={`artist-initial-button${selectedInitial === letter ? " active" : ""}`}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set("letra", letter);
                params.set("page", "1");
                setCurrentGenrePage(1);
                setSearchParams(params);
              }}
              aria-current={selectedInitial === letter ? "page" : undefined}
            >
              {letter}
            </button>
          ))}
        </nav>
      )}

      {effectiveError ? (
        <p style={{ color: "#cbd5e1" }}>
          {generoId ? "Error cargando álbumes del género." : "Error cargando novedades."}
        </p>
      ) : !resolvedUserName ? (
        <p style={{ color: "#cbd5e1" }}>
          No se ha podido identificar el usuario. Vuelve a iniciar sesión.
        </p>
      ) : shownItems.length === 0 ? (
        <p style={{ color: "#cbd5e1" }}>
          {generoId ? "No hay álbumes para este género." : "No hay novedades para mostrar."}
        </p>
      ) : (
        <>
          <Grid container spacing={3}>
            {shownItems.map((n, i) => {
              const albumId = resolveAlbumId(n);
              const imageSrc = getAlbumThumbnail(n.cover);
              const originalImageSrc = getAlbumImage(n.cover);

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`${albumId ?? n.titulo ?? "album"}-${i}`}>
                  <Card
                    onClick={() => {
                      if (albumId || albumId === 0) {
                        navigate(`/albums/${encodeURIComponent(String(albumId))}`, {
                          state: {
                            returnTo: `${location.pathname}${location.search}`,
                          },
                        });
                      }
                    }}
                    sx={{
                      height: "100%",
                      borderRadius: "22px",
                      overflow: "hidden",
                      background: "#ffffff",
                      color: "#0f172a",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                      transition: "transform 0.22s ease, box-shadow 0.22s ease",
                      cursor: albumId != null ? "pointer" : "default",
                      "&:hover": {
                        transform: albumId != null ? "translateY(-6px)" : "none",
                        boxShadow:
                          albumId != null
                            ? "0 18px 40px rgba(15,23,42,0.14)"
                            : "0 10px 30px rgba(15,23,42,0.08)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                        background: "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                        // LazyImage no admite style ni sx.
                        // Aplicamos el estilo directamente al <img> que genera internamente.
                        "& img": {
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          objectPosition: "center",
                          display: "block",
                        },
                      }}
                    >
                      <LazyImage
                        src={encodeURI(imageSrc)}
                        placeholderSrc={ALBUM_PLACEHOLDER}
                        alt={n.titulo || "Álbum"}
                        eager={currentPopularPage === 1 && i < 4}
                        fetchPriority={currentPopularPage === 1 && i < 4 ? "high" : "low"}
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.dataset.originalFallback !== "true") {
                            img.dataset.originalFallback = "true";
                            img.src = encodeURI(originalImageSrc);
                            return;
                          }
                          if (!img.src.endsWith(ALBUM_PLACEHOLDER)) img.src = ALBUM_PLACEHOLDER;
                        }}
                      />
                    </Box>

                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="subtitle1"
                        title={n.titulo}
                        sx={{
                          fontWeight: 700,
                          color: "#0f172a",
                          lineHeight: 1.35,
                          minHeight: 44,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {n.titulo || "Título desconocido"}
                      </Typography>

                      <Typography
                        variant="body2"
                        title={n.artista}
                        sx={{
                          color: "#64748b",
                          mt: 1,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {n.artista || "Artista desconocido"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {generoId ? (
            totalGenrePages > 1 && (
              <PaginationControls
                currentPage={currentGenrePage}
                totalPages={totalGenrePages}
                setCurrentPage={setCurrentGenrePage}
              />
            )
          ) : (
            totalPopularPages > 1 && (
              <PaginationControls
                currentPage={currentPopularPage}
                totalPages={totalPopularPages}
                setCurrentPage={setCurrentPopularPage}
              />
            )
          )}
        </>
      )}
    </main>
  );
}

