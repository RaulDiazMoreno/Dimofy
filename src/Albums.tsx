  import React, { useEffect, useMemo, useState } from 'react';
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
    SelectChangeEvent
  } from '@mui/material';
  import { ThemeProvider, createTheme } from '@mui/material/styles';
  import CssBaseline from '@mui/material/CssBaseline';
  import { FaArrowLeft } from 'react-icons/fa';
  import { useUser } from './UserContext';
  import { useNavigate, useSearchParams, Link } from 'react-router-dom';
  import PaginationControls from './PaginationControls';
  import generosData from './generos.json';
  import { DEFAULT_ALBUM_IMAGE, getAlbumImage, getAlbumThumbnail, imageFallback, imageThumbnailFallback } from './utils/imagePaths';

  interface Album {
    idAlbum: number;
    titulo: string;
    artista: string;
    genero: string;
    anyo: string;
    cover: string;
  }

  interface Genero {
    id: number;
    nombreGenero: string;
  }

  const Albums: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    useUser();

    const initialFilters = useMemo(
      () => ({
        genero: searchParams.get('genero') ?? '',
        artista: searchParams.get('artista') ?? '',
        anyoInicio: searchParams.get('anyoInicio') ?? '',
        anyoFin: searchParams.get('anyoFin') ?? '',
        titulo: searchParams.get('titulo') ?? '',
      }),
      []
    );

    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [albums, setAlbums] = useState<Album[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(() => {
      const page = Number(searchParams.get('page'));
      return Number.isFinite(page) && page > 0 ? page : 1;
    });
    const [hasSearched, setHasSearched] = useState(
      searchParams.get('buscar') === '1'
    );
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const isSmall = useMediaQuery('(max-width:600px)');
    const albumsPerPage = isSmall ? 6 : 12;
    const generos: Genero[] = generosData;
    const validate = () => {
      const errs: Record<string, string> = {};
      if (filters.anyoInicio && !/^\d{4}$/.test(filters.anyoInicio)) {
        errs.anyoInicio = 'El año de inicio debe ser un número de 4 cifras';
      }
      if (filters.titulo && /[^a-zA-Z0-9 áéíóúÁÉÍÓÚüÜñÑ\-.,]/.test(filters.titulo)) {
        errs.titulo = 'El título contiene caracteres no permitidos';
      }
      return errs;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFilters(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
      const { name, value } = e.target;
      setFilters(prev => ({ ...prev, [name!]: value }));
      setErrors(prev => ({ ...prev, [name!]: '' }));
    };

    const buscarAlbums = async (
      searchFilters: typeof filters,
      page: number
    ) => {
      setLoading(true);
      setErrorMsg('');

      try {
        const userData = localStorage.getItem('user');
        if (!userData) throw new Error('Usuario no autenticado');

        const { token } = JSON.parse(userData);

        const params = new URLSearchParams();
        if (searchFilters.genero) params.set('genero', searchFilters.genero);
        if (searchFilters.artista) params.set('artista', searchFilters.artista);
        if (searchFilters.anyoInicio) params.set('anyoInicio', searchFilters.anyoInicio);
        if (searchFilters.anyoFin) params.set('anyoFin', searchFilters.anyoFin);
        if (searchFilters.titulo) params.set('titulo', searchFilters.titulo);
        params.set('page', String(Math.max(0, page - 1)));
        params.set('size', String(albumsPerPage));

        const response = await fetch(
          `http://localhost:8080/app/albums/buscar/paginado?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` })
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const content = Array.isArray(data?.content) ? data.content : [];

        setAlbums(content);
        setTotalPages(Number(data?.totalPages ?? 0));
        setTotalElements(Number(data?.totalElements ?? content.length));
        setAppliedFilters(searchFilters);
        setHasSearched(true);
      } catch (error: unknown) {
        setErrorMsg(
          error instanceof Error ? error.message : 'Error al buscar álbumes'
        );
        setAlbums([]);
        setTotalPages(0);
        setTotalElements(0);
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

      setAppliedFilters(filters);
      setCurrentPage(1);
      setHasSearched(true);
    };

    const handleLimpiar = () => {
      const emptyFilters = {
        genero: '',
        artista: '',
        anyoInicio: '',
        anyoFin: '',
        titulo: '',
      };

      setFilters(emptyFilters);
      setAppliedFilters(emptyFilters);
      setErrors({});
      setAlbums([]);
      setTotalPages(0);
      setTotalElements(0);
      setCurrentPage(1);
      setHasSearched(false);
      setSearchParams({}, { replace: true });
    };


    useEffect(() => {
      if (!hasSearched) return;
      void buscarAlbums(appliedFilters, currentPage);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, albumsPerPage, appliedFilters, hasSearched]);

    useEffect(() => {
      if (!hasSearched) {
        return;
      }

      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('buscar', '1');

      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      setSearchParams(params, { replace: true });
    }, [currentPage, appliedFilters, hasSearched, setSearchParams]);


    const currentAlbums = albums;

    const albumsReturnTo = useMemo(() => {
      const params = new URLSearchParams();

      params.set('page', String(currentPage));
      params.set('buscar', '1');

      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      return `/albums?${params.toString()}`;
    }, [currentPage, appliedFilters]);

    const lightPageTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f7f9fc',
      paper: '#ffffff',
    },
    text: {
      primary: '#172033',
      secondary: '#64748b',
    },
  },
  shape: { borderRadius: 14 },
});


  return (
  <ThemeProvider theme={lightPageTheme}>
    <CssBaseline />

    <Box
      sx={{
        minHeight: '100vh',
        pb: '4rem',
        color: '#172033',
        background: 'linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%)',
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 5, pb: 4 }}>
        {/* Panel central (como en home) */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3,
            background: '#ffffff',
            border: '1px solid #dce6f2',
            boxShadow: '0 12px 36px rgba(30,64,175,.10)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 900, mb: 2, color: '#0d6efd', fontSize: { xs: '2rem', md: '2.35rem' } }}
          >
            Buscar álbumes
          </Typography>

          {/* Filtros */}
          <Grid container spacing={2}>
            {['titulo', 'artista', 'genero', 'anyoInicio'].map((field) => (
              <Grid item xs={12} sm={6} md={3} key={field}>
                {field === 'genero' ? (
                  <FormControl
                    fullWidth
                    sx={{
                      '& .MuiInputLabel-root': { color: '#64748b' },
                      '& .MuiOutlinedInput-root': {
                        background: '#ffffff',
                        borderRadius: 999,
                        '& fieldset': { borderColor: '#e6f0fb' },
                        '&:hover fieldset': { borderColor: '#9ec5fe' },
                        '&.Mui-focused fieldset': { borderColor: '#0d6efd' },
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
                            backgroundColor: '#ffffff',
                            border: '1px solid #dce6f2',
                          },
                        },
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {generos.map((genero) => (
                        <MenuItem key={genero.id} value={genero.nombreGenero}>
                          {genero.nombreGenero}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    label={
                      field.includes('anyo')
                        ? `Año ${field === 'anyoInicio' ? 'inicio' : 'fin'}`
                        : field.charAt(0).toUpperCase() + field.slice(1)
                    }
                    name={field}
                    value={filters[field as keyof typeof filters]}
                    onChange={handleInputChange}
                    error={!!errors[field as keyof typeof errors]}
                    helperText={errors[field as keyof typeof errors]}
                    sx={{
                      '& .MuiInputLabel-root': { color: '#64748b' },
                      '& .MuiFormHelperText-root': { color: 'rgba(255,150,150,.85)' },
                      '& .MuiOutlinedInput-root': {
                        background: '#ffffff',
                        borderRadius: 999,
                        color: '#172033',
                        '& fieldset': { borderColor: '#e6f0fb' },
                        '&:hover fieldset': { borderColor: '#9ec5fe' },
                        '&.Mui-focused fieldset': { borderColor: '#0d6efd' },
                      },
                      '& input::placeholder': { color: 'rgba(255,255,255,.45)', opacity: 1 },
                    }}
                  />
                )}
              </Grid>
            ))}
          </Grid>

          {/* Acciones */}
          <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.1, flexWrap: 'wrap' }}>
            <Button
              onClick={handleBuscar}
              startIcon={<i className="bi bi-search" aria-hidden="true" />}
              aria-label="Buscar álbumes"
              sx={{
                height: 40,
                width: { xs: '100%', sm: '25%' }, minWidth: 150,
                px: 2,
                fontWeight: 800,
                borderRadius: 999,
                color: '#fff',
                background:
                  'linear-gradient(135deg, #0d6efd, #3d8bfd)',
                boxShadow: '0 10px 24px rgba(13,110,253,.20)',
                '&:hover': { filter: 'brightness(1.05)' },
              }}
            >
              Buscar
            </Button>

            <Button
              onClick={handleLimpiar}
              startIcon={<i className="bi bi-brush" aria-hidden="true" />}
              aria-label="Limpiar filtros"
              sx={{
                height: 40,
                width: { xs: '100%', sm: '25%' }, minWidth: 150,
                px: 2,
                fontWeight: 800,
                borderRadius: 999,
                border: '1px solid #0d6efd',
                color: '#0d6efd',
                background: '#fff',
                '&:hover': { background: '#eef5ff', borderColor: '#0b5ed7' },
              }}
            >
              Limpiar
            </Button>
          </Box>

          {/* Loading */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error */}
          {errorMsg && (
            <Snackbar open autoHideDuration={6000} onClose={() => setErrorMsg('')}>
              <Alert severity="error" onClose={() => setErrorMsg('')}>
                {errorMsg}
              </Alert>
            </Snackbar>
          )}

          {/* Resultados */}
          {!loading && albums.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 900, color: '#0d6efd' }}>
                Resultados ({totalElements})
              </Typography>

              <Grid container spacing={2}>
                {currentAlbums.map((album, index) => (
                  <Grid item xs={12} sm={6} md={3} key={album.idAlbum}>
                    <Link
                      to={`/albums/${album.idAlbum}`}
                      state={{ returnTo: albumsReturnTo }}
                      style={{ textDecoration: 'none' }}
                    >
                      <Card
                        sx={{
                          borderRadius: 3,
                          overflow: 'hidden',
                          background: '#ffffff',
                          border: '1px solid #dce6f2',
                          boxShadow: '0 8px 24px rgba(30,64,175,.10)',
                          transition: 'transform 160ms ease, border-color 160ms ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            borderColor: '#9ec5fe',
                          },
                        }}
                      >
                        <Box sx={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            loading={currentPage === 1 && index < 4 ? "eager" : "lazy"}
                            decoding="async"
                            fetchPriority={currentPage === 1 && index < 4 ? "high" : "low"}
                            image={getAlbumThumbnail(album.cover)}
                            alt={album.titulo}
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) =>
                              imageThumbnailFallback(e, getAlbumImage(album.cover), DEFAULT_ALBUM_IMAGE)
                            }
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>

                        <CardContent sx={{ py: 1.2 }}>
                          <Typography
                            variant="subtitle1"
                            noWrap
                            sx={{ fontWeight: 900, color: '#0d6efd' }}
                          >
                            {album.titulo}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Año: {album.anyo}
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

          {/* Sin resultados */}
          {!loading && albums.length === 0 && (
            <Typography
              variant="body1"
              align="center"
              sx={{ mt: 3, color: '#64748b' }}
            >
              No se encontraron álbumes con los criterios seleccionados.
            </Typography>
          )}

          {/* Volver (estilo dashboard, no barra naranja) */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              onClick={() => navigate('/home')}
              startIcon={<FaArrowLeft />}
              sx={{
                height: 40,
                width: 'auto', minWidth: 130,
                px: 2,
                fontWeight: 800,
                borderRadius: 999,
                border: '1px solid #0d6efd',
                color: '#0d6efd',
                background: '#fff',
                '&:hover': {
                  background: '#eef5ff',
                  borderColor: '#0b5ed7',
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

export default Albums;














