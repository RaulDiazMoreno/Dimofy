import { useMemo, useState } from "react";
import "../novedades.css";
import {
  ALBUM_PLACEHOLDER,
  handleImageFallback,
} from "../utils/images";

type NovedadItem = {
  cover?: string;
  artista?: string;
  titulo?: string;
  anio?: string | number | null;
};

export default function NovedadesTable({ items }: { items: NovedadItem[] }) {
  if (!items?.length) return null;

  const rowsPerPage = 5;
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(items.length / rowsPerPage));

  const pageRows = useMemo(() => {
    const start = page * rowsPerPage;
    return items.slice(start, start + rowsPerPage);
  }, [items, page]);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  const goPrev = () => canPrev && setPage((p) => p - 1);
  const goNext = () => canNext && setPage((p) => p + 1);

  return (
    <section className="novedades-sec">
      <div className="novedades-head">
        <h2 className="sec-title">Novedades</h2>

        <div className="novedades-pager">
          <button className="pager-btn" onClick={goPrev} disabled={!canPrev}>
            ‹
          </button>
          <span className="pager-info">
            {page + 1} / {totalPages}
          </span>
          <button className="pager-btn" onClick={goNext} disabled={!canNext}>
            ›
          </button>
        </div>
      </div>

      <div className="novedades-table-wrap">
        <table className="novedades-table">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Artista</th>
              <th>Álbum</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((n, i) => {
              return (
                <tr key={`${n.titulo ?? ""}-${i}`}>
                  <td className="td-cover">
                    <img
                      src={n.cover || ALBUM_PLACEHOLDER}
                      alt={n.titulo || "cover"}
                      className="novedad-cover"
                      onError={(e) => handleImageFallback(e, ALBUM_PLACEHOLDER)}
                    />
                  </td>
                  <td>{n.artista || ""}</td>
                  <td className="td-title">{n.titulo || ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
