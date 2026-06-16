import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, CircularProgress, Box, Button } from '@mui/material';

interface Album {
  idAlbum: number;
  titulo: string;
  cover: string;
  anyo: string;
  descripcion: string;
}

const AlbumsPorArtista: React.FC = () => {
  const { idAlbum } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) throw new Error('Usuario no autenticado');
        const { token } = JSON.parse(userData);
        const resAlbums = await fetch(`http://localhost:8080/app/albums/artistAlbum/${idAlbum}`, {
        headers: {
            'Authorization': `Bearer ${token}`, // Asegúrate de tener el token correcto
            'Content-Type': 'application/json'
        }
        });
        if (!resAlbums.ok) throw new Error('Álbum no encontrado');
        const data = await resAlbums.json();
        setAlbum(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [idAlbum]);

  if (loading) return <CircularProgress />;
  if (!album) return <Typography>No se encontró el álbum.</Typography>;

  return (
    <Box sx={{ padding: '2rem' }}>
      <Typography variant="h4">{album.titulo}</Typography>
      <Box
        component="img"
        src={`/assets/Cover/${album.cover.replace(/\.(jpg|png)$/, '.webp')}`}
        alt={album.titulo}
        sx={{ width: 300, height: 300, objectFit: 'cover', marginTop: '1rem' }}
      />
      <Typography variant="body1" sx={{ marginTop: '1rem' }}>
        Año: {album.anyo}
      </Typography>
      <Typography variant="body2" sx={{ marginTop: '1rem' }}>
        {album.descripcion}
      </Typography>
      <Button variant="contained" sx={{ marginTop: '2rem' }} onClick={() => navigate(-1)}>
        Volver
      </Button>
    </Box>
  );
};

export default AlbumsPorArtista;