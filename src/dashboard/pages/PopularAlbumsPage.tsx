// src/dashboard/pages/PopularAlbumsPage.tsx
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboardData";
import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import "../common.css";
import "../popularAlbums.css";
import { fetchJson } from "../utils/fetcher";
import { ALBUM_PLACEHOLDER } from "../utils/images";
import { BackendAlbumLike } from "../types";
import LazyImage from "../components/LazyImage";

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

const PAGE_SIZE = 48;

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

function extractFileName(value?: string) {
  const raw = (value ?? "").trim();
  if (!raw) return "";

  const noQuery = raw.split("?")[0].split("#")[0];
  const fileName = noQuery.split("\\").pop()?.split("/").pop() ?? "";

  return fileName.replace(/\.(jpg|jpeg|png)$/i, ".webp");
}

function isRemoteUrl(value?: string) {
  return /^https?:\/\//i.test((value ?? "").trim());
}

function buildAlbumImage(value?: string, size: "thumb" | "full" = "thumb") {
  const raw = (value ?? "").trim();
  if (!raw) return ALBUM_PLACEHOLDER;

  if (isRemoteUrl(raw)) return raw;

  const fileName = extractFileName(raw);
  if (!fileName) return ALBUM_PLACEHOLDER;

  return size === "thumb"
    ? `/assets/Cover/thumbs/${fileName}`
    : `/assets/Cover/${fileName}`;
}

function buildAlbumCandidates(value?: string) {
  const raw = (value ?? "").trim();
  if (!raw) return [ALBUM_PLACEHOLDER];

  if (isRemoteUrl(raw)) {
    return [raw, ALBUM_PLACEHOLDER];
  }

  const fileName = extractFileName(raw);
  if (!fileName) return [ALBUM_PLACEHOLDER];

  return [
    `/assets/Cover/thumbs/${fileName}`,
    `/assets/Cover/${fileName}`,
    ALBUM_PLACEHOLDER,
  ];
}

export default function PopularAlbumsPage({ userName }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const generoId = (searchParams.get("genero") || "").trim();
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

  const { data, loading } = useDashboard(resolvedUserName, token);

  const genreInfinite = useInfiniteQuery({
    queryKey: ["albums-by-genre-paged", generoId, PAGE_SIZE],
    enabled: Boolean(generoId),
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      fetchJson(
        `${base}/app/albums/genero/${encodeURIComponent(
          generoId
        )}?page=${pageParam}&size=${PAGE_SIZE}`,
        token,
        signal
      ) as Promise<PageResp<BackendAlbumLike>>,
    staleTime: 60_000,
    getNextPageParam: (lastPage) => {
      const current = lastPage?.number ?? 0;
      const total = lastPage?.totalPages ?? 0;
      const next = current + 1;
      return next < total ? next : undefined;
    },
  });

  const genreAlbums = useMemo(() => {
    const pages = genreInfinite.data?.pages ?? [];
    return pages
      .flatMap((page) => (Array.isArray(page?.content) ? page.content : []))
      .filter(isBackendAlbumLike);
  }, [genreInfinite.data]);

  const items = (generoId
    ? (genreAlbums as any)
    : ((data?.novedades ?? []) as any[])) as Array<{
    idAlbum?: number | string;
    id?: number | string;
    albumId?: number | string;
    cover?: string;
    titulo?: string;
    artista?: string;
    genero?: string;
  }>;

  const effectiveLoading = generoId ? genreInfinite.isLoading : loading;
  const effectiveError = generoId ? genreInfinite.isError : false;
  const generoNombre = generoId ? (items?.[0] as any)?.genero || "" : "";

  const [visible, setVisible] = useState(48);

  useEffect(() => {
    setVisible(48);
  }, [generoId]);

  const shownItems = generoId ? items : items.slice(0, visible);

  const firstPage = generoId ? genreInfinite.data?.pages?.[0] : undefined;
  const totalPages = generoId ? firstPage?.totalPages ?? 0 : 0;
  const currentLoadedPages = generoId ? genreInfinite.data?.pages?.length ?? 0 : 0;
  const canLoadMoreGenre = generoId ? currentLoadedPages < totalPages : false;

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

      {effectiveError ? (
        <p style={{ color: "#cbd5e1" }}>Error cargando álbumes del género.</p>
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
          <div className="popular-albums-grid popular-albums-grid--all">
            {shownItems.map((n, i) => {
              const albumId = resolveAlbumId(n);
              const candidates = buildAlbumCandidates(n.cover);

              return (
                <button
                  key={`${albumId ?? n.titulo ?? "album"}-${i}`}
                  className="popular-album"
                  type="button"
                  disabled={albumId == null}
                  onClick={() => {
                    if (albumId || albumId === 0) {
                      navigate(`/albums/${encodeURIComponent(String(albumId))}`);
                    }
                  }}
                  aria-label={n.titulo ? `Ver álbum: ${n.titulo}` : "Ver álbum"}
                >
                  <div className="popular-album-coverWrap">
                    <LazyImage
                      src={encodeURI(buildAlbumImage(n.cover, "thumb"))}
                      placeholderSrc={ALBUM_PLACEHOLDER}
                      alt={n.titulo || "cover"}
                      className="popular-album-cover"
                      eager={i < 8}
                      fetchPriority={i < 8 ? "high" : "auto"}
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        const currentIdx = Number(img.dataset.srcIdx || "0");
                        const nextIdx = currentIdx + 1;

                        if (nextIdx < candidates.length) {
                          img.dataset.srcIdx = String(nextIdx);
                          img.src = encodeURI(candidates[nextIdx]);
                        } else {
                          img.src = ALBUM_PLACEHOLDER;
                        }
                      }}
                    />
                  </div>

                  <div className="popular-album-title" title={n.titulo}>
                    {n.titulo || ""}
                  </div>
                  <div className="popular-album-artist" title={n.artista}>
                    {n.artista || ""}
                  </div>
                </button>
              );
            })}
          </div>

          {generoId ? (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              {canLoadMoreGenre ? (
                <button
                  type="button"
                  className="sec-more"
                  onClick={() => genreInfinite.fetchNextPage()}
                  disabled={genreInfinite.isFetchingNextPage}
                >
                  {genreInfinite.isFetchingNextPage ? "Cargando..." : "Cargar más"}
                </button>
              ) : (
                <span style={{ opacity: 0.75 }}>No hay más álbumes</span>
              )}
            </div>
          ) : (
            items.length > visible && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
                <button
                  type="button"
                  className="sec-more"
                  onClick={() => setVisible((v) => v + 48)}
                >
                  Cargar más
                </button>
              </div>
            )
          )}
        </>
      )}
    </main>
  );
}
