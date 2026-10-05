import { useEffect, useMemo, useRef, useState } from "react";
import paisesData from "../../Paises.json";
import type { CountryMapPoint } from "../hooks/useAdminCharts";

type Position = [number, number];
type Geometry = { type: "Polygon" | "MultiPolygon"; coordinates: Position[][] | Position[][][] };
type Feature = { properties: Record<string, any>; geometry: Geometry };
type GeoJson = { features: Feature[] };

type Tooltip = { x: number; y: number; nombre: string; artistas: number; bandera?: string } | null;

const GEO_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

const normalize = (value = "") => value
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]/g, "");

const aliases: Record<string, string> = {
  eeuu: "estadosunidosdeamerica",
  usa: "estadosunidosdeamerica",
  estadosunidos: "estadosunidosdeamerica",
  reinounido: "reinounido",
  rusia: "rusia",
  coreadelsur: "coreadelsur",
  coreadelnorte: "coreadelnorte",
  republicacheca: "chequia",
  costademarfil: "costademarfil",
  paisesbajos: "paisesbajos",
};

function keyOf(value = "") {
  const k = normalize(value);
  return aliases[k] ?? k;
}

function project([lon, lat]: Position): Position {
  return [((lon + 180) / 360) * 1000, ((90 - lat) / 180) * 500];
}

function ringToPath(ring: Position[]) {
  if (!ring.length) return "";
  return ring.map((p, i) => {
    const [x, y] = project(p);
    return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ") + " Z";
}

function geometryToPath(geometry: Geometry) {
  if (geometry.type === "Polygon") {
    return (geometry.coordinates as Position[][]).map(ringToPath).join(" ");
  }
  return (geometry.coordinates as Position[][][])
    .flatMap(polygon => polygon.map(ringToPath)).join(" ");
}

function fillFor(value: number, max: number) {
  if (value <= 0) return "#eef2f7";
  const ratio = Math.min(1, value / Math.max(max, 1));
  const lightness = 88 - ratio * 45;
  return `hsl(217 91% ${lightness}%)`;
}

export default function WorldArtistsMap({ data }: { data: CountryMapPoint[] }) {
  const [geo, setGeo] = useState<GeoJson | null>(null);
  const [error, setError] = useState(false);
  const [tooltip, setTooltip] = useState<Tooltip>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(GEO_URL, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error("No se pudo cargar el mapa"); return r.json(); })
      .then(setGeo)
      .catch(e => { if (e.name !== "AbortError") setError(true); });
    return () => controller.abort();
  }, []);

  const counts = useMemo(() => {
    const m = new Map<string, CountryMapPoint>();
    data.forEach(p => m.set(keyOf(p.nombre), p));
    return m;
  }, [data]);

  const flags = useMemo(() => {
    const m = new Map<string, string>();
    (paisesData as Array<{ nombre: string; bandera: string }>).forEach(p => m.set(keyOf(p.nombre), p.bandera));
    return m;
  }, []);

  const max = useMemo(() => Math.max(1, ...data.map(d => d.artistas)), [data]);

  if (error) return <div className="world-map-empty">No se pudo cargar el mapa mundial.</div>;
  if (!geo) return <div className="world-map-empty">Cargando mapa mundial…</div>;

  return <div className="world-map-wrapper" ref={wrapperRef}>
    <svg className="world-map-svg" viewBox="0 0 1000 500" role="img" aria-label="Mapa mundial de artistas por país">
      {geo.features.map((feature, index) => {
        const props = feature.properties ?? {};
        const nombre = props.NAME_ES || props.NAME_EN || props.ADMIN || props.NAME || "País";
        const candidates = [props.NAME_ES, props.NAME_EN, props.ADMIN, props.NAME].filter(Boolean).map(keyOf);
        const point = candidates.map((k: string) => counts.get(k)).find(Boolean);
        const artistas = point?.artistas ?? 0;
        const bandera = candidates.map((k: string) => flags.get(k)).find(Boolean) || (point ? flags.get(keyOf(point.nombre)) : undefined);
        const d = geometryToPath(feature.geometry);
        return <path
          key={`${props.ADM0_A3 || props.ISO_A3 || nombre}-${index}`}
          d={d}
          fill={fillFor(artistas, max)}
          stroke="#cbd5e1"
          strokeWidth="0.7"
          className="world-map-country"
          onMouseEnter={(e) => {
            const rect = wrapperRef.current?.getBoundingClientRect();
            if (!rect) return;
            setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, nombre: point?.nombre || nombre, artistas, bandera });
          }}
          onMouseMove={(e) => {
            const rect = wrapperRef.current?.getBoundingClientRect();
            if (!rect) return;
            setTooltip(t => t ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top } : t);
          }}
          onMouseLeave={() => setTooltip(null)}
        />;
      })}
    </svg>
    {tooltip && <div className="world-map-tooltip" style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}>
      <div className="world-map-tooltip-title">
        {tooltip.bandera && <img src={tooltip.bandera} alt="" />}
        <strong>{tooltip.nombre}</strong>
      </div>
      <span>{tooltip.artistas} {tooltip.artistas === 1 ? "artista" : "artistas"}</span>
    </div>}
    <div className="world-map-legend"><span>Menos artistas</span><div className="world-map-gradient"/><span>Más artistas</span></div>
  </div>;
}
