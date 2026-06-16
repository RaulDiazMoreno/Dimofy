// src/dashboard/pages/PlaylistDetail.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { FaArrowLeft } from "react-icons/fa";
import CancionesTabla from "./CancionesTabla";

type PlaylistDetailDTO = {
  idLista: number;
  nombre: string;
  caratula?: string | null;
  numeroCanciones?: string | null;
};

type CancionDTO = {
  id: number;
  titulo: string;
  artista: string;
  duracion: string;
  album: string;
};

function safeGetToken(): string | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

const API_BASE = "http://localhost:8080";

const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const token = useMemo(() => safeGetToken(), []);

  const [playlist, setPlaylist] = useState<PlaylistDetailDTO | null>(null);
  const [songs, setSongs] = useState<CancionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const coverFileName = useMemo(() => {
    const c = playlist?.caratula ?? "";
    if (!c) return "";
    return c.split("\\").pop()?.split("/").pop() ?? "";
  }, [playlist?.caratula]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (!id) throw new Error("ID de playlist inválido");
        if (!token) throw new Error("Usuario no autenticado");

        const headers: HeadersInit = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // 1) Detalle (DTO limpio)
        const resDetail = await fetch(`${API_BASE}/app/listas/detalle/${id}`, {
          headers,
        });
        if (!resDetail.ok) {
          throw new Error(`Error ${resDetail.status}: no se pudo cargar la playlist`);
        }
        const detail: PlaylistDetailDTO = await resDetail.json();
        setPlaylist(detail);

        // 2) Canciones de la lista (DTO)
        const resSongs = await fetch(`${API_BASE}/app/listas/consultar/${id}`, {
          headers,
        });
        if (!resSongs.ok) {
          throw new Error(`Error ${resSongs.status}: no se pudieron cargar las canciones`);
        }

        const dataSongs = await resSongs.json();

        // Normaliza por si el backend manda idCancion en vez de id
        const normalized: CancionDTO[] = (dataSongs ?? []).map((c: any) => ({
          id: c.id ?? c.idCancion,
          titulo: c.titulo ?? "",
          artista: c.artista ?? "",
          duracion: c.duracion ?? "",
          album: c.album ?? "",
        }));

        setSongs(normalized);
      } catch (e: any) {
        setErrorMsg(e?.message ?? "Error al cargar la playlist");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id, token]);

  if (loading) {
    return (
      <Grid container justifyContent="center" style={{ marginTop: "2rem" }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (errorMsg) {
    return (
      <Snackbar open autoHideDuration={6000} onClose={() => setErrorMsg("")}>
        <Alert severity="error" onClose={() => setErrorMsg("")}>
          {errorMsg}
        </Alert>
      </Snackbar>
    );
  }

  return (
    <Paper elevation={3} style={{ padding: "2rem" }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom>
            {playlist?.nombre}
          </Typography>

          <Typography variant="subtitle1">
            Nº canciones: {playlist?.numeroCanciones ?? String(songs.length)}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          {coverFileName ? (
            <img
              src={`/assets/Cover/${coverFileName}`}
              alt="Carátula"
              style={{
                width: "300px",
                height: "300px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "4px solid #ff9800",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            />
          ) : null}
        </Grid>
      </Grid>

      <div className="row mt-4">
        <div className="col-3">
          <Button
            variant="contained"
            color="warning"
            size="small"
            onClick={() => navigate(-1)}
            style={{
              minWidth: "auto",
              padding: "6px 12px",
              fontSize: "0.8rem",
            }}
          >
            <FaArrowLeft style={{ marginRight: "0.5rem" }} />
            Volver
          </Button>
        </div>
      </div>

      <Grid container spacing={2} style={{ marginTop: "2rem" }}>
        <Grid item xs={12}>
          <Typography variant="h6">Canciones</Typography>
        </Grid>
        <Grid item xs={12}>
          <CancionesTabla canciones={songs} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PlaylistDetail;


