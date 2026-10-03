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
  const [initialMode, setInitialMode] = useState(false);
  const [initials, setInitials] = useState<string[]>([]);
  const [selectedInitial, setSelectedInitial] = useState(searchParams.get("letra") ?? "");
  const [serverTotalPages, setServerTotalPages] = useState(0);
  const [serverTotalElements, setServerTotalElements] = useState(0);
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

  const noFilters = (f: typeof filters) =>
    !f.nombre.trim() && !f.genero && !f.anyoInicio.trim() && !f.pais;

  const authHeaders = () => {
    const userData = localStorage.getItem("user");
    if (!userData) throw new Error("Usuario no autenticado");
    const { token } = JSON.parse(userData);
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const cargarPaginaInicial = async (letra: string, page: number) => {
    const response = await fetch(
      `http://localhost:8080/app/artistas/inicial/${encodeURIComponent(letra)}?page=${Math.max(0, page - 1)}&size=12`,
      { headers: authHeaders() }
    );
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    const data = await response.json();
    setArtistas(Array.isArray(data.content) ? data.content : []);
    setServerTotalPages(Number(data.totalPages) || 0);
    setServerTotalElements(Number(data.totalElements) || 0);
  };

  const activarModoIniciales = async (preferredLetter?: string, preferredPage = 1) => {
    const response = await fetch("http://localhost:8080/app/artistas/iniciales", { headers: authHeaders() });
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    const letras: string[] = await response.json();
    const clean = Array.isArray(letras) ? letras.filter(Boolean) : [];
    setInitials(clean);
    setInitialMode(true);
    setAppliedFilters({ nombre: "", genero: "", anyoInicio: "", pais: "" });
    setHasSearched(true);
    if (!clean.length) { setArtistas([]); setServerTotalPages(0); setServerTotalElements(0); return; }
    const letra = preferredLetter && clean.includes(preferredLetter) ? preferredLetter : clean[0];
    setSelectedInitial(letra);
    setCurrentPage(preferredPage);
    await cargarPaginaInicial(letra, preferredPage);
  };

  const buscarArtistas = async (
    searchFilters: typeof filters,
    resetPage: boolean
  ) => {
    setLoading(true);
    setErrorMsg("");

    try {
      if (noFilters(searchFilters)) {
        await activarModoIniciales(undefined, 1);
        return;
      }
      setInitialMode(false);
      setInitials([]);
      setSelectedInitial("");
      setServerTotalPages(0);
      setServerTotalElements(0);
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
    setInitialMode(false);
    setInitials([]);
    setSelectedInitial("");
    setServerTotalPages(0);
    setServerTotalElements(0);
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

    const letra = searchParams.get("letra") ?? "";
    const page = Number(searchParams.get("page")) || 1;
    if (noFilters(initialFilters)) {
      void activarModoIniciales(letra, page);
    } else {
      void buscarArtistas(initialFilters, false);
    }
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

    if (initialMode && selectedInitial) {
      params.set("letra", selectedInitial);
    } else {
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }

    setSearchParams(params, { replace: true });
  }, [
    currentPage,
    appliedFilters,
    hasSearched,
    initialMode,
    selectedInitial,
    setSearchParams,
  ]);


  const currentArtistas = useMemo(() => {
    if (initialMode) return artistas;
    const indexOfLastArtista = currentPage * artistasPerPage;
    const indexOfFirstArtista = indexOfLastArtista - artistasPerPage;
    return artistas.slice(indexOfFirstArtista, indexOfLastArtista);
  }, [artistas, currentPage, artistasPerPage, initialMode]);

  const totalPages = initialMode ? serverTotalPages : Math.ceil(artistas.length / artistasPerPage);

  const cambiarInicial = async (letra: string) => {
    if (letra === selectedInitial) return;
    setLoading(true);
    setErrorMsg("");
    try {
      setSelectedInitial(letra);
      setCurrentPage(1);
      await cargarPaginaInicial(letra, 1);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Error al cargar artistas");
    } finally { setLoading(false); }
  };

  const cambiarPagina = (value: React.SetStateAction<number>) => {
    const next = typeof value === "function" ? value(currentPage) : value;
    setCurrentPage(next);
    if (initialMode && selectedInitial) {
      setLoading(true);
      void cargarPaginaInicial(selectedInitial, next)
        .catch(e => setErrorMsg(e instanceof Error ? e.message : "Error al cargar artistas"))
        .finally(() => setLoading(false));
    }
  };

  const artistListReturnTo = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(currentPage));
    params.set("buscar", "1");

    if (initialMode && selectedInitial) {
      params.set("letra", selectedInitial);
    } else {
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }

    return `/artistas?${params.toString()}`;
  }, [currentPage, appliedFilters, initialMode, selectedInitial]);


  const lightPageTheme = createTheme({
    palette: {
      mode: "light",
      background: { default: "#f7f9fc", paper: "#ffffff" },
      text: {
        primary: "#172033",
        secondary: "#64748b",
      },
    },
    shape: { borderRadius: 14 },
  });

  return (
    <ThemeProvider theme={lightPageTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          py: 3,
          background:
            "linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              borderRadius: 3,
              p: { xs: 2, sm: 2.5 },
              background: "#ffffff",
              border: "1px solid #dce6f2",
              boxShadow: "0 12px 36px rgba(30,64,175,.10)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, color: "#0d6efd", fontSize: { xs: "2rem", md: "2.35rem" } }}>
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
                    "& .MuiInputLabel-root": { color: "#64748b" },
                    "& .MuiFormHelperText-root": { color: "rgba(255,150,150,.85)" },
                    "& .MuiOutlinedInput-root": {
                      background: "#ffffff",
                      borderRadius: 999,
                      color: "#172033",
                      "& fieldset": { borderColor: "#e6f0fb" },
                      "&:hover fieldset": { borderColor: "#9ec5fe" },
                      "&.Mui-focused fieldset": {
                        borderColor: "#0d6efd",
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl
                  fullWidth
                  sx={{
                    "& .MuiInputLabel-root": { color: "#64748b" },
                    "& .MuiOutlinedInput-root": {
                      background: "#ffffff",
                      borderRadius: 999,
                      "& fieldset": { borderColor: "#e6f0fb" },
                      "&:hover fieldset": { borderColor: "#9ec5fe" },
                      "&.Mui-focused fieldset": { borderColor: "#0d6efd" },
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
                          backgroundColor: "#ffffff",
                          border: "1px solid #dce6f2",
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
                    "& .MuiInputLabel-root": { color: "#64748b" },
                    "& .MuiFormHelperText-root": { color: "rgba(255,150,150,.85)" },
                    "& .MuiOutlinedInput-root": {
                      background: "#ffffff",
                      borderRadius: 999,
                      color: "#172033",
                      "& fieldset": { borderColor: "#e6f0fb" },
                      "&:hover fieldset": { borderColor: "#9ec5fe" },
                      "&.Mui-focused fieldset": {
                        borderColor: "#0d6efd",
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl
                  fullWidth
                  sx={{
                    "& .MuiInputLabel-root": { color: "#64748b" },
                    "& .MuiOutlinedInput-root": {
                      background: "#ffffff",
                      borderRadius: 999,
                      "& fieldset": { borderColor: "#e6f0fb" },
                      "&:hover fieldset": { borderColor: "#9ec5fe" },
                      "&.Mui-focused fieldset": { borderColor: "#0d6efd" },
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
                          backgroundColor: "#ffffff",
                          border: "1px solid #dce6f2",
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

            <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1.1, flexWrap: "wrap" }}>
              <Button
                onClick={handleBuscar}
                startIcon={<i className="bi bi-search" aria-hidden="true" />}
                sx={{
                  height: 40,
                  width: { xs: "100%", sm: "25%" }, minWidth: 150,
                  px: 2,
                  fontWeight: 800,
                  borderRadius: 999,
                  color: "#fff",
                  background:
                    "linear-gradient(135deg, #0d6efd, #3d8bfd)",
                  boxShadow: "0 10px 24px rgba(0,0,0,.35)",
                  "&:hover": { filter: "brightness(1.05)" },
                }}
              >
                Buscar
              </Button>

              <Button
                onClick={handleLimpiar}
                startIcon={<i className="bi bi-brush" aria-hidden="true" />}
                sx={{
                  height: 40,
                  width: { xs: "100%", sm: "25%" }, minWidth: 150,
                  px: 2,
                  fontWeight: 800,
                  borderRadius: 999,
                  border: "1px solid #0d6efd",
                  color: "#0d6efd",
                  background: "#fff",
                  "&:hover": { background: "#eef5ff", borderColor: "#0b5ed7" },
                }}
              >
                Limpiar
              </Button>
            </Box>

            {hasSearched && initialMode && initials.length > 0 && (
              <Box sx={{ mt: 2, mb: 1.5, display: "flex", justifyContent: "center", overflowX: "auto", py: .5 }}>
                <Box sx={{ display: "flex", gap: .7, minWidth: "max-content" }}>
                  {initials.map((letra) => (
                    <Button key={letra} onClick={() => void cambiarInicial(letra)}
                      sx={{ minWidth: 34, width: 34, height: 34, p: 0, borderRadius: "50%", fontWeight: 900,
                        border: "1px solid #0d6efd",
                        color: letra === selectedInitial ? "#fff" : "#0d6efd",
                        background: letra === selectedInitial ? "#0d6efd" : "#fff",
                        "&:hover": { background: letra === selectedInitial ? "#0b5ed7" : "#eef5ff" } }}>
                      {letra}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

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

            {!loading && hasSearched && artistas.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 900, color: '#0d6efd' }}>
                  Resultados ({initialMode ? serverTotalElements : artistas.length})
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
                            borderRadius: 3,
                            overflow: "hidden",
                            background: "#ffffff",
                            border: "1px solid #dce6f2",
                            boxShadow: "0 8px 24px rgba(30,64,175,.10)",
                            transition: "transform 160ms ease, border-color 160ms ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              borderColor: "#9ec5fe",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              aspectRatio: "1 / 1",
                              overflow: "hidden",
                              background: "#eef4fb",
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
                              sx={{ fontWeight: 900, color: "#0d6efd" }}
                            >
                              {artista.nombre}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#64748b" }}
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
                      setCurrentPage={cambiarPagina}
                    />
                  </Box>
                )}
              </Box>
            )}

            {!loading && hasSearched && artistas.length === 0 && (
              <Typography
                variant="body1"
                align="center"
                sx={{ mt: 3, color: "#64748b" }}
              >
                No se encontraron artistas con los criterios seleccionados.
              </Typography>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                onClick={() => navigate("/home")}
                startIcon={<FaArrowLeft />}
                sx={{
                  height: 40,
                  width: "auto", minWidth: 130,
                  px: 2,
                  fontWeight: 800,
                  borderRadius: 999,
                  border: "1px solid #0d6efd",
                  color: "#0d6efd",
                  background: "#fff",
                  "&:hover": {
                    background: "#eef5ff",
                    borderColor: "#0b5ed7",
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
