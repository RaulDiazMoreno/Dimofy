import type { ChartPoint, CountryMapPoint } from "../hooks/useAdminCharts";
import WorldArtistsMap from "./WorldArtistsMap";
function VerticalBars({ data }: { data: ChartPoint[] }) { const max=Math.max(...data.map(d=>d.value),1); return <div className="chart-bars">{data.map(d=><div className="chart-bar-item" key={d.label}><div className="chart-value">{d.value}</div><div className="chart-bar-track"><div className="chart-bar" style={{height:`${Math.max(4,d.value/max*100)}%`}} /></div><div className="chart-x-label">{d.label}</div></div>)}</div>; }
function HorizontalBars({ data }: { data: ChartPoint[] }) { const max=Math.max(...data.map(d=>d.value),1); return <div className="chart-horizontal">{data.map(d=><div className="chart-row" key={d.label}><div className="chart-row-label" title={d.label}>{d.label}</div><div className="chart-row-track"><div className="chart-row-bar" style={{width:`${d.value/max*100}%`}} /></div><strong>{d.value}</strong></div>)}</div>; }
function Card({title,subtitle,data,className=""}:{title:string;subtitle:string;data:ChartPoint[];className?:string}) { return <article className={`admin-chart-card ${className}`}><h2>{title}</h2><p>{subtitle}</p>{data.length?<HorizontalBars data={data}/>:<div className="chart-empty">Sin datos</div>}</article>; }
export default function AdminCharts({ albums,countries,genres,artistsAlbums }:{albums:ChartPoint[];countries:CountryMapPoint[];genres:ChartPoint[];artistsAlbums:ChartPoint[]}) {
 return <div className="admin-charts-grid">
  <article className="admin-chart-card admin-chart-wide"><h2>Discos por año</h2><p>Número de discos publicados durante los últimos 10 años.</p>{albums.length?<VerticalBars data={albums}/>:<div className="chart-empty">Sin datos</div>}</article>
  <div className="admin-chart-left-stack"><article className="admin-chart-card admin-world-map-card"><h2>Artistas por país</h2><p>Distribución mundial de artistas. Pasa el ratón sobre un país para ver su bandera y número de artistas.</p><WorldArtistsMap data={countries}/></article><Card title="Artistas con más álbumes" subtitle="Top 50 por número de álbumes publicados." data={artistsAlbums}/></div>
  <Card title="Artistas por género" subtitle="Distribución de artistas por género musical." data={genres} className="admin-chart-genres"/>
 </div>;
}
