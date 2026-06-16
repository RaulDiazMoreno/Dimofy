
// src/dashboard/new/TrendsSection/TrendsSection.tsx
import "../trends.css";

export default function TrendsSection({ items }) {
  if (!items?.length) return null;

  return (
    <section className="trends-sec">
      <h2 className="sec-title">Novedades</h2>

      <div className="trends-grid">
        {items.map((n, i) => (
          <div key={i} className="trend-card">
            <img src={n.cover} className="trend-img" alt={n.titulo} />
            <p className="trend-title">{n.titulo}</p>
            <p className="trend-artist">{n.artista}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
