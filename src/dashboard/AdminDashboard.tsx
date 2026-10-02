import "./common.css";
import "./dashboard.css";
import "./admin-dashboard.css"; // 👈 nuevo css

import AdminStatsTable from "./sections/AdminStatsTable";
import { useAdminStats } from "./hooks/useAdminStats";
import { useAdminCharts } from "./hooks/useAdminCharts";
import AdminCharts from "./sections/AdminCharts";

export default function AdminDashboard() {
  const storageUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = storageUser?.token;

  const { stats, loading } = useAdminStats(token, true);
  const charts = useAdminCharts(token);

  if (loading) {
    return (
      <main className="admin-dash">
        <div className="admin-loading">Cargando estadísticas...</div>
      </main>
    );
  }

  return (
    <main className="admin-dash">

      {/* Header */}
      <header className="admin-header">
        <div>
          <h1 className="admin-title">Panel de Administración</h1>
          <p className="admin-subtitle">
            Gestión y estadísticas globales del sistema
          </p>
        </div>
      </header>

      {/* Contenido */}
      <section className="admin-content">

        <div className="admin-card">
          <AdminStatsTable stats={stats} />
        </div>

        <AdminCharts albums={charts.albums} countries={charts.countries} genres={charts.genres} />

      </section>

    </main>
  );
}

