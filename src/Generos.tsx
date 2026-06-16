import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Generos.css";
import { toast, ToastContainer } from "react-toastify";
import { GENRE_ICON_MAP } from "../src/dashboard/utils/genreIconMap";
import "react-toastify/dist/ReactToastify.css";

interface Genero {
  idGenero: number;
  nombreGenero: string;
}

/** Gradientes tipo dashboard */
const GRADIENTS = [
  "linear-gradient(135deg, #ff6ec4, #7873f5)",
  "linear-gradient(135deg, #42e695, #3bb2b8)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #30cfd0, #330867)",
  "linear-gradient(135deg, #f6d365, #fda085)",
  "linear-gradient(135deg, #a1c4fd, #c2e9fb)",
  "linear-gradient(135deg, #ff9a9e, #fad0c4)",
  "linear-gradient(135deg, #89f7fe, #66a6ff)",
  "linear-gradient(135deg, #d299c2, #fef9d7)",

  "linear-gradient(135deg, #84fab0, #8fd3f4)",
  "linear-gradient(135deg, #cfd9df, #e2ebf0)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  "linear-gradient(135deg, #fbc8d4, #9795f0)",
  "linear-gradient(135deg, #fccb90, #d57eeb)",
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #ffecd2, #fcb69f)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
];


function stableGradientFor(name: string) {
  const s = (name ?? "").trim().toUpperCase();
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

export default function Generos() {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) return;
        const { token } = JSON.parse(userData);

        const response = await fetch(`http://localhost:8080/app/generos/total`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setGeneros(Array.isArray(data) ? data : []);
        } else {
          toast.error("¡Error al obtener géneros!");
        }
      } catch (error) {
        toast.error("¡Error de conexión!");
        console.log(error);
      }
    };

    fetchGeneros();
  }, []);

  const list = useMemo(
    () =>
      (generos ?? []).filter(
        (g) => !!g?.nombreGenero && typeof g.nombreGenero === "string"
      ),
    [generos]
  );

  const goBack = () => navigate("/home");

  const goToGenre = (idGenero: number) => {
    navigate(
      `/albums-populares?genero=${encodeURIComponent(String(idGenero))}&origen=generos`
    );
  };

  return (
    <main className="dash-new">
  <section className="genres-grid-wrap">
    <div className="dash-section-head">
      <h2 className="dash-section-title">Géneros</h2>
      <button
          className="dash-section-back"
          onClick={goBack}
          type="button"
          aria-label="Volver"
          >
          Volver
      </button>
    </div>

    <div className="genres-grid-2">
      {list.map((genero) => {
        const bg = stableGradientFor(genero.nombreGenero);

        const key = (genero.nombreGenero ?? "").trim().toUpperCase();
        const iconFile = GENRE_ICON_MAP[key] ?? GENRE_ICON_MAP.DEFAULT;
        const iconPath = `/icons/genres/${iconFile}`;
        const iconoPorDefecto = `/icons/genres/${GENRE_ICON_MAP.DEFAULT}`;


        return (
          <button
            key={genero.idGenero}
            className="genre-card-colored"
            style={{ background: bg }}
            onClick={() => goToGenre(genero.idGenero)}
            type="button"
            aria-label={`Ver género ${genero.nombreGenero}`}
          >
            <div className="genre-content">
              <div className="genre-icon-wrapper">
                <span className="genre-icon-inner">
                  <img
                    className="genre-icon"
                    src={iconPath}
                    alt={genero.nombreGenero}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = iconoPorDefecto;
                    }}
                  />
                </span>
              </div>
              <span className="genre-card-text">{genero.nombreGenero}</span>
            </div>
          </button>
        );
      })}
    </div>
  </section>

  <ToastContainer />
</main>
  );
}



