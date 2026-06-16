import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Container,
  Chip,
  Stack,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { FaArrowLeft } from "react-icons/fa";

interface Album {
  idAlbum: number;
  titulo: string;
  cover: string;
  anyo: string;
}

interface Artista {
  idArtista: number;
  nombre: string;
  foto: string;
  generos: { nombreGenero: string };
  paises: { nombre: string; bandera: string };
  anyoInicio: string;
  resumenWikipedia: string;
}

const normalizeFileName = (value?: string) => {
  if (!value) return "";
  const fileName = value.split("\\").pop()?.split("/").pop() ?? "";
  return fileName.replace(/\.(jpg|jpeg|png)$/i, ".webp");
};

const buildArtistImage = (foto?: string, size: "thumb" | "full" = "full") => {
  const fileName = normalizeFileName(foto);
  if (!fileName) return "/assets/Artistas/default.webp";
  return size === "thumb"
    ? `/assets/Artistas/thumbs/${fileName}`
    : `/assets/Artistas/${fileName}`;
};

const buildAlbumImage = (cover?: string, size: "thumb" | "full" = "thumb") => {
  const fileName = normalizeFileName(cover);
  if (!fileName) return "/assets/Cover/default.webp";
  return size === "thumb"
    ? `/assets/Cover/thumbs/${fileName}`
    : `/assets/Cover/${fileName}`;
};

const ArtistaDetalle: React.FC = () => {
  const { idArtista } = useParams();
  const navigate = useNavigate();

  const [artista, setArtista] = useState<Artista | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistImgSrc, setArtistImgSrc] = useState("/assets/Artistas/default.webp");

  const fetchArtistaData = useCallback(async () => {
    try {
      setLoading(true);

      const userData = localStorage.getItem("user");
      if (!userData) throw new Error("Usuario no autenticado");

      const { token } = JSON.parse(userData);

      const resArtista = await fetch(`http://localhost:8080/app/artistas/${idArtista}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resArtista.ok) throw new Error("Artista no encontrado");
      const artistaData = await resArtista.json();
      setArtista(artistaData);
      setArtistImgSrc(buildArtistImage(artistaData?.foto, "full"));

      const resAlbums = await fetch(`http://localhost:8080/app/albums/artista/${idArtista}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resAlbums.ok) throw new Error("Álbumes no encontrados");
      const albumsData = await resAlbums.json();
      setAlbums(Array.isArray(albumsData) ? albumsData : []);
    } catch (error) {
      console.error("Error al cargar datos del artista:", error);
      setArtista(null);
      setAlbums([]);
      setArtistImgSrc("/assets/Artistas/default.webp");
    } finally {
      setLoading(false);
    }
  }, [idArtista]);

  useEffect(() => {
    fetchArtistaData();
  }, [fetchArtistaData]);

  useEffect(() => {
    if (!artista?.foto) return;
    const img = new Image();
    img.src = buildArtistImage(artista.foto, "full");
  }, [artista]);

  const resumen = useMemo(() => {
    if (!artista?.resumenWikipedia) {
      return "No hay información disponible para este artista.";
    }
    return artista.resumenWikipedia;
  }, [artista]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "#f7f9fc",
          pb: 6,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!artista) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h5">No se encontró el artista.</Typography>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{ mt: 3, borderRadius: "999px" }}
        >
          Volver
        </Button>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0f172a 0%, #111827 52%, #f7f9fc 52%, #f7f9fc 100%)",
        pb: 6,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            borderRadius: "28px",
            background:
              "linear-gradient(135deg, rgba(30,41,59,0.96), rgba(15,23,42,0.92))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 70px rgba(0,0,0,0.28)",
          }}
        >
          <Grid container sx={{ alignItems: "stretch" }}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  height: "100%",
                  minHeight: { xs: 280, md: 420 },
                  position: "relative",
                  overflow: "hidden",
                  background:
                    "radial-gradient(circle at center, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                }}
              >
                <Box
                  component="img"
                  src={artistImgSrc}
                  alt={artista.nombre}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const current = e.currentTarget;
                    if (current.dataset.fallback === "full-tried") {
                      current.src = "/assets/Artistas/default.webp";
                      return;
                    }
                    current.dataset.fallback = "full-tried";
                    setArtistImgSrc("/assets/Artistas/default.webp");
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
                    background:
                      "linear-gradient(to top, rgba(15,23,42,0.55), rgba(15,23,42,0.04))",
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
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    color: "#fff",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    mb: 2,
                    fontSize: { xs: "2rem", md: "3rem" },
                  }}
                >
                  {artista.nombre}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 1.5,
                    mb: 3,
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
                      label={`Género: ${artista.generos?.nombreGenero ?? "-"}`}
                      sx={{
                        backgroundColor: "rgba(59,130,246,0.18)",
                        color: "#dbeafe",
                        border: "1px solid rgba(96,165,250,0.24)",
                      }}
                    />
                    <Chip
                      label={`País: ${artista.paises?.nombre ?? "-"}`}
                      sx={{
                        backgroundColor: "rgba(16,185,129,0.16)",
                        color: "#d1fae5",
                        border: "1px solid rgba(52,211,153,0.22)",
                      }}
                    />
                    <Chip
                      label={`Inicio: ${artista.anyoInicio ?? "-"}`}
                      sx={{
                        backgroundColor: "rgba(168,85,247,0.16)",
                        color: "#f3e8ff",
                        border: "1px solid rgba(192,132,252,0.22)",
                      }}
                    />
                  </Stack>

                  <Tooltip title="Volver">
                    <IconButton
                      onClick={() => navigate(-1)}
                      size="small"
                      sx={{
                        flexShrink: 0,
                        color: "#fff",
                        backgroundColor: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        width: 34,
                        height: 34,
                        mt: "2px",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.16)",
                        },
                      }}
                    >
                      <FaArrowLeft size={14} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)",
                    height: { xs: 220, md: 280 },
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color: "rgba(255,255,255,0.72)",
                      letterSpacing: 1.2,
                      display: "block",
                      mb: 1.5,
                      flexShrink: 0,
                    }}
                  >
                    BIOGRAFÍA
                  </Typography>

                  <Box
                    sx={{
                      overflowY: "auto",
                      pr: 1,
                      flex: 1,
                      minHeight: 0,
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(255,255,255,0.25) transparent",
                      "&::-webkit-scrollbar": {
                        width: "8px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "transparent",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(255,255,255,0.22)",
                        borderRadius: "999px",
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "rgba(255,255,255,0.34)",
                      },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#e5e7eb",
                        lineHeight: 1.85,
                        fontSize: "1rem",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {resumen}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Box
            sx={{
              mt: 5,
              backgroundColor: "#f7f9fc",
              borderRadius: "24px",
              px: { xs: 2, md: 3 },
              py: { xs: 3, md: 4 },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                mb: 3,
              }}
            >
              Álbumes
            </Typography>

          {albums.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "22px",
                background: "#fff",
                border: "1px solid #e5e7eb",
              }}
            >
              <Typography sx={{ color: "#475569" }}>
                Este artista no tiene álbumes disponibles.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {albums.map((album, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={album.idAlbum}>
                  <RouterLink
                    to={`/albums/${album.idAlbum}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: "22px",
                        overflow: "hidden",
                        background: "#ffffff",
                        color: "#0f172a",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                        transition: "transform 0.22s ease, box-shadow 0.22s ease",
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: "0 18px 40px rgba(15,23,42,0.14)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "1 / 1",
                          overflow: "hidden",
                          background: "#e5e7eb",
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={buildAlbumImage(album.cover, "thumb")}
                          alt={album.titulo}
                          loading={index < 4 ? "eager" : "lazy"}
                          decoding="async"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            const current = e.currentTarget;
                            if (current.dataset.fallback === "full-tried") {
                              current.src = "/assets/Cover/default.webp";
                              return;
                            }
                            current.dataset.fallback = "full-tried";
                            current.src = buildAlbumImage(album.cover, "full");
                          }}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </Box>

                      <CardContent sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            color: "#0f172a",
                            lineHeight: 1.35,
                            minHeight: 44,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {album.titulo}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: "#64748b",
                            mt: 1,
                            fontWeight: 500,
                          }}
                        >
                          Año: {album.anyo || "-"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </RouterLink>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default ArtistaDetalle;


