// src/dashboard/pages/GenerosPage.tsx
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getGenreBackground } from "../utils/images";
import { GENRE_ICON_MAP } from "../utils/genreIconMap";
import { Link } from "react-router-dom";
import "../generos.css";
import { resolveGeneroIdByName } from "../utils/genreIdResolver";

type GenreItem = { genero: string };

export default function GenerosPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1) Recupera lo que viene desde el Link state={{ genres: genreList }}
  const genresFromState = ((location.state as any)?.genres ?? []) as GenreItem[];

  // 2) Normaliza / filtra para evitar basura (nulls, vacíos, duplicados)
  const genreList = useMemo(() => {
    const cleaned = (genresFromState ?? [])
      .filter((g) => !!g?.genero)
      .map((g) => ({ genero: g.genero.toString().trim().toUpperCase() }));

    // quitar duplicados por genero
    const seen = new Set<string>();
    return cleaned.filter((g) => {
      if (seen.has(g.genero)) return false;
      seen.add(g.genero);
      return true;
    });
  }, [genresFromState]);

  // 3) Si alguien entra directo a /dashboard/generos (sin state),
  //    redirigimos al dashboard para que no termine viendo "todos" o vacío.
  useEffect(() => {
    if (!genreList.length) {
      navigate("/dashboard", { replace: true });
    }
  }, [genreList.length, navigate]);

  const goToGenre = async (name: string) => {
  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;
  const id = await resolveGeneroIdByName(name, token);
  if (!id) return;
  // Reutilizamos el layout de albums-populares y filtramos por género.
  navigate(`/albums-populares?genero=${encodeURIComponent(String(id))}`);
};

  // Mientras redirige, no pintes nada (evita parpadeo)
  if (!genreList.length) return null;

  return (
    <main className="dash-new">
      <div className="sec-head" style={{ marginTop: 6 }}>
        <h2 className="sec-title">Tus Géneros</h2>
         <Link className="sec-more" to="/home">
          Volver
        </Link>
      </div>

      {/* Grid completo (puedes adaptar clase si ya tienes una para "todos") */}
      <div className="genres-grid-2" style={{ marginTop: 12 }}>
        {genreList.map((g) => {
          const key = (g.genero ?? "").toString().trim().toUpperCase();
          const iconFile = GENRE_ICON_MAP[key] ?? GENRE_ICON_MAP.DEFAULT;
          const src = `/icons/genres/${iconFile}`;

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
                <span className="genre-card-text">{g.genero}</span>
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}


