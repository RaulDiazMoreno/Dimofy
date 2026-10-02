// utils/goToArtistaDetalle.ts
//
// Navega a la pantalla ArtistaDetalle (ruta: /artistas/:idArtista)
// resolviendo primero el id del artista por nombre usando el backend.

import type { NavigateFunction } from "react-router-dom";

type Artista = {
  idArtista?: number;
  id?: number;
  nombre?: string;
};

const BASE = "http://localhost:8080";

export async function goToArtistaDetalleByNombre(
  navigate: NavigateFunction,
  nombre: string,
  returnTo: string = "/artistas"
): Promise<void> {
  const q = (nombre ?? "").trim();
  if (!q) return;

  // Tu backend: GET /app/artistas/buscar?nombre=...
  const res = await fetch(
    `${BASE}/app/artistas/buscar?nombre=${encodeURIComponent(q)}`
  );

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Buscar artista falló (HTTP ${res.status}): ${txt}`);
  }

  const data = (await res.json()) as Artista[];

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No se encontró el artista: ${q}`);
  }

  // Si hay varios, intenta elegir el exact match por nombre
  const lower = q.toLowerCase();
  const chosen =
    data.find((a) => (a.nombre ?? "").toLowerCase() === lower) ?? data[0];

  const idArtista = chosen?.idArtista ?? chosen?.id;
  if (!idArtista) {
    throw new Error(`No se pudo resolver idArtista para: ${q}`);
  }

  navigate(`/artistas/${idArtista}?returnTo=${encodeURIComponent(returnTo)}`);
}
