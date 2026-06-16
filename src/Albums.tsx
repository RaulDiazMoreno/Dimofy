  import React, { useState } from 'react';
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
  import AlbumIcon from '@mui/icons-material/Album';
  import { FaArrowLeft } from 'react-icons/fa';
  import { useUser } from './UserContext';
  import { useNavigate, Link } from 'react-router-dom';
  import PaginationControls from './PaginationControls';
  import generosData from './generos.json';

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
    const [filters, setFilters] = useState({ genero: '', artista: '', anyoInicio: '', anyoFin: '', titulo: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [albums, setAlbums] = useState<Album[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    useUser();

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

    const handleBuscar = async () => {
      const errs = validate();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setLoading(true);
      setErrorMsg('');
      try {
        const userData = localStorage.getItem('user');
        if (!userData) throw new Error('Usuario no autenticado');
        const { token } = JSON.parse(userData);
        const params = new URLSearchParams(filters).toString();
        const response = await fetch(`http://localhost:8080/app/albums/buscar?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        const data = await response.json();
        setAlbums(data);
        setCurrentPage(1);
      } catch (error: unknown) {
        setErrorMsg(error instanceof Error ? error.message : 'Error al buscar álbumes');
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    };

    const handleLimpiar = () => {
      setFilters({ genero: '', artista: '', anyoInicio: '', anyoFin: '', titulo: '' });
      setErrors({});
    };

    const indexOfLastAlbum = currentPage * albumsPerPage;
    const indexOfFirstAlbum = indexOfLastAlbum - albumsPerPage;
    const currentAlbums = albums.slice(indexOfFirstAlbum, indexOfLastAlbum);
    const totalPages = Math.ceil(albums.length / albumsPerPage);

    const darkPageTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#070a0e',
      paper: 'rgba(10, 14, 20, .62)',
    },
    text: {
      primary: 'rgba(255,255,255,.92)',
      secondary: 'rgba(255,255,255,.65)',
    },
  },
  shape: { borderRadius: 14 },
});


  return (
  <ThemeProvider theme={darkPageTheme}>
    <CssBaseline />

    <Box
      sx={{
        minHeight: '100vh',
        pb: '4rem',
        color: 'rgba(255,255,255,.92)',
        background: `
          radial-gradient(1200px 700px at 12% 8%, rgba(255,255,255,.08), transparent 60%),
          radial-gradient(900px 600px at 90% 12%, rgba(255,255,255,.06), transparent 55%),
          radial-gradient(900px 700px at 70% 90%, rgba(255,255,255,.05), transparent 55%),
          #070a0e
        `,
      }}
    >
      <Container sx={{ pt: '1.4rem', maxWidth: '1180px !important' }}>
        {/* Panel central (como en home) */}
        <Box
          sx={{
            p: { xs: 1.6, sm: 2.2 },
            borderRadius: 2,
            background: 'rgba(10, 14, 20, .62)',
            border: '1px solid rgba(255,255,255,.08)',
            boxShadow: '0 14px 36px rgba(0,0,0,.55)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', fontWeight: 800, letterSpacing: '.2px' }}
          >
            <AlbumIcon sx={{ mr: 1 }} /> Buscar Álbumes
          </Typography>

          {/* Filtros */}
          <Grid container spacing={2}>
            {['titulo', 'artista', 'genero', 'anyoInicio'].map((field) => (
              <Grid item xs={12} sm={6} md={3} key={field}>
                {field === 'genero' ? (
                  <FormControl
                    fullWidth
                    sx={{
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,.65)' },
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(0,0,0,.35)',
                        borderRadius: 2,
                        '& fieldset': { borderColor: 'rgba(255,255,255,.12)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,.18)' },
                        '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,.22)' },
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
                            backgroundColor: '#0b0f14',
                            border: '1px solid rgba(255,255,255,.10)',
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
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,.65)' },
                      '& .MuiFormHelperText-root': { color: 'rgba(255,150,150,.85)' },
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(0,0,0,.35)',
                        borderRadius: 2,
                        color: 'rgba(255,255,255,.92)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,.12)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,.18)' },
                        '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,.22)' },
                      },
                      '& input::placeholder': { color: 'rgba(255,255,255,.45)', opacity: 1 },
                    }}
                  />
                )}
              </Grid>
            ))}
          </Grid>

          {/* Acciones */}
          <Box sx={{ mt: 1.2, display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
            <Button
              onClick={handleBuscar}
              aria-label="Buscar álbumes"
              sx={{
                height: 38,
                px: 2,
                fontWeight: 800,
                borderRadius: 2,
                color: '#fff',
                background:
                  'linear-gradient(135deg, rgba(255,110,196,.92), rgba(120,115,245,.92))',
                boxShadow: '0 10px 24px rgba(0,0,0,.35)',
                '&:hover': { filter: 'brightness(1.05)' },
              }}
            >
              Buscar
            </Button>

            <Button
              onClick={handleLimpiar}
              aria-label="Limpiar filtros"
              sx={{
                height: 38,
                px: 2,
                fontWeight: 800,
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,.14)',
                color: 'rgba(255,255,255,.92)',
                background: 'rgba(255,255,255,.08)',
                '&:hover': {
                  background: 'rgba(255,255,255,.12)',
                  borderColor: 'rgba(255,255,255,.22)',
                },
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
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>
                Resultados ({albums.length})
              </Typography>

              <Grid container spacing={2}>
                {currentAlbums.map((album) => (
                  <Grid item xs={12} sm={6} md={3} key={album.idAlbum}>
                    <Link to={`/albums/${album.idAlbum}`} style={{ textDecoration: 'none' }}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          overflow: 'hidden',
                          background: 'rgba(0,0,0,.35)',
                          border: '1px solid rgba(255,255,255,.10)',
                          boxShadow: '0 10px 24px rgba(0,0,0,.45)',
                          transition: 'transform 160ms ease, border-color 160ms ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            borderColor: 'rgba(255,255,255,.18)',
                          },
                        }}
                      >
                        <Box sx={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            loading="lazy"
                            image={
                              album.cover
                                ? `/assets/Cover/${album.cover
                                    .split('\\')
                                    .pop()
                                    ?.split('/')
                                    .pop()
                                    ?.replace(/\.(jpg|png)$/, '.webp')}`
                                : '/assets/Cover/default.webp'
                            }
                            srcSet={
                              album.cover
                                ? `/assets/Cover/${album.cover.replace(
                                    /\.(jpg|png)$/,
                                    '.webp'
                                  )} 1x, /assets/Cover/${album.cover.replace(
                                    /\.(jpg|png)$/,
                                    '@2x.webp'
                                  )} 2x`
                                : '/assets/Cover/default.webp'
                            }
                            alt={album.titulo}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>

                        <CardContent sx={{ py: 1.2 }}>
                          <Typography
                            variant="subtitle1"
                            noWrap
                            sx={{ fontWeight: 800, color: 'rgba(255,255,255,.92)' }}
                          >
                            {album.titulo}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,.65)' }}>
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
              sx={{ mt: 3, color: 'rgba(255,255,255,.65)' }}
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
                height: 38,
                px: 2,
                fontWeight: 800,
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,.14)',
                color: 'rgba(255,255,255,.92)',
                background: 'rgba(255,255,255,.08)',
                '&:hover': {
                  background: 'rgba(255,255,255,.12)',
                  borderColor: 'rgba(255,255,255,.22)',
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














