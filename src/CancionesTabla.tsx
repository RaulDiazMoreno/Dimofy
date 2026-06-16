import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { FaClock } from "react-icons/fa";

interface Cancion {
  id: number;
  titulo: string;
  duracion: string;
}

interface Props {
  canciones: Cancion[];
}

const formatDuration = (value?: string) => {
  if (!value) return "-";
  return value;
};

export default function CancionesTabla({ canciones }: Props) {
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
          gridTemplateColumns: "70px 1fr 100px",
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
                gridTemplateColumns: "70px 1fr 100px",
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
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}