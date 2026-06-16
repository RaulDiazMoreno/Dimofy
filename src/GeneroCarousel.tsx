

import React from "react";

type GenreItem = { name: string };
interface GenreCarouselProps {
  title?: string;
  items: GenreItem[];
  onGenreClick?: (name: string) => void;
  /** Imagen de respaldo si no existe el icono local */
  placeholderImage?: string;
}

const getGenreIconPath = (name: string) =>
  `/assets/Iconos/${encodeURIComponent(name)}.png`;

const GeneroCarousel: React.FC<GenreCarouselProps> = ({
  title = "🎵 Tus Géneros Favoritos",
  items,
  onGenreClick,
  placeholderImage = "/images/genre-placeholder.png",
}) => {
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const updateButtons = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    const maxScrollLeft = el.scrollWidth - el.clientWidth - 1;
    setCanScrollRight(el.scrollLeft < maxScrollLeft);
  }, []);

  React.useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateButtons();
    const onScroll = () => updateButtons();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons]);

  const scrollByViewport = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const delta = Math.round(el.clientWidth * 0.85) * dir;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  // Fallback en imagen: .png -> .webp -> placeholder
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const currentSrc = img.src.toLowerCase();
    if (currentSrc.endsWith(".png")) {
      img.src = currentSrc.replace(/\.png$/i, ".webp");
    } else {
      img.src = placeholderImage;
    }
  };

  return (
    <section className="section">
      <h3 className="section__title">{title}</h3>

      <div className="carousel">
        <button
          className="carousel__btn carousel__btn--prev"
          onClick={() => scrollByViewport(-1)}
          disabled={!canScrollLeft}
          aria-label="Desplazar géneros a la izquierda"
        >
          ◄
        </button>

        <div
          className="carousel__track"
          ref={trackRef}
          role="list"
          aria-label="Carrusel de géneros"
        >
          {items.map((g, idx) => {
            const src = getGenreIconPath(g.name);
            return (
              <div
                key={`${g.name}-${idx}`}
                className="carousel__item carousel__item--genre"
                role="listitem"
              >
                <button
                  className="genre-card"
                  onClick={() => onGenreClick?.(g.name)}
                  aria-label={`Abrir género ${g.name}`}
                >
                  <div className="genre-card__thumb" aria-hidden="true">
                    <img
                      key={src}
                      src={src}
                      alt=""
                      loading="lazy"
                      className="genre-card__img"
                      onError={handleImgError}
                    />
                  </div>
                  <span className="genre-card__name">{g.name}</span>
                </button>
              </div>
            );
          })}
        </div>

        <button
          className="carousel__btn carousel__btn--next"
          onClick={() => scrollByViewport(1)}
          disabled={!canScrollRight}
          aria-label="Desplazar géneros a la derecha"
        >
          ►
        </button>
      </div>
    </section>
  );
};

export default GeneroCarousel;


