// src/dashboard/hooks/useAdminStats.ts
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "../utils/fetcher";

export type EstadisticaDTO = {
  // DTO esperado: new EstadisticaDashboardDTO("Usuarios", 123)
  // pero damos margen por si Jackson serializa con otros nombres.
  nombre?: string;
  metrica?: string;
  label?: string;
  metric?: string;

  valor?: number | string;
  value?: number | string;
  cantidad?: number | string;
  total?: number | string;
  numero?: number | string;
  count?: number | string;
  [k: string]: unknown;
};

function firstStringValue(obj: Record<string, unknown>) {
  for (const v of Object.values(obj)) {
    if (typeof v === "string" && v.trim()) return v;
  }
  return undefined;
}

function firstNumberValue(obj: Record<string, unknown>) {
  for (const v of Object.values(obj)) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function pickLabel(r: EstadisticaDTO) {
  return (
    r.nombre ??
    r.metrica ??
    r.label ??
    r.metric ??
    firstStringValue(r as Record<string, unknown>) ??
    "Métrica"
  );
}

function pickValue(r: EstadisticaDTO) {
  const v =
    r.valor ??
    r.value ??
    r.cantidad ??
    r.total ??
    r.numero ??
    r.count ??
    firstNumberValue(r as Record<string, unknown>) ??
    0;

  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  }
  return v;
}

export function useAdminStats(token?: string, enabled: boolean = true) {
  const base = "http://localhost:8080";
  const url = `${base}/app/dashboard/recomendaciones/estadisticas`;

  const q = useQuery({
    queryKey: ["admin-stats", url],
    // si el backend protege el endpoint, evitamos lanzar la query sin token
    enabled: enabled && !!token,
    queryFn: ({ signal }) => fetchJson(url, token, signal),
    staleTime: 30_000,
  });

  const raw = (q.data ?? []) as EstadisticaDTO[];

  const stats = Array.isArray(raw)
    ? raw.map((r) => ({
        label: pickLabel(r),
        value: pickValue(r),
      }))
    : [];

  return {
    loading: enabled && !!token && q.isLoading,
    error: q.error as unknown,
    stats,
  };
}
