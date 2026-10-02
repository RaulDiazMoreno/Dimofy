// src/dashboard/pages/PopularArtistsPage.tsx
import { Link, useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboardData";
import "../common.css";
import "../artistas.css";
import { ARTIST_PLACEHOLDER } from "../utils/images";
import LazyImage from "../components/LazyImage";
import { goToArtistaDetalleByNombre } from "../utils/goToArtistaDetalle";

type Props = {
  userName?: string;
};

function resolveUserName(propUserName?: string): string {
  const storageUser = JSON.parse(localStorage.getItem("user") || "{}");
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

export default function PopularArtistsPage({ userName }: Props) {
  const storageUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = storageUser?.token;
  const resolvedUserName = resolveUserName(userName);

  // ✅ allArtists: true para que el endpoint devuelva todos los artistas
  const { data, loading } = useDashboard(resolvedUserName, token, {
    allArtists: true,
  });

  const navigate = useNavigate();
  const items = (data?.artistas ?? []) as Array<{ artista: string; imagen?: string | null }>;

  const goToArtistaDetalle = async (name: string) => {
    try {
      await goToArtistaDetalleByNombre(navigate, name, "/artistas-populares");
    } catch (e) {
      console.error(e);
      // Fallback a la ruta antigua (por si el endpoint de búsqueda falla)
      navigate("/artistas-populares");
    }
  };

  if (loading) return <div className="dash-loading" />;

  return (
    <main className="dash-new popular-artists-page">
      <div className="sec-head" style={{ marginTop: 6 }}>
        <h2 className="sec-title">Artistas favoritos</h2>
        <Link className="sec-more" to="/home">
          Volver
        </Link>
      </div>

      {!resolvedUserName ? (
        <p style={{ color: "#cbd5e1" }}>
          No se ha podido identificar el usuario. Vuelve a iniciar sesión.
        </p>
      ) : items.length === 0 ? (
        <p style={{ color: "#cbd5e1" }}>
          No hay artistas para mostrar todavía.
        </p>
      ) : (
        <div className="popular-artists-grid">
          {items.map((a, index) => {
            const src = a.imagen || ARTIST_PLACEHOLDER;

            return (
              <button
                key={a.artista}
                className="popular-artist"
                type="button"
                onClick={() => void goToArtistaDetalle(a.artista)}
                aria-label={`Ver discografía de ${a.artista}`}
              >
                <div className="popular-artist-avatar">
                  <LazyImage
                    src={src}
                    className="popular-artist-img"
                    alt={a.artista}
                    eager={index < 6}
                    fetchPriority={index < 6 ? "high" : "auto"}
                    onError={(e) => {
                      if (e.currentTarget.src.endsWith(ARTIST_PLACEHOLDER)) return;
                      e.currentTarget.src = ARTIST_PLACEHOLDER;
                    }}
                  />
                </div>

                <div className="popular-artist-name">{a.artista}</div>
                <div className="popular-artist-role">Artista</div>
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}
