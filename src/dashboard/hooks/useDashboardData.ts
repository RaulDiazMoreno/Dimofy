// src/dashboard/hooks/useDashboard.ts
import { useQueries } from "@tanstack/react-query";
import { adaptDashboardData } from "../adapters/dashboardAdapter";
import { fetchJson } from "../utils/fetcher";

type DashboardOptions = {
  allArtists?: boolean;
  allGenres?: boolean;
  allPlaylists?: boolean;
};

export function useDashboard(
  userName: string,
  token?: string,
  options?: DashboardOptions
) {
  const safeUser = (userName || "").trim();
  const enc = encodeURIComponent(safeUser);
  const base = "http://localhost:8080";

  const endpoints = {
    // Pedimos explícitamente los géneros del usuario (si el backend lo soporta)
    generos: `${base}/app/dashboard/recomendaciones/generos?userName=${enc}&onlyUser=true${
      options?.allGenres ? "&all=true" : ""
    }`,
    artistas: `${base}/app/dashboard/recomendaciones/artistas?userName=${enc}${
      options?.allArtists ? "&all=true" : ""
    }`,
    listas: `${base}/app/dashboard/recomendaciones/listas?userName=${enc}${
      options?.allPlaylists ? "&all=true" : ""
    }`,
    novedades: `${base}/app/dashboard/recomendaciones/novedades?userName=${enc}`,
  };

  const enabled = Boolean(safeUser);

  const queries = useQueries({
    queries: Object.entries(endpoints).map(([key, url]) => ({
      // ✅ IMPORTANTE: el queryKey debe incluir las opciones y la URL efectiva,
      // para evitar que React Query reutilice la cache cuando cambia &all=true.
      queryKey: ["dash", key, safeUser, options?.allArtists ? "artistsAll" : "artistsDefault", options?.allGenres ? "genresAll" : "genresDefault", options?.allPlaylists ? "listsAll" : "listsDefault", url],
      enabled,
      queryFn: ({ signal }) => fetchJson(url, token, signal),
      staleTime: 60_000,
      select: (raw) => raw ?? [],
    })),
  });

  const loading = enabled && queries.some((q) => q.isLoading);
  const raw = queries.map((q) => q.data);

  const status = {
    generos: {
      loading: queries[0]?.isLoading ?? false,
      error: (queries[0]?.error as Error | undefined) ?? undefined,
    },
    artistas: {
      loading: queries[1]?.isLoading ?? false,
      error: (queries[1]?.error as Error | undefined) ?? undefined,
    },
    listas: {
      loading: queries[2]?.isLoading ?? false,
      error: (queries[2]?.error as Error | undefined) ?? undefined,
    },
    novedades: {
      loading: queries[3]?.isLoading ?? false,
      error: (queries[3]?.error as Error | undefined) ?? undefined,
    },
  };

  return {
    loading,
    status,
    data: adaptDashboardData({
      generos: raw[0],
      artistas: raw[1],
      listas: raw[2],
      novedades: raw[3],
    }),
  };
}
