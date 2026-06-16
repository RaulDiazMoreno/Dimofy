// src/dashboard/pages/NovedadesPage.tsx
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboardData";
import "../discover.css";
import "../common.css";

type Props = {
  userName: string;
};

export default function NovedadesPage({ userName }: Props) {
  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;
  const { data, loading } = useDashboard(userName, token);

  const currentYear = new Date().getFullYear().toString();

  const novedadesThisYear = useMemo(() => {
    return (data?.novedades ?? []).filter((n: any) => String(n.anyo ?? "") === currentYear);
  }, [data, currentYear]);

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
        {novedadesThisYear.map((n: any, i: number) => (
          <div key={i} className="discover-card" title={n.titulo}>
            <div className="discover-coverWrap">
              <img
                src={n.cover}
                className="discover-img"
                alt={n.titulo}
                loading="lazy"
              />
            </div>

            <div className="discover-meta">
              <div className="discover-title">{n.titulo}</div>
              {!!n.genero && <div className="discover-genre">{n.genero}</div>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
