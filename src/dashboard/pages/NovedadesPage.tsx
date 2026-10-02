// src/dashboard/pages/NovedadesPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboardData";
import PaginationControls from "../../PaginationControls";
import "../discover.css";
import "../common.css";

type Props = {
  userName: string;
};

const NOVEDADES_PER_PAGE = 12;

export default function NovedadesPage({ userName }: Props) {
  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;
  const { data, loading } = useDashboard(userName, token);
  const [currentPage, setCurrentPage] = useState(1);

  const currentYear = new Date().getFullYear().toString();

  const novedadesThisYear = useMemo(() => {
    return (data?.novedades ?? []).filter(
      (n: any) => String(n.anyo ?? "") === currentYear
    );
  }, [data, currentYear]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(novedadesThisYear.length / NOVEDADES_PER_PAGE)),
    [novedadesThisYear.length]
  );

  const novedadesPaginadas = useMemo(() => {
    const start = (currentPage - 1) * NOVEDADES_PER_PAGE;
    return novedadesThisYear.slice(start, start + NOVEDADES_PER_PAGE);
  }, [novedadesThisYear, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) return <div className="dash-loading" />;

  return (
    <main className="dash-new">
      <div className="discover-head" style={{ marginTop: 6 }}>
        <h2 className="sec-title">Novedades {currentYear}</h2>
        <Link className="discover-more" to="/">
          Volver
        </Link>
      </div>

      <div className="discover-row">
        {novedadesPaginadas.map((n: any, i: number) => (
          <div key={n.idAlbum ?? `${n.titulo ?? ""}-${i}`} className="discover-card" title={n.titulo}>
            <div className="discover-coverWrap">
              <img
                src={n.cover}
                className="discover-img"
                alt={n.titulo}
                loading={currentPage === 1 && i < 4 ? "eager" : "lazy"}
                fetchPriority={currentPage === 1 && i < 4 ? "high" : "low"}
              />
            </div>

            <div className="discover-meta">
              <div className="discover-title">{n.titulo}</div>
              {!!n.genero && <div className="discover-genre">{n.genero}</div>}
            </div>
          </div>
        ))}
      </div>

      {novedadesThisYear.length > NOVEDADES_PER_PAGE && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </main>
  );
}