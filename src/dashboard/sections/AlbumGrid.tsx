
// src/dashboard/new/DiscoverSection/DiscoverSection.tsx
import "../discover.css";

export default function DiscoverSection({ items }) {
  if (!items?.length) return null;

  return (
    <section className="discover-sec">
      <h2 className="sec-title">Descubre</h2>

      <div className="discover-row">
        {items.slice(0, 6).map((n, i) => (
          <div key={i} className="discover-card">
            <img src={n.cover} className="discover-img" alt={n.titulo} />
            <div className="discover-info">
              <h3>{n.titulo}</h3>
              <p>{n.artista}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}



