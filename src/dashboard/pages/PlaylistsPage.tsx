// src/dashboard/pages/PlaylistsPage.tsx
import { Link, useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboardData";
import { getStoredUserName } from "../utils/getStoredUserName";
import "../common.css";
import "../popularAlbums.css";
import { ALBUM_PLACEHOLDER, handleImageFallback } from "../utils/images";

type Props = {
  userName?: string;
};

function safeParseStoredUser(): any {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    // Si en algún momento se guardó un string plano en localStorage,
    // evitamos que la página crashee.
    return {};
  }
}

function resolveUserName(propUserName?: string): string {
  const storageUser = safeParseStoredUser();
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
    getStoredUserName() ||
    ""
  );
}

export default function PlaylistsPage({ userName }: Props) {
  const navigate = useNavigate();
  const storedUser = safeParseStoredUser();
  const token = storedUser?.token;
  const safeUser = resolveUserName(userName).trim();
  const { data, loading, status } = useDashboard(safeUser, token, { allPlaylists: true });
  const playlists = (data?.listas ?? []) as any[];
  const isError = Boolean(status?.listas?.error);
  const isLoading = loading;

  if (isLoading) return <div className="dash-loading" />;

  return (
    <main className="dash-new">
      <div className="sec-head" style={{ marginTop: 6 }}>
        <h2 className="sec-title">Tus Playlists</h2>
        <Link className="sec-more" to="/home">
          Volver
        </Link>
      </div>

      {isError ? (
        <p className="dash-empty" style={{ marginTop: 10 }}>
          No se pudieron cargar tus playlists.
        </p>
      ) : playlists?.length ? (
        <div className="popular-albums-grid popular-albums-grid--all">
          {playlists.map((l: any, i: number) => (
            <button
              key={`${l.titulo ?? ""}-${i}`}
              className="popular-album"
              type="button"
              onClick={() =>
                l?.id != null && l?.id !== ""
                  ? navigate(`/playlists/${encodeURIComponent(String(l.id))}`)
                  : undefined
              }
              disabled={l?.id == null || l?.id === ""}
              aria-label={l.titulo ? `Ver playlist: ${l.titulo}` : "Ver playlist"}
            >
              <div className="popular-album-coverWrap">
                <img
                  src={l.cover ? encodeURI(l.cover) : ALBUM_PLACEHOLDER}
                  alt={l.titulo || "cover"}
                  className="popular-album-cover"
                  decoding="async"
                  loading={i < 6 ? "eager" : "lazy"}
                  fetchPriority={((i < 6 ? "high" : "auto") as any)}
                  onError={(e) => handleImageFallback(e, ALBUM_PLACEHOLDER)}
                />
              </div>

              <div className="popular-album-title" title={l.titulo}>
                {l.titulo || ""}
              </div>
              <div className="popular-album-artist" title={l.artista}>
                {l.artista || ""}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="dash-empty" style={{ marginTop: 10 }}>
          Aún no tienes playlists.
        </p>
      )}
    </main>
  );
}
