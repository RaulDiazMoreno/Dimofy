import { Link, useNavigate } from "react-router-dom";
import "../popularAlbums.css";
import "../common.css";
import { ALBUM_PLACEHOLDER, handleImageFallback } from "../utils/images";

type PlaylistItem = {
  id?: number | string;
  cover?: string;
  titulo?: string;
  artista?: string;
};

type Props = {
  items: PlaylistItem[];
  loading?: boolean;
  error?: Error;
};

export default function PlaylistsSection({ items, loading, error }: Props) {
  const navigate = useNavigate();
  const goToPlaylist = (id?: number | string) => {
    if (id == null || id === "") return;
    navigate(`/playlists/${encodeURIComponent(String(id))}`);
  };
  const list = items ?? [];
  const preview = list.slice(0, 6);

  return (
    <section className="popular-albums-sec">
      <div className="sec-head" style={{ marginTop: 6 }}>
        <h2 className="sec-title"><i className="bi bi-collection-play-fill" aria-hidden="true" /> Tus Playlists</h2>
        <Link className="sec-more" to="/playlists">
          Mostrar todo
        </Link>
      </div>

      {loading ? (
        <div className="dash-loading" />
      ) : error ? (
        <p className="dash-empty" style={{ marginTop: 10 }}>
          No se pudieron cargar tus playlists.
        </p>
      ) : preview.length ? (
        <div className="popular-albums-grid">
          {preview.map((l, i) => (
            <button
              key={`${l.titulo ?? ""}-${i}`}
              className="popular-album"
              type="button"
              onClick={() => goToPlaylist(l.id)}
              disabled={l.id == null || l.id === ""}
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
    </section>
  );
}
