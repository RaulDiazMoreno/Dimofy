import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Pagination,
} from "@mui/material";
import { FaArrowLeft } from "react-icons/fa";

interface Album {
  idAlbum: number;
  titulo: string;
  artista: string;
  genero: string;
  anyo: string;
  cover: string;
}

const normalizeFileName = (value?: string) => {
  if (!value) return "";
  const fileName = value.split("\\").pop()?.split("/").pop() ?? "";
  return fileName.replace(/\.(jpg|jpeg|png)$/i, ".webp");
};

const buildAlbumImage = (cover?: string, size: "thumb" | "full" = "thumb") => {
  const fileName = normalizeFileName(cover);
  if (!fileName) return "/assets/Cover/default.webp";
  return size === "thumb"
    ? `/assets/Cover/thumbs/${fileName}`
    : `/assets/Cover/${fileName}`;
};

const AlbumsPorGenero = () => {
  const { idGenero } = useParams();
  const navigate = useNavigate();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [nombreGenero, setNombreGenero] = useState("");

  const albumsPerPage = 6;

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) return;

        const { token } = JSON.parse(userData);

        const response = await fetch(`http://localhost:8080/app/albums/genero/${idGenero}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar los álbumes");
        }

        const raw = await response.json();
        const data: Album[] = Array.isArray(raw) ? raw : raw.items ?? [];

        setAlbums(data);

        const generoFromArray = data[0]?.genero ?? "";
        const generoFromObject = !Array.isArray(raw) ? raw.genero ?? "" : "";
        setNombreGenero(generoFromObject || generoFromArray);
      } catch (error) {
        console.error("Error al cargar álbumes:", error);
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    };

    setCurrentPage(1);
    setLoading(true);
    fetchAlbums();
  }, [idGenero]);

  const totalPages = Math.ceil(albums.length / albumsPerPage);

  const currentAlbums = useMemo(() => {
    return albums.slice((currentPage - 1) * albumsPerPage, currentPage * albumsPerPage);
  }, [albums, currentPage]);

  return (
    <Box sx={{ padding: "2rem" }}>
      {!loading && albums.length > 0 && (
        <Box sx={{ marginTop: "2rem" }}>
          <Typography variant="h5" gutterBottom>
            Álbumes de {nombreGenero} ({albums.length})
          </Typography>

          <Grid container spacing={3}>
            {currentAlbums.map((album, idx) => (
              <Grid item xs={12} sm={6} md={4} key={album.idAlbum}>
                <RouterLink to={`/albums/${album.idAlbum}`} style={{ textDecoration: "none" }}>
                  <Card
                    sx={{
                      backgroundColor: "#121212",
                      color: "#fff",
                      borderRadius: 2,
                      transition: "transform 0.3s",
                      "&:hover": {
                        transform: "scale(1.03)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                        backgroundColor: "#0f0f0f",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={buildAlbumImage(album.cover, "thumb")}
                        alt={album.titulo}
                        loading={currentPage === 1 && idx < 3 ? "eager" : "lazy"}
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

                    <CardContent sx={{ pb: 2 }}>
                      <Typography
                        variant="subtitle1"
                        title={album.titulo}
                        sx={{
                          fontWeight: 600,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minHeight: "3.2em",
                          lineHeight: 1.6,
                        }}
                      >
                        {album.titulo}
                      </Typography>

                      <Typography
                        variant="body2"
                        noWrap
                        title={album.artista}
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {album.artista}
                      </Typography>

                      <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                        Año: {album.anyo}
                      </Typography>
                    </CardContent>
                  </Card>
                </RouterLink>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, value) => setCurrentPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}

      {!loading && albums.length === 0 && (
        <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 4 }}>
          No se encontraron álbumes para este género.
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: "3rem" }}>
        <Button
          variant="contained"
          color="warning"
          onClick={() => navigate("/generos")}
          startIcon={<FaArrowLeft />}
          aria-label="Volver al inicio"
        >
          Volver
        </Button>
      </Box>
    </Box>
  );
};

export default AlbumsPorGenero;



