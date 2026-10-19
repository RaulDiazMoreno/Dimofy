import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import { FaYoutube } from "react-icons/fa";

type Cancion = {
  id: number;
  titulo: string;
  duracion: string;
  artista?: string;
};

function esVariosArtistas(artista?: string) {
  const normalizado = (artista || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  return normalizado === "varios artistas" || normalizado === "various artists";
}

function abrirBusquedaYouTube(titulo: string, artista?: string, albumTitulo?: string) {
  const consulta = esVariosArtistas(artista)
    ? [titulo, albumTitulo].filter(Boolean).join(" ").trim()
    : [titulo, artista].filter(Boolean).join(" ").trim();
  if (!consulta) return;
  window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(consulta)}`, "_blank", "noopener,noreferrer");
}

export default function CancionesTabla({ canciones, albumTitulo }: { canciones: Cancion[]; albumTitulo?: string }) {
  if (!canciones?.length) {
    return <Typography variant="body2">No hay canciones.</Typography>;
  }

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table size="small" aria-label="tabla de canciones">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Título</TableCell>
            <TableCell>Duración</TableCell>
            <TableCell align="right">YouTube</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {canciones.map((c, idx) => (
            <TableRow key={c.id ?? idx}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{c.titulo}</TableCell>
              <TableCell>{c.duracion}</TableCell>
              <TableCell align="right">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FaYoutube />}
                  onClick={() => abrirBusquedaYouTube(c.titulo, c.artista, albumTitulo)}
                  aria-label={`Buscar ${c.titulo}${esVariosArtistas(c.artista) ? (albumTitulo ? ` del álbum ${albumTitulo}` : "") : (c.artista ? ` de ${c.artista}` : "")} en YouTube`}
                  sx={{ textTransform: "none", whiteSpace: "nowrap", color: "#b91c1c", borderColor: "#d1d5db", "&:hover": { borderColor: "#b91c1c", backgroundColor: "#fef2f2" } }}
                >
                  Buscar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
