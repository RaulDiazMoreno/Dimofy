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
} from "@mui/material";

type Cancion = {
  id: number;
  titulo: string;
  duracion: string;
};

export default function CancionesTabla({ canciones }: { canciones: Cancion[] }) {
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
          </TableRow>
        </TableHead>
        <TableBody>
          {canciones.map((c, idx) => (
            <TableRow key={c.id ?? idx}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{c.titulo}</TableCell>
              <TableCell>{c.duracion}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
