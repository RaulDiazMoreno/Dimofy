import { useMemo } from "react";

type StatRow = { label: string; value: string | number };
type Props = { stats: StatRow[]; loading?: boolean; error?: unknown };

export default function AdminStatsTable({ stats, loading, error }: Props) {
  const rows = useMemo(() => stats ?? [], [stats]);
  const errorMsg = error instanceof Error ? error.message : error ? String(error) : "";

  return (
    <article className="admin-chart-card admin-stats-card">
      <h2>Estadísticas de la aplicación</h2>
      <p>Resumen general de los principales datos de DimoFy.</p>
      {loading ? <div className="chart-empty">Cargando estadísticas...</div> : error ? (
        <div className="chart-empty">No se pudieron cargar las estadísticas: {errorMsg}</div>
      ) : rows.length === 0 ? <div className="chart-empty">Sin estadísticas</div> : (
        <div className="admin-kpi-grid">
          {rows.map((r, i) => (
            <div className="admin-kpi" key={`${r.label}-${i}`}>
              <span>{r.label}</span><strong>{r.value}</strong>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
