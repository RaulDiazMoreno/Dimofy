

import React from "react";

export type ArtistItem = { name: string };

export interface ArtistCarouselProps {
  title?: string;
  artists: ArtistItem[];
  onArtistClick?: (name: string) => void;
  placeholderImage?: string;
  loop?: boolean;
}

const getArtistAssetPath = (name: string) =>
  `/assets/Artistas/${encodeURIComponent(name)}.webp`;

const ArrowIcon: React.FC<{ direction: "left" | "right"; size?: number }> = ({
  direction,
  size = 18,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {direction === "left" ? (
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

const ArtistCarousel: React.FC<ArtistCarouselProps> = ({
  title = "🎤 Tus Artistas Favoritos",
  artists,
  onArtistClick,
  placeholderImage = "/images/artist-placeholder.png",
  loop = true,
}) => {
  const [index, setIndex] = React.useState(0);
  const L = artists.length;

  React.useEffect(() => setIndex(0), [artists]);

  if (L === 0) {
    return (
      <section className="section">
        <h3 className="section__title">{title}</h3>
        <p style={{ opacity: 0.7 }}>Sin datos de artistas por ahora.</p>
      </section>
    );
  }

  const prev = () => setIndex((i) => (loop ? (i - 1 + L) % L : Math.max(0, i - 1)));
  const next = () => setIndex((i) => (loop ? (i + 1) % L : Math.min(L - 1, i + 1)));

  const current = artists[index];
  const baseSrc = getArtistAssetPath(current.name);
  const src = baseSrc;

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const currentSrc = img.src;
    if (currentSrc.toLowerCase().endsWith(".webp")) {
      img.src = currentSrc.replace(/\.webp$/i, ".jpg");
    } else {
      img.src = placeholderImage;
    }
  };

  return (
    <section className="section">
      <h3 className="section__title">{title}</h3>

      <div style={carouselShellStyle}>
        <button className="carousel__btn is-left" onClick={prev} aria-label="Anterior" style={arrowBtnLeftStyle}>
          <ArrowIcon direction="left" />
        </button>

        <div style={oneItemCenterStyle}>
          <button onClick={() => onArtistClick?.(current.name)} aria-label={`Abrir artista ${current.name}`} style={artistButtonStyle}>
            <div style={artistThumbSquareSmallerStyle}>
              <img
                key={src}
                src={src}
                alt={`Foto de ${current.name}`}
                loading="lazy"
                style={imgStyle}
                onError={handleImgError}
                sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 320px"
              />
            </div>
            <div style={artistNameStyle}>{current.name}</div>
          </button>
        </div>

        <button className="carousel__btn is-right" onClick={next} aria-label="Siguiente" style={arrowBtnRightStyle}>
          <ArrowIcon direction="right" />
        </button>
      </div>

      <div style={dotsRowStyle} aria-hidden>
        {artists.map((_, i) => (
          <span
            key={`a-dot-${i}`}
            style={{
              ...dotStyle,
              opacity: index === i ? 0.95 : 0.3,
              transform: index === i ? "scale(1.1)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default ArtistCarousel;

/* estilos inline */
const carouselShellStyle: React.CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "1fr",
  alignItems: "center",
  justifyItems: "center",
  padding: "8px 0",
};

const oneItemCenterStyle: React.CSSProperties = { display: "grid", placeItems: "center" };

const baseArrowBtnStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  inlineSize: "40px",
  blockSize: "40px",
  borderRadius: "50%",
  border: "1px solid rgba(0,0,0,0.12)",
  background: "rgba(255,255,255,0.95)",
  color: "#111",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
  backdropFilter: "blur(2px)",
  zIndex: 2,
};
const arrowBtnLeftStyle: React.CSSProperties = { ...baseArrowBtnStyle, left: "8px" };
const arrowBtnRightStyle: React.CSSProperties = { ...baseArrowBtnStyle, right: "8px" };

const artistButtonStyle: React.CSSProperties = {
  inlineSize: "clamp(220px, 50vw, 320px)",
  display: "grid",
  gap: "0.5rem",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "#111",
  textAlign: "center",
};
const artistThumbSquareSmallerStyle: React.CSSProperties = {
  inlineSize: "100%",
  aspectRatio: "1 / 1",
  overflow: "hidden",
  border: "1px solid rgba(0,0,0,0.12)",
  background: "none",
  backgroundImage: "none",
  borderRadius: "10px",
};
const imgStyle: React.CSSProperties = {
  inlineSize: "100%",
  blockSize: "100%",
  objectFit: "cover",
  display: "block",
};
const artistNameStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  opacity: 0.95,
};
const dotsRowStyle: React.CSSProperties = { display: "flex", justifyContent: "center", gap: "6px", marginTop: "8px" };
const dotStyle: React.CSSProperties = { width: "6px", height: "6px", borderRadius: "50%", background: "#111", transition: "transform 150ms ease, opacity 150ms ease" };

