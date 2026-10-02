// src/dashboard/Dashboard.tsx
import { Suspense } from "react";
import DashboardHeader from "./DashboardHeader";

import PopularAlbumsSection from "./sections/PopularAlbums";
import GenresSection from "./sections/Generos";
import ArtistsSection from "./sections/Artistas";
import PlaylistsSection from "./sections/PlaylistsSection";
import AdminStatsTable from "./sections/AdminStatsTable";
import AdminCharts from "./sections/AdminCharts";

import { useDashboard } from "./hooks/useDashboardData";
import { useAdminStats } from "./hooks/useAdminStats";
import { useAdminCharts } from "./hooks/useAdminCharts";
import { isAdminFromStorage } from "./utils/isAdmin";
import { getStoredUserName } from "./utils/getStoredUserName";
import "./common.css";
import "./admin-dashboard.css";

export default function Dashboard({ userName }: { userName: string }) {
  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;
  const effectiveUserName = (userName || getStoredUserName()).trim();
  const { data, loading, status } = useDashboard(effectiveUserName, token);

  const isAdmin = isAdminFromStorage();
  const {
    stats: adminStats,
    loading: adminLoading,
    error: adminError,
  } = useAdminStats(token, isAdmin);
  const adminCharts = useAdminCharts(isAdmin ? token : undefined);

  // Para usuarios normales seguimos mostrando un loader global.
  // Para admin, la tabla ya incluye un estado de loading/error dentro.
  if (!isAdmin && loading) return <div className="dash-loading" />;

  return (
      <main className={`dash-new ${isAdmin ? "dash-admin-saas" : ""}`}>

      <DashboardHeader userName={effectiveUserName} />

      <Suspense fallback={<div className="dash-loading" />}>
        {isAdmin ? (
          <section className="admin-content">
            <div>
              <AdminStatsTable
                stats={adminStats}
                loading={adminLoading}
                error={adminError}
              />
            </div>
            <AdminCharts
              albums={adminCharts.albums}
              countries={adminCharts.countries}
              genres={adminCharts.genres}
              artistsAlbums={adminCharts.artistsAlbums}
            />
          </section>
        ) : (
          <>
            {/* 1) Artistas favoritos */}
            <ArtistsSection items={data.artistas} />

            {/* 2) Géneros (2 por línea + icono) */}
            <GenresSection items={data.generos} />

            {/* 3) Novedades */}
            <PopularAlbumsSection items={data.novedades} />

            {/* 4) Playlists del usuario */}
            <PlaylistsSection
              items={data.listas}
              loading={status.listas.loading}
              error={status.listas.error}
            />
          </>
        )}
      </Suspense>
    </main>
  );
}
