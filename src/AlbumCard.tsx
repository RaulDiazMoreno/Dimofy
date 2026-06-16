import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActionArea
} from '@mui/material';

interface Album {
  idAlbum: number;
  titulo: string;
  artista: string;
  genero: string;
  anyo: string;
  cover: string;
}

interface Props {
  album: Album;
}

const AlbumCard: React.FC<Props> = ({ album }) => {
  const imageSrc = album.cover ? album.cover.split('/').pop() : 'default.jpg';
  const imagePath = `/assets/Cover/${imageSrc}`;

  return (
    <Card
      elevation={2}
      sx={{
        height: 200,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#000',
        color: '#fff',
        transition: 'background-color 0.3s, transform 0.2s',
        '&:hover': {
          backgroundColor: '#333',
          transform: 'scale(1.02)',
        },
      }}
    >
      <CardActionArea sx={{ height: '100%' }}>
        <CardMedia
          component="img"
          image={imagePath}
          alt={`Portada de ${album.titulo}`}
          loading="lazy"
          sx={{
            height: 100,
            width: 'auto',
            maxWidth: '100%',
            margin: '0 auto',
            objectFit: 'contain',
            backgroundColor: '#1a1a1a',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/Cover/default.jpg';
          }}
        />
        <CardContent sx={{ padding: '0.5rem' }}>
          <Typography variant="subtitle2" noWrap sx={{ color: '#fff' }}>
            {album.titulo}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: '#ccc' }}>
            {album.artista} • {album.anyo}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default React.memo(AlbumCard);
