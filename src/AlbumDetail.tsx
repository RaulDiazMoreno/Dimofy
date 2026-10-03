import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Container,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { FaArrowLeft } from "react-icons/fa";
import CancionesTabla from "./CancionesTabla";
import { DEFAULT_ALBUM_IMAGE, getAlbumImage, imageFallback } from "./utils/imagePaths";

interface Cancion {
  id: number;
  titulo: string;
  duracion: string;
}

interface Album {
  idAlbum: number;
  titulo: string;
  artista: string;
  genero: string;
  anyo: string;
  cover: string;
  canciones: Cancion[];
}

const AlbumDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo =
    (location.state as { returnTo?: string } | null)?.returnTo ?? null;

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [coverSrc, setCoverSrc] = useState(DEFAULT_ALBUM_IMAGE);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) throw new Error("Usuario no autenticado");

        const { token } = JSON.parse(userData);

        const response = await fetch(`http://localhost:8080/app/albums/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setAlbum(data);
        setCoverSrc(getAlbumImage(data?.cover));
      } catch (error: unknown) {
        setErrorMsg(
          error instanceof Error ? error.message : "Error al cargar el álbum"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  const numeroCanciones = useMemo(() => album?.canciones?.length ?? 0, [album]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f7f9fc",
        }}
      >
        <CircularProgress />
      </Box>
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

  if (!album) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h5">No se encontró el álbum.</Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f7f9fc",
        pb: 6,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            borderRadius: "28px",
            background: "#ffffff",
            border: "1px solid #dbeafe",
            boxShadow: "0 18px 50px rgba(15,23,42,0.10)",
          }}
        >
          <Grid container sx={{ alignItems: "stretch" }}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  height: "100%",
                  minHeight: { xs: 300, md: 430 },
                  position: "relative",
                  overflow: "hidden",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                }}
              >
                <Box
                  component="img"
                  src={coverSrc}
                  alt={album.titulo}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    imageFallback(e, DEFAULT_ALBUM_IMAGE);
                    setCoverSrc(DEFAULT_ALBUM_IMAGE);
                  }}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background: "linear-gradient(to top, rgba(13,110,253,0.06), transparent)",
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={8} sx={{ display: "flex" }}>
              <Box
                sx={{
                  p: { xs: 3, md: 5 },
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: "#64748b",
                    letterSpacing: 1.5,
                    mb: 1,
                  }}
                >
                  ÁLBUM
                </Typography>

                <Typography
                  variant="h3"
                  sx={{
                    color: "#0d6efd",
                    fontWeight: 800,
                    lineHeight: 1.08,
                    mb: 1.5,
                    fontSize: { xs: "2rem", md: "3rem" },
                  }}
                >
                  {album.titulo}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: "#2563eb",
                    fontWeight: 500,
                    mb: 2.5,
                  }}
                >
                  {album.artista || "Artista desconocido"}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.2}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Chip
                      label={`Género: ${album.genero ?? "-"}`}
                      sx={{
                        backgroundColor: "#eff6ff",
                        color: "#0d6efd",
                        border: "1px solid #bfdbfe",
                      }}
                    />

                    <Chip
                      label={`Año: ${album.anyo ?? "-"}`}
                      sx={{
                        backgroundColor: "#eff6ff",
                        color: "#0d6efd",
                        border: "1px solid #bfdbfe",
                      }}
                    />

                    <Chip
                      label={`Canciones: ${numeroCanciones}`}
                      sx={{
                        backgroundColor: "#eff6ff",
                        color: "#0d6efd",
                        border: "1px solid #bfdbfe",
                      }}
                    />
                  </Stack>

                  <Tooltip title="Volver">
                    <IconButton
                      onClick={() => (returnTo ? navigate(returnTo) : navigate("/albums"))}
                      size="small"
                      sx={{
                        flexShrink: 0,
                        color: "#0d6efd",
                        backgroundColor: "#ffffff",
                        border: "1px solid #0d6efd",
                        width: 34,
                        height: 34,
                        mt: "2px",
                        "&:hover": {
                          backgroundColor: "#eff6ff",
                        },
                      }}
                    >
                      <FaArrowLeft size={14} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Box
          sx={{
            mt: 5,
            backgroundColor: "#f7f9fc",
            borderRadius: "24px",
            px: { xs: 0, md: 1 },
            py: { xs: 1, md: 2 },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#0d6efd",
              mb: 3,
            }}
          >
            Canciones
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2.5 },
              borderRadius: "22px",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
              overflow: "hidden",
            }}
          >
            <CancionesTabla canciones={album.canciones || []} />
          </Paper>
        </Box>
      </Container>

      <Snackbar open={!!errorMsg} autoHideDuration={6000} onClose={() => setErrorMsg("")}>
        <Alert severity="error" onClose={() => setErrorMsg("")}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AlbumDetail;
