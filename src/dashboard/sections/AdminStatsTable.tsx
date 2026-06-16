import { useMemo } from "react";
import { Table } from "react-bootstrap";

type StatRow = { label: string; value: string | number };

type Props = {
  stats: StatRow[];
  loading?: boolean;
  error?: unknown;
};

export default function AdminStatsTable({ stats, loading, error }: Props) {
  const rows = useMemo(() => stats ?? [], [stats]);

  const errorMsg =
    error instanceof Error ? error.message : error ? String(error) : "";

  return (
    <section className="mb-5">
      <div className="row">
        <div className="col">
          <h3>📊 Estadísticas de la aplicación</h3>
        </div>
      </div>

      <div className="table-responsive mt-3">
        <Table striped bordered hover size="sm" className="small">
          <thead className="table-primary">
            <tr>
              <th>Concepto</th>
              <th>Valor</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="text-center" style={{ opacity: 0.85 }}>
                  Cargando estadísticas...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={2} className="text-center" style={{ opacity: 0.9 }}>
                  No se pudieron cargar las estadísticas: {errorMsg}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center" style={{ opacity: 0.85 }}>
                  Sin estadísticas
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={`${r.label}-${i}`}>
                  <td>{r.label}</td>
                  <td style={{ fontWeight: 600 }}>{r.value}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </section>
  );
}
