import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "../utils/fetcher";
export type ChartPoint = { label: string; value: number };
export function useAdminCharts(token?: string) {
  const base = "http://localhost:8080/app/dashboard/recomendaciones/graficas";
  const options = (url: string) => ({ queryKey: ["admin-chart", url], enabled: !!token, queryFn: ({ signal }: { signal: AbortSignal }) => fetchJson(url, token, signal), staleTime: 60_000 });
  const albums = useQuery(options(`${base}/albums-por-anyo`));
  const countries = useQuery(options(`${base}/top-paises`));
  const genres = useQuery(options(`${base}/artistas-por-genero`));
  const artistsAlbums = useQuery(options(`${base}/top-artistas-albums`));
  return {
    albums: (albums.data ?? []) as ChartPoint[], countries: (countries.data ?? []) as ChartPoint[], genres: (genres.data ?? []) as ChartPoint[], artistsAlbums: (artistsAlbums.data ?? []) as ChartPoint[],
    loading: albums.isLoading || countries.isLoading || genres.isLoading || artistsAlbums.isLoading,
  };
}
