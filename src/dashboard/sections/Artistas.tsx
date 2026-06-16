import "../artistas.css";
import { Link, useNavigate } from "react-router-dom";
import {
  buildArtistSources,
  tryArtistSources,
  ARTIST_PLACEHOLDER,
} from "../utils/images";
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
      await goToArtistaDetalleByNombre(navigate, name);
    } catch (e) {
      console.error(e);
      // Fallback a la ruta antigua (por si el endpoint de búsqueda falla)
      navigate(`/artista/${encodeURIComponent(name)}`);
    }
  };

  return (
    <section className="popular-artists-sec">
      <div className="sec-head">
        <h2 className="sec-title">Artistas favoritos</h2>
        {/* Mantengo la ruta antigua para no romper el router existente */}
        <Link className="sec-more" to="/artistas-populares">
          Mostrar todo
        </Link>
      </div>

      <div className="popular-artists-row scroll-x">
        {items.slice(0, 6).map((a) => {
          const candidates = buildArtistSources(a.artista);
          const first = candidates[0] ?? ARTIST_PLACEHOLDER;

          return (
            <button
              key={a.artista}
              className="popular-artist"
              type="button"
              onClick={() => void goToArtistaDetalle(a.artista)}
              aria-label={`Ver discografía de ${a.artista}`}
            >
              <div className="popular-artist-avatar">
                <img
                  src={first}
                  data-src-idx="0"
                  className="popular-artist-img"
                  alt={a.artista}
                  loading="lazy"
                  onError={(e) =>
                    tryArtistSources(e, candidates, ARTIST_PLACEHOLDER)
                  }
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
