import "../artistas.css";
import { Link, useNavigate } from "react-router-dom";
import { ARTIST_PLACEHOLDER } from "../utils/images";
import LazyImage from "../components/LazyImage";
import { goToArtistaDetalleByNombre } from "../utils/goToArtistaDetalle";

type ArtistItem = {
  artista: string;
  imagen?: string | null;
};

export default function ArtistsSection({ items }: { items: ArtistItem[] }) {
  if (!items?.length) return null;

  const navigate = useNavigate();

  const goToArtistaDetalle = async (name: string) => {
    try {
      await goToArtistaDetalleByNombre(navigate, name, "/home");
    } catch (e) {
      console.error(e);
      // Fallback a la ruta antigua (por si el endpoint de búsqueda falla)
      navigate("/home");
    }
  };

  return (
    <section className="popular-artists-sec">
      <div className="sec-head">
        <h2 className="sec-title"><i className="bi bi-person-heart" aria-hidden="true" /> Artistas favoritos</h2>
        {/* Mantengo la ruta antigua para no romper el router existente */}
        <Link className="sec-more" to="/artistas-populares">
          Mostrar todo
        </Link>
      </div>

      <div className="popular-artists-row scroll-x">
        {items.slice(0, 6).map((a, index) => {
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
                  eager={index < 3}
                  fetchPriority={index < 3 ? "high" : "auto"}
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
    </section>
  );
}
