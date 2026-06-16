import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { FaArrowLeft } from 'react-icons/fa';
import CancionesTabla from  './CancionesTabla';

interface Cancion {
  id: number;
  titulo: string;
  duracion: string;
}

interface Album {
  idAlbum: number;
  titulo: string;
  artista: string;
  genero: string;
  anyo: string;
  cover: string;
  canciones: Cancion[];
}

const AlbumPorCancion: React.FC = () => {
  const { titulo } = useParams<{ titulo: string }>();
  const [album, setAlbum] = useState<Album>({
  idAlbum: 0,
  titulo: '',
  artista: '',
  genero: '',
  anyo: '',
  cover: '',
  canciones: []
});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const userData = localStorage.getItem('user');
        const { token } = userData ? JSON.parse(userData) : {};

        const response = await fetch(
         `http://localhost:8080/app/albums/titulo/${encodeURIComponent(titulo || '')}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` })
            }
          }
        );

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        const data = await response.json();

        if (data) {
          setAlbum(data); // ✅ Tomamos solo el primer álbum
        } else {
          setErrorMsg('No se encontró ningún álbum con ese título.');
        }
      } catch (error) {
        setErrorMsg(error instanceof Error ? error.message : 'Error al cargar el álbum');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [titulo]);

  if (loading) {
    return (
      <Grid container justifyContent="center" style={{ marginTop: '2rem' }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (errorMsg) {
    return (
      <Snackbar open autoHideDuration={6000} onClose={() => setErrorMsg('')}>
        <Alert severity="error" onClose={() => setErrorMsg('')}>
          {errorMsg}
        </Alert>
      </Snackbar>
    );
  }

  return (
    <Paper elevation={3} style={{ padding: '2rem' }}>
      {album && (
        <>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>{album.titulo}</Typography>
              <Typography variant="subtitle1">Artista: {album.artista}</Typography>
              <Typography variant="subtitle1">Género: {album.genero}</Typography>
              <Typography variant="subtitle1">Año: {album.anyo}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <img
                src={`/assets/Cover/${album.cover?.split('\\').pop()?.split('/').pop()}`}
                alt="Portada"
                style={{
                  width: '300px',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '4px solid #ff9800',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
              />
            </Grid>
          </Grid>

          <div className="row mt-4">
            <div className="col-3">
              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={() => navigate(-1)}
                style={{
                  minWidth: 'auto',
                  padding: '6px 12px',
                  fontSize: '0.8rem'
                }}
              >
                <FaArrowLeft style={{ marginRight: '0.5rem' }} />
                Volver
              </Button>
            </div>
          </div>

          <Grid container spacing={2} style={{ marginTop: '2rem' }}>
            <Grid item xs={12}>
              <Typography variant="h6">Canciones</Typography>
            </Grid>
            <Grid item xs={12}>
                <CancionesTabla canciones={album?.canciones || []} />
            </Grid>
          </Grid>
        </>
      )}
    </Paper>
  );
};

export default AlbumPorCancion;