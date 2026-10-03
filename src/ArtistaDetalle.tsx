import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
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
import PaginationControls from "./PaginationControls";
import { DEFAULT_ALBUM_IMAGE, DEFAULT_ARTIST_IMAGE, getAlbumImage, getAlbumThumbnail, getArtistImage, imageFallback, imageThumbnailFallback } from "./utils/imagePaths";

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

const ALBUMS_PER_PAGE = 12;

const ArtistaDetalle: React.FC = () => {
  const { idArtista } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const artistListReturnTo =
    searchParams.get("returnTo") || "/artistas";

  const [artista, setArtista] = useState<Artista | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistImgSrc, setArtistImgSrc] = useState(DEFAULT_ARTIST_IMAGE);
  const [currentAlbumPage, setCurrentAlbumPage] = useState(() => {
    const pageParam = Number(searchParams.get("page"));
    return Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  });

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
      setArtistImgSrc(getArtistImage(artistaData?.foto));

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
      setArtistImgSrc(DEFAULT_ARTIST_IMAGE);
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
    img.src = getArtistImage(artista.foto);
  }, [artista]);

  const resumen = useMemo(() => {
    if (!artista?.resumenWikipedia) {
      return "No hay información disponible para este artista.";
    }
    return artista.resumenWikipedia;
  }, [artista]);

  const totalAlbumPages = useMemo(
    () => Math.max(1, Math.ceil(albums.length / ALBUMS_PER_PAGE)),
    [albums.length]
  );

  const paginatedAlbums = useMemo(() => {
    const start = (currentAlbumPage - 1) * ALBUMS_PER_PAGE;
    return albums.slice(start, start + ALBUMS_PER_PAGE);
  }, [albums, currentAlbumPage]);

  useEffect(() => {
    const pageParam = Number(searchParams.get("page"));
    setCurrentAlbumPage(
      Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
    );
  }, [idArtista, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const currentParam = params.get("page");
    const nextParam = String(currentAlbumPage);

    if (currentParam !== nextParam) {
      params.set("page", nextParam);
      setSearchParams(params, { replace: true });
    }
  }, [currentAlbumPage, searchParams, setSearchParams]);

  useEffect(() => {
    // No corregimos la página mientras se están cargando los álbumes.
    // Durante la carga albums = [] y totalAlbumPages vale temporalmente 1,
    // lo que antes provocaba que ?page=3, ?page=4, etc. se resetearan a 1.
    if (loading) {
      return;
    }

    if (currentAlbumPage > totalAlbumPages) {
      setCurrentAlbumPage(totalAlbumPages);
    }
  }, [loading, currentAlbumPage, totalAlbumPages]);

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
          onClick={() => navigate(artistListReturnTo)}
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
          "linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%)",
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
            border: "1px solid #dbe7fb",
            boxShadow: "0 18px 55px rgba(15, 23, 42, 0.10)",
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
                  background: "#f8fbff",
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
                    imageFallback(e, DEFAULT_ARTIST_IMAGE);
                    setArtistImgSrc(DEFAULT_ARTIST_IMAGE);
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
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    color: "#0d6efd",
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
                        backgroundColor: "#eef5ff",
                        color: "#0d6efd",
                        border: "1px solid #bfd5ff",
                      }}
                    />
                    <Chip
                      label={`País: ${artista.paises?.nombre ?? "-"}`}
                      sx={{
                        backgroundColor: "#f3f8ff",
                        color: "#0d6efd",
                        border: "1px solid #cfe0ff",
                      }}
                    />
                    <Chip
                      label={`Inicio: ${artista.anyoInicio ?? "-"}`}
                      sx={{
                        backgroundColor: "#f8fbff",
                        color: "#0d6efd",
                        border: "1px solid #dbe7fb",
                      }}
                    />
                  </Stack>

                  <Tooltip title="Volver">
                    <IconButton
                      onClick={() => navigate(artistListReturnTo)}
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
                          backgroundColor: "#eef5ff",
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
                    backgroundColor: "#f8fbff",
                    border: "1px solid #dbe7fb",
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
                      color: "#0d6efd",
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
                      scrollbarColor: "#9bbcf3 transparent",
                      "&::-webkit-scrollbar": {
                        width: "8px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "transparent",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#9bbcf3",
                        borderRadius: "999px",
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#0d6efd",
                      },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#334155",
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
              mt: 2,
              backgroundColor: "transparent",
              borderRadius: "24px",
              px: { xs: 2, md: 3 },
              py: { xs: 2, md: 2.5 },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#0d6efd",
                mb: 2.5,
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
              {paginatedAlbums.map((album, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={album.idAlbum}>
                  <RouterLink
                    to={`/albums/${album.idAlbum}`}
                    state={{
                      returnTo: `/artistas/${idArtista}?page=${currentAlbumPage}&returnTo=${encodeURIComponent(
                        artistListReturnTo
                      )}`,
                    }}
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
                          image={getAlbumThumbnail(album.cover)}
                          alt={album.titulo}
                          loading={currentAlbumPage === 1 && index < 4 ? "eager" : "lazy"}
                          decoding="async"
                          fetchPriority={currentAlbumPage === 1 && index < 4 ? "high" : "low"}
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => imageThumbnailFallback(e, getAlbumImage(album.cover), DEFAULT_ALBUM_IMAGE)}
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

          {albums.length > ALBUMS_PER_PAGE && (
            <Box
              sx={{
                mt: 2.5,
                pb: 1,
                "& .MuiTypography-root": {
                  color: "#0d6efd",
                  fontWeight: 700,
                },
                "& .MuiButton-root": {
                  color: "#0d6efd",
                  border: "1px solid #0d6efd",
                  borderColor: "#0d6efd",
                  backgroundColor: "#ffffff",
                  fontWeight: 600,
                  borderRadius: "8px",
                  px: 1.5,
                  "&:hover": {
                    color: "#ffffff",
                    backgroundColor: "#0d6efd",
                    borderColor: "#0d6efd",
                  },
                  "&.Mui-disabled": {
                    color: "#9bbcf3",
                    borderColor: "#cfe0ff",
                    backgroundColor: "#f8fbff",
                  },
                },
              }}
            >
              <PaginationControls
                currentPage={currentAlbumPage}
                totalPages={totalAlbumPages}
                setCurrentPage={setCurrentAlbumPage}
              />
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default ArtistaDetalle;


