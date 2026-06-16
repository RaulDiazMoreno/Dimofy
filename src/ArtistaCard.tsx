import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';

interface ArtistaCardProps {
  artista: {
    nombre: string;
    foto: string;
    generos: { nombreGenero: string };
    paises: { nombre: string; bandera: string };
    anyoInicio: string;
  };
}

const ArtistaCard: React.FC<ArtistaCardProps> = ({ artista }) => {
  const banderaSrc = artista.paises.bandera.replace(
    'C:\\Users\\Rauld\\Downloads\\React\\sidebar-menu-app\\public',
    ''
  );

  return (
    <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.03)' } }}>
      <CardMedia
  component="img"
  image={
    artista.foto
      ? `assets/Artistas/${artista.foto.split("/").pop()}`
      : 'assets/Artistas/default.jpg'
  }
  alt={`Foto de ${artista.nombre}`}
  sx={{
    width: 200,
    height: 200,
    borderRadius: '50%',
    objectFit: 'cover',
    margin: '16px auto', // centrado horizontal
  }}
/>

      <CardContent>
        <Typography
  variant="h6"
  noWrap
  sx={{
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)', // Escala entre 0.9rem y 1.2rem según el ancho
  }}
>
  {artista.nombre}
</Typography>
        <Typography variant="body2" color="textSecondary">
          Género: {artista.generos.nombreGenero}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Año de inicio: {artista.anyoInicio}
        </Typography>
        <Box mt={1} display="flex" alignItems="center">
          <img
            src={banderaSrc}
            alt={`Bandera de ${artista.paises.nombre}`}
            style={{ width: '32px', height: '20px', marginRight: '8px' }}
          />
          <Typography variant="body2">{artista.paises.nombre}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ArtistaCard;

