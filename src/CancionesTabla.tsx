import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { FaClock, FaYoutube } from "react-icons/fa";

interface Cancion {
  id: number;
  titulo: string;
  duracion: string;
  artista?: string;
}

interface Props {
  canciones: Cancion[];
  artistaFallback?: string;
  albumTitulo?: string;
}

function esVariosArtistas(artista?: string) {
  const normalizado = (artista || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  return normalizado === "varios artistas" || normalizado === "various artists";
}

function abrirBusquedaYouTube(titulo: string, artista?: string, albumTitulo?: string) {
  // En recopilatorios, el nombre genérico del artista no ayuda a encontrar el vídeo.
  const consulta = esVariosArtistas(artista)
    ? [titulo, albumTitulo].filter(Boolean).join(" ").trim()
    : [titulo, artista].filter(Boolean).join(" ").trim();
  if (!consulta) return;
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(consulta)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

const formatDuration = (value?: string) => {
  if (!value) return "-";
  return value;
};

export default function CancionesTabla({ canciones, artistaFallback, albumTitulo }: Props) {
  if (!canciones || canciones.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: "20px",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography sx={{ color: "#64748b", fontWeight: 500 }}>
          No hay canciones disponibles para este álbum.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Cabecera */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "50px minmax(0, 1fr) 100px minmax(110px, auto)",
          alignItems: "center",
          px: { xs: 2, md: 3 },
          py: 1.2,
          color: "#64748b",
          fontSize: "0.82rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        <Box>#</Box>
        <Box>Título</Box>
        <Box sx={{ textAlign: "right" }}>Duración</Box>
        <Box sx={{ textAlign: "right" }}>YouTube</Box>
      </Box>

      <Divider />

      <Stack spacing={1} sx={{ mt: 1 }}>
        {canciones.map((cancion, index) => (
          <Paper
            key={cancion.id}
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              transition: "all 0.18s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 8px 18px rgba(15,23,42,0.06)",
                borderColor: "#dbe3ee",
                background: "#fbfdff",
              },
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "50px minmax(0, 1fr) 100px minmax(110px, auto)",
                alignItems: "center",
                px: { xs: 2, md: 3 },
                py: 1.5,
              }}
            >
              {/* número */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                {index + 1}
              </Box>

              {/* titulo */}
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#0f172a",
                  fontSize: "0.98rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {cancion.titulo}
              </Typography>

              {/* duración */}
              <Stack
                direction="row"
                spacing={0.6}
                alignItems="center"
                justifyContent="flex-end"
                sx={{ color: "#64748b" }}
              >
                <FaClock size={12} />
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "#475569",
                  }}
                >
                  {formatDuration(cancion.duracion)}
                </Typography>
              </Stack>

              {/* Búsqueda del tema en YouTube (sin API ni cambios en backend) */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", pl: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FaYoutube />}
                  onClick={() => abrirBusquedaYouTube(cancion.titulo, cancion.artista || artistaFallback, albumTitulo)}
                  aria-label={`Buscar ${cancion.titulo}${esVariosArtistas(cancion.artista || artistaFallback) ? (albumTitulo ? ` del álbum ${albumTitulo}` : "") : (cancion.artista || artistaFallback ? ` de ${cancion.artista || artistaFallback}` : "")} en YouTube`}
                  sx={{
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                    borderColor: "#d1d5db",
                    color: "#b91c1c",
                    "&:hover": { borderColor: "#b91c1c", backgroundColor: "#fef2f2" },
                  }}
                >
                  Buscar
                </Button>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}