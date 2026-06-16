
import React, { useMemo, useState } from 'react';
import './paginated-albums.css';

interface Album {
  imagen: string;
  titulo: string;
  artista?: string;
}

interface PaginatedAlbumsProps {
  title: string;
  items: Album[];
  itemsPerPage?: number;     // por defecto 20 (5x4)
  accentColor?: string;      // color de acento (verde Spotify o azul)
  placeholderImage?: string; // ruta del placeholder si falla la imagen
}

const PaginatedAlbums: React.FC<PaginatedAlbumsProps> = ({
  title,
  items,
  itemsPerPage = 4,
  accentColor = '#1DB954',             // Verde Spotify; puedes poner '#3DA2FF' si prefieres azul
  placeholderImage = '/images/placeholder.png', // coloca aquí tu imagen local
}) => {
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Totales y cortes
  const pageCount = useMemo(() => Math.ceil(items.length / itemsPerPage), [items.length, itemsPerPage]);
  const start = currentPage * itemsPerPage;
  const end = start + itemsPerPage;
  const currentItems = items.slice(start, end);

  // Handlers de paginación
  const goToPage = (page: number) => {
    if (page < 0 || page >= pageCount) return;
    setCurrentPage(page);
  };
  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const firstPage = () => goToPage(0);
  const lastPage = () => goToPage(pageCount - 1);

  // Construye paginación compacta: muestra primeras/últimas y el entorno al actual
  const pageNumbers = useMemo(() => {
    const maxNeighbors = 2;              // cantidad de páginas alrededor del actual
    const pages: (number | '…')[] = [];

    // siempre primera
    pages.push(0);

    // bloque anterior con elipsis si corresponde
    const startBlock = Math.max(1, currentPage - maxNeighbors);
    if (startBlock > 1) pages.push('…');

    // entorno del actual
    for (let p = startBlock; p <= Math.min(pageCount - 2, currentPage + maxNeighbors); p++) {
      pages.push(p);
    }

    // elipsis antes de la última si corresponde
    if (currentPage + maxNeighbors < pageCount - 2) pages.push('…');

    // siempre última (si hay al menos 2 páginas)
    if (pageCount > 1) pages.push(pageCount - 1);

    return pages;
  }, [currentPage, pageCount]);

  // Render
  return (
    <section className="albums-section" style={{ '--accent-color': accentColor } as React.CSSProperties}>
      <header className="albums-header">
        <h3 className="albums-title">{title}</h3>
        <div className="albums-meta">
          <span>{items.length.toLocaleString()} álbumes</span>
          <span> · Página {currentPage + 1} de {pageCount}</span>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="albums-empty">
          <p>No hay álbumes para mostrar.</p>
        </div>
      ) : (
        <>
          {/* GRID de álbumes */}
          <div className="albums-grid">
            {currentItems.map((item, idx) => (
              <article className="album-card" key={`${item.titulo}-${start + idx}`}>
                <div className="album-cover-wrap">
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    loading="lazy" // lazy nativo del navegador
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      // evita bucle si el placeholder también falla
                      if (img.src !== placeholderImage) img.src = placeholderImage;
                    }}
                    className="album-cover"
                    width={150}
                    height={150}
                  />
                </div>
                <div className="album-info">
                  <p className="album-title" title={item.titulo}>{item.titulo}</p>
                  {item.artista && (
                    <p className="album-artist" title={item.artista}>{item.artista}</p>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Controles de paginación */}
          
<nav className="albums-pagination" aria-label="Paginación de álbumes">
  <ul className="page-list">
    <li>
      <button
        className="page-btn"
        onClick={firstPage}
        disabled={currentPage === 0}
        aria-label="Primera página"
      >
        «
      </button>
    </li>
    <li>
      <button
        className="page-btn"
        onClick={prevPage}
        disabled={currentPage === 0}
        aria-label="Página anterior"
      >
        ‹
      </button>
    </li>

    {pageNumbers.map((p, i) =>
      p === '…' ? (
        <li key={`ellipsis-${i}`} className="page-ellipsis">…</li>
      ) : (
        <li key={`page-${p}`}>
          <button
            className={`page-number ${p === currentPage ? 'active' : ''}`}
            onClick={() => goToPage(p as number)}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {(p as number) + 1}
          </button>
        </li>
      )
    )}

    <li>
      <button
        className="page-btn"
        onClick={nextPage}
        disabled={currentPage >= pageCount - 1}
        aria-label="Página siguiente"
      >
        ›
      </button>
    </li>
    <li>
      <button
        className="page-btn"
        onClick={lastPage}
        disabled={currentPage >= pageCount - 1}
        aria-label="Última página"
      >
        »
      </button>
    </li>
  </ul>
</nav>

        </>
      )}
    </section>
  );
};

export default PaginatedAlbums;
