import "../popularAlbums.css";
import { Link, useNavigate } from "react-router-dom";
import { ALBUM_PLACEHOLDER, handleImageFallback } from "../utils/images";
import LazyImage from "../components/LazyImage";

type AlbumItem = {
  idAlbum?: number | null;
  cover?: string;
  artista?: string;
  titulo?: string;
};

export default function PopularAlbumsSection({ items }: { items: AlbumItem[] }) {
  if (!items?.length) return null;

  const navigate = useNavigate();

  const goToAlbums = () => navigate("/albums-populares");

  const goToAlbumDetail = (idAlbum?: number | null) => {
    if (idAlbum == null) return goToAlbums();
    // Ruta detalle (el componente AlbumDetail usa useParams<{id}>).
    // Si en tu router la ruta es distinta, cambia aquí el prefijo.
    navigate(`/albums/${idAlbum}`);
  };

  return (
    <section className="popular-albums-sec">
      <div className="sec-head">
        <h2 className="sec-title">Novedades</h2>
        {/* Mantengo la ruta antigua para no romper el router existente */}
        <Link className="sec-more" to="/albums-populares">
          Mostrar todo
        </Link>
      </div>

      <div className="popular-albums-grid">
        {items.slice(0, 6).map((n, i) => (
          <button
            key={`${n.titulo ?? ""}-${i}`}
            className="popular-album"
            type="button"
            onClick={() => goToAlbumDetail(n.idAlbum)}
            aria-label={
              n.titulo
                ? `Ver álbums: ${n.titulo}`
                : "Ver álbumes"
            }
          >
            <div className="popular-album-coverWrap">
              <LazyImage
                src={n.cover ? encodeURI(n.cover) : ALBUM_PLACEHOLDER}
                placeholderSrc={ALBUM_PLACEHOLDER}
                alt={n.titulo || "cover"}
                className="popular-album-cover"
                eager={i < 6}
                fetchPriority={i < 6 ? "high" : "auto"}
                onError={(e) => handleImageFallback(e, ALBUM_PLACEHOLDER)}
              />
            </div>

            <div className="popular-album-title" title={n.titulo}>
              {n.titulo || ""}
            </div>
            <div className="popular-album-artist" title={n.artista}>
              {n.artista || ""}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
