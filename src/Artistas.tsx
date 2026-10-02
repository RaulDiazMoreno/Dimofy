import React, { useEffect, useMemo, useState } from "react";
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
  Snackbar,
  Alert,
  useMediaQuery,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { FaArrowLeft } from "react-icons/fa";
import { useUser } from "./UserContext";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import PaginationControls from "./PaginationControls";
import generosData from "./generos.json";
import paisesData from "./Paises.json";
import "./canciones-dark.css";
import { DEFAULT_ARTIST_IMAGE, getArtistImage, getArtistThumbnail, imageThumbnailFallback } from "./utils/imagePaths";

interface Artista {
  idArtista: number;
  nombre: string;
  anyoInicio: string;
  foto: string;
  resumenWikipedia: string;
  generos: { nombreGenero: string };
  paises: { nombre: string };
}

interface Genero {
  id: number;
  nombreGenero: string;
}

interface Pais {
  id: number;
  nombre: string;
  bandera: string;
}

const Artistas: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  useUser();

  const initialFilters = useMemo(
    () => ({
      nombre: searchParams.get("nombre") ?? "",
      genero: searchParams.get("genero") ?? "",
      anyoInicio: searchParams.get("anyoInicio") ?? "",
      pais: searchParams.get("pais") ?? "",
    }),
    []
  );

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(searchParams.get("page"));
    return Number.isFinite(page) && page > 0 ? page : 1;
  });
  const [hasSearched, setHasSearched] = useState(
    searchParams.get("buscar") === "1"
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isSmall = useMediaQuery("(max-width:600px)");
  const artistasPerPage = isSmall ? 6 : 12;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (filters.anyoInicio && !/^\d{4}$/.test(filters.anyoInicio)) {
      errs.anyoInicio = "El año debe ser un número de 4 cifras";
    }
    if (filters.nombre && /[^a-zA-Z0-9 áéíóúÁÉÍÓÚüÜñÑ\-.,]/.test(filters.nombre)) {
      errs.nombre = "El nombre contiene caracteres no permitidos";
    }
    return errs;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name!]: value }));
    setErrors((prev) => ({ ...prev, [name!]: "" }));
  };

  const buscarArtistas = async (
    searchFilters: typeof filters,
    resetPage: boolean
  ) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const userData = localStorage.getItem("user");
      if (!userData) throw new Error("Usuario no autenticado");

      const { token } = JSON.parse(userData);
      const params = new URLSearchParams(
        Object.entries(searchFilters).reduce<Record<string, string>>(
          (acc, [k, v]) => {
            if (v) acc[k] = v;
            return acc;
          },
          {}
        )
      ).toString();

      const response = await fetch(
        `http://localhost:8080/app/artistas/buscar?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setArtistas(Array.isArray(data) ? data : []);
      setAppliedFilters(searchFilters);
      setHasSearched(true);

      if (resetPage) {
        setCurrentPage(1);
      }
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error ? error.message : "Error al buscar artistas"
      );
      setArtistas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = async () => {
    const errs = validate();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    await buscarArtistas(filters, true);
  };

  const handleLimpiar = () => {
    const emptyFilters = {
      nombre: "",
      genero: "",
      anyoInicio: "",
      pais: "",
    };

    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setErrors({});
    setArtistas([]);
    setCurrentPage(1);
    setHasSearched(false);
    setSearchParams({}, { replace: true });
  };

  // Al volver desde ArtistaDetalle reconstruimos automáticamente
  // la búsqueda que estaba activa, sin resetear la página.
  useEffect(() => {
    if (searchParams.get("buscar") !== "1") {
      return;
    }

    void buscarArtistas(initialFilters, false);
    // Solo debe ejecutarse al montar el listado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardamos página y filtros aplicados en la URL.
  useEffect(() => {
    if (!hasSearched) {
      return;
    }

    const params = new URLSearchParams();

    params.set("page", String(currentPage));
    params.set("buscar", "1");

    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    setSearchParams(params, { replace: true });
  }, [
    currentPage,
    appliedFilters,
    hasSearched,
    setSearchParams,
  ]);


  const currentArtistas = useMemo(() => {
    const indexOfLastArtista = currentPage * artistasPerPage;
    const indexOfFirstArtista = indexOfLastArtista - artistasPerPage;
    return artistas.slice(indexOfFirstArtista, indexOfLastArtista);
  }, [artistas, currentPage, artistasPerPage]);

  const totalPages = Math.ceil(artistas.length / artistasPerPage);

  const artistListReturnTo = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(currentPage));
    params.set("buscar", "1");

    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    return `/artistas?${params.toString()}`;
  }, [currentPage, appliedFilters]);


  const darkPageTheme = createTheme({
    palette: {
      mode: "dark",
      background: { default: "#070a0e", paper: "rgba(10, 14, 20, .62)" },
      text: {
        primary: "rgba(255,255,255,.92)",
        secondary: "rgba(255,255,255,.65)",
      },
    },
    shape: { borderRadius: 14 },
  });

  return (
    <ThemeProvider theme={darkPageTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          py: 3,
          background:
            "radial-gradient(1200px 700px at 10% -10%, rgba(120,119,198,0.18), transparent 45%), radial-gradient(1000px 600px at 100% 0%, rgba(255,110,196,0.14), transparent 40%), linear-gradient(180deg, #070a0e 0%, #0b1117 100%)",
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              borderRadius: 4,
              p: { xs: 2, md: 3 },
              background: "rgba(8,12,18,.55)",
              border: "1px solid rgba(255,255,255,.08)",
              boxShadow: "0 24px 80px rgba(0,0,0,.45)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
              Buscar artistas
            </Typography>

            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombre"
                  value={filters.nombre}
                  onChange={handleInputChange}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                  sx={{
                    "& .MuiInputLabel-root": { color: "rgba(255,255,255,.65)" },
                    "& .MuiFormHelperText-root": { color: "rgba(255,150,150,.85)" },
                    "& .MuiOutlinedInput-root": {
                      background: "rgba(0,0,0,.35)",
                      borderRadius: 2,
                      color: "rgba(255,255,255,.92)",
                      "& fieldset": { borderColor: "rgba(255,255,255,.12)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,.18)" },
                      "&.Mui-focused fieldset": {
                        borderColor: "rgba(255,255,255,.22)",
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl
                  fullWidth
                  sx={{
                    "& .MuiInputLabel-root": { color: "rgba(255,255,255,.65)" },
                    "& .MuiOutlinedInput-root": {
                      background: "rgba(0,0,0,.35)",
                      borderRadius: 2,
                      "& fieldset": { borderColor: "rgba(255,255,255,.12)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,.18)" },
                      "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,.22)" },
                    },
                  }}
                >
                  <InputLabel id="genero-label">Género</InputLabel>
                  <Select
                    labelId="genero-label"
                    name="genero"
                    value={filters.genero}
                    onChange={handleSelectChange}
                    label="Género"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: "#0b0f14",
                          border: "1px solid rgba(255,255,255,.10)",
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {(generosData as Genero[]).map((genero) => (
                      <MenuItem key={genero.id} value={genero.nombreGenero}>
                        {genero.nombreGenero}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Año de inicio"
                  name="anyoInicio"
                  value={filters.anyoInicio}
                  onChange={handleInputChange}
                  error={!!errors.anyoInicio}
                  helperText={errors.anyoInicio}
                  sx={{
                    "& .MuiInputLabel-root": { color: "rgba(255,255,255,.65)" },
                    "& .MuiFormHelperText-root": { color: "rgba(255,150,150,.85)" },
                    "& .MuiOutlinedInput-root": {
                      background: "rgba(0,0,0,.35)",
                      borderRadius: 2,
                      color: "rgba(255,255,255,.92)",
                      "& fieldset": { borderColor: "rgba(255,255,255,.12)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,.18)" },
                      "&.Mui-focused fieldset": {
                        borderColor: "rgba(255,255,255,.22)",
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl
                  fullWidth
                  sx={{
                    "& .MuiInputLabel-root": { color: "rgba(255,255,255,.65)" },
                    "& .MuiOutlinedInput-root": {
                      background: "rgba(0,0,0,.35)",
                      borderRadius: 2,
                      "& fieldset": { borderColor: "rgba(255,255,255,.12)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,.18)" },
                      "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,.22)" },
                    },
                  }}
                >
                  <InputLabel id="pais-label">País</InputLabel>
                  <Select
                    labelId="pais-label"
                    name="pais"
                    value={filters.pais}
                    onChange={handleSelectChange}
                    label="País"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: "#0b0f14",
                          border: "1px solid rgba(255,255,255,.10)",
                        },
                      },
                    }}
                  >
                    <MenuItem value="">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        Todos
                      </Box>
                    </MenuItem>

                    {(paisesData as Pais[]).map((pais) => (
                      <MenuItem key={pais.id} value={pais.nombre}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <img
                            src={pais.bandera}
                            alt={pais.nombre}
                            width={24}
                            height={16}
                            style={{ borderRadius: 4 }}
                          />
                          {pais.nombre}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 1.2, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
              <Button
                onClick={handleBuscar}
                sx={{
                  height: 38,
                  px: 2,
                  fontWeight: 800,
                  borderRadius: 2,
                  color: "#fff",
                  background:
                    "linear-gradient(135deg, rgba(255,110,196,.92), rgba(120,115,245,.92))",
                  boxShadow: "0 10px 24px rgba(0,0,0,.35)",
                  "&:hover": { filter: "brightness(1.05)" },
                }}
              >
                Buscar
              </Button>

              <Button
                onClick={handleLimpiar}
                sx={{
                  height: 38,
                  px: 2,
                  fontWeight: 800,
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,.14)",
                  color: "rgba(255,255,255,.92)",
                  background: "rgba(255,255,255,.08)",
                  "&:hover": {
                    background: "rgba(255,255,255,.12)",
                    borderColor: "rgba(255,255,255,.22)",
                  },
                }}
              >
                Limpiar
              </Button>
            </Box>

            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress />
              </Box>
            )}

            {errorMsg && (
              <Snackbar open autoHideDuration={6000} onClose={() => setErrorMsg("")}>
                <Alert severity="error" onClose={() => setErrorMsg("")}>
                  {errorMsg}
                </Alert>
              </Snackbar>
            )}

            {!loading && artistas.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>
                  Resultados ({artistas.length})
                </Typography>

                <Grid container spacing={2}>
                  {currentArtistas.map((artista, index) => (
                    <Grid item xs={12} sm={6} md={3} key={artista.idArtista}>
                      <Link
                        to={`/artistas/${artista.idArtista}?page=1&returnTo=${encodeURIComponent(
                          artistListReturnTo
                        )}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Card
                          sx={{
                            borderRadius: 2,
                            overflow: "hidden",
                            background: "rgba(0,0,0,.35)",
                            border: "1px solid rgba(255,255,255,.10)",
                            boxShadow: "0 10px 24px rgba(0,0,0,.45)",
                            transition: "transform 160ms ease, border-color 160ms ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              borderColor: "rgba(255,255,255,.18)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              aspectRatio: "1 / 1",
                              overflow: "hidden",
                              background: "#111827",
                            }}
                          >
                            <CardMedia
                              component="img"
                              loading={currentPage === 1 && index < 4 ? "eager" : "lazy"}
                              decoding="async"
                              fetchPriority={currentPage === 1 && index < 4 ? "high" : "low"}
                              image={getArtistThumbnail(artista.foto)}
                              alt={artista.nombre}
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => imageThumbnailFallback(e, getArtistImage(artista.foto), DEFAULT_ARTIST_IMAGE)}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          </Box>
                          <CardContent sx={{ py: 1.2 }}>
                            <Typography
                              variant="subtitle1"
                              noWrap
                              sx={{ fontWeight: 800, color: "rgba(255,255,255,.92)" }}
                            >
                              {artista.nombre}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "rgba(255,255,255,.65)" }}
                            >
                              Año: {artista.anyoInicio}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Link>
                    </Grid>
                  ))}
                </Grid>

                {totalPages > 1 && (
                  <Box sx={{ mt: 2 }}>
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      setCurrentPage={setCurrentPage}
                    />
                  </Box>
                )}
              </Box>
            )}

            {!loading && artistas.length === 0 && (
              <Typography
                variant="body1"
                align="center"
                sx={{ mt: 3, color: "rgba(255,255,255,.65)" }}
              >
                No se encontraron artistas con los criterios seleccionados.
              </Typography>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                onClick={() => navigate("/home")}
                startIcon={<FaArrowLeft />}
                sx={{
                  height: 38,
                  px: 2,
                  fontWeight: 800,
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,.14)",
                  color: "rgba(255,255,255,.92)",
                  background: "rgba(255,255,255,.08)",
                  "&:hover": {
                    background: "rgba(255,255,255,.12)",
                    borderColor: "rgba(255,255,255,.22)",
                  },
                }}
              >
                Volver
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Artistas;
