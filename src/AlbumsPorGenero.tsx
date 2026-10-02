import { useParams, useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Box, Grid, Typography, Card, CardContent, Button } from "@mui/material";
import { FaArrowLeft } from "react-icons/fa";
import PaginationControls from "./PaginationControls";
import LazyImage from "./dashboard/components/LazyImage";
import { DEFAULT_ALBUM_IMAGE, getAlbumImage } from "./utils/imagePaths";

interface Album {
  idAlbum: number;
  titulo: string;
  artista?: string;
  genero?: string;
  anyo?: string;
  cover?: string;
}

const ALBUMS_PER_PAGE = 12;

const AlbumsPorGenero = () => {
  const { idGenero } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [nombreGenero, setNombreGenero] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchAlbums = async () => {
      setLoading(true);
      try {
        const userData = localStorage.getItem("user");
        if (!userData) return;
        const { token } = JSON.parse(userData);
        const response = await fetch(`http://localhost:8080/app/albums/genero/${idGenero}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("No se pudieron cargar los álbumes");
        const raw = await response.json();
        const data: Album[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.content)
            ? raw.content
            : Array.isArray(raw.items)
              ? raw.items
              : [];
        if (cancelled) return;
        setAlbums(data);
        setNombreGenero((!Array.isArray(raw) ? raw.genero : "") || data[0]?.genero || "");
      } catch (error) {
        console.error("Error al cargar álbumes:", error);
        if (!cancelled) setAlbums([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    setCurrentPage(1);
    void fetchAlbums();
    return () => { cancelled = true; };
  }, [idGenero]);

  const totalPages = Math.max(1, Math.ceil(albums.length / ALBUMS_PER_PAGE));
  const currentAlbums = useMemo(() => {
    const start = (currentPage - 1) * ALBUMS_PER_PAGE;
    return albums.slice(start, start + ALBUMS_PER_PAGE);
  }, [albums, currentPage]);

  return (
    <Box sx={{ minHeight: "100vh", background: "#050505", p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800 }}>
            Álbumes de {nombreGenero || "género"}{!loading ? ` (${albums.length})` : ""}
          </Typography>
          <Button variant="contained" color="warning" onClick={() => navigate("/generos")} startIcon={<FaArrowLeft />}>
            Volver
          </Button>
        </Box>

        {!loading && currentAlbums.length > 0 && (
          <Grid container spacing={3}>
            {currentAlbums.map((album, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={album.idAlbum}>
                <RouterLink
                  to={`/albums/${album.idAlbum}`}
                  state={{ returnTo: `${location.pathname}${location.search}` }}
                  style={{ textDecoration: "none" }}
                >
                  <Card sx={{
                    height: "100%", borderRadius: "22px", overflow: "hidden", background: "#fff",
                    color: "#0f172a", border: "1px solid #e5e7eb",
                    boxShadow: "0 10px 30px rgba(15,23,42,.08)",
                    transition: "transform .22s ease, box-shadow .22s ease",
                    "&:hover": { transform: "translateY(-6px)", boxShadow: "0 18px 40px rgba(15,23,42,.14)" },
                  }}>
                    <Box sx={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden", background: "#e5e7eb", "& img": { width: "100%", height: "100%", objectFit: "cover", display: "block" } }}>
                      <LazyImage
                        src={getAlbumImage(album.cover || "")}
                        alt={album.titulo}
                        eager={currentPage === 1 && index < 4}
                        fetchPriority={currentPage === 1 && index < 4 ? "high" : "low"}
                        rootMargin="120px"
                        onError={(e) => { if (!e.currentTarget.src.endsWith(DEFAULT_ALBUM_IMAGE)) e.currentTarget.src = DEFAULT_ALBUM_IMAGE; }}
                      />
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.35, minHeight: 44, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {album.titulo}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b", mt: 1, fontWeight: 500 }}>
                        Año: {album.anyo || "-"}
                      </Typography>
                    </CardContent>
                  </Card>
                </RouterLink>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && albums.length === 0 && <Typography sx={{ color: "#cbd5e1", textAlign: "center", mt: 5 }}>No se encontraron álbumes para este género.</Typography>}

        {!loading && totalPages > 1 && (
          <Box sx={{ mt: 3, pb: 1, "& .MuiTypography-root": { color: "#fff", fontWeight: 600 }, "& .MuiButton-root": { color: "#fff", borderColor: "rgba(255,255,255,.45)", fontWeight: 600 } }}>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AlbumsPorGenero;
