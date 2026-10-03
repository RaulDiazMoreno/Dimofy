import { Link, useNavigate } from "react-router-dom";
import { getGenreBackground } from "../utils/images";
import { GENRE_ICON_MAP } from "../utils/genreIconMap";
import { resolveGeneroIdByName } from "../utils/genreIdResolver";
import "../generos.css";

type GenreItem = { genero: string };

export default function GenresSection({ items }: { items: GenreItem[] }) {
  const navigate = useNavigate();
  const genreList = (items ?? []).filter((g) => !!g?.genero);

 const goToGenre = async (name: string) => {
  try {
    const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;

    const id = await resolveGeneroIdByName(name, token);
    if (!id) {
      console.warn("No se pudo resolver idGenero para:", name);
      return;
    }

    // Reutilizamos la página de "Novedades" (albums-populares) para mantener
    // el mismo layout de cards, y filtramos por género vía querystring.
    navigate(`/albums-populares?genero=${encodeURIComponent(String(id))}`);
  } catch (e) {
    console.error("Error resolviendo idGenero:", e);
  }
};

  if (!genreList.length) return null;

  return (
    <section className="genres-sec">
      <div className="sec-head">
        <h2 className="sec-title"><i className="bi bi-music-note-list" aria-hidden="true" /> Tus Géneros</h2>
        <Link className="sec-more" to="/dashboard/generos" state={{ genres: genreList }}>
           Mostrar todo
        </Link>
      </div>

      <div className="genres-row">
        {genreList.slice(0, 3).map((g) => {
          const key = (g.genero ?? "").toString().trim().toUpperCase();
          const iconFile = GENRE_ICON_MAP[key] ?? GENRE_ICON_MAP.DEFAULT;
          const src = `/assets/icons/genres/${iconFile}`;

          return (
            <button
              key={g.genero}
              className="genre-card-colored"
              style={{ background: getGenreBackground(g.genero) }}
              onClick={() => goToGenre(g.genero)}
              type="button"
              aria-label={`Ver género ${g.genero}`}
            >
              <div className="genre-content">
                <div className="genre-icon-wrapper">
                  <span className="genre-icon-inner">
                    <img className="genre-icon" src={src} alt={g.genero} />
                  </span>
                </div>
                <span className={`genre-card-text ${g.genero.trim().length >= 15 ? "genre-card-text--long" : ""}`}>{g.genero}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
