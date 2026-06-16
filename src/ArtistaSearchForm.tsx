import React, { useEffect, useState } from 'react';
import {
  Grid, TextField, Button, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import generosData from './generos.json';
import paisesData from './Paises.json';

interface Pais {
  bandera: string;
  id: number;
  nombre: string;
}

interface Props {
  filters: {
    nombre: string;
    genero: string;
    anyoInicio: string;
    pais: string;
  };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBuscar: () => void;
  onLimpiar: () => void;
  loading: boolean;
}

const ArtistaSearchForm: React.FC<Props> = ({
  filters, errors, onChange, onBuscar, onLimpiar, loading
}) => {
  const [generos, setGeneros] = useState<string[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);

  useEffect(() => {
    const generosList = generosData.map((g: any) => g.nombreGenero);
    setGeneros(generosList);

    // Cargar países
    setPaises(paisesData);
  }, []);

  return (
    <Grid container spacing={2} style={{ marginTop: '1rem' }}>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          label="Nombre"
          name="nombre"
          value={filters.nombre}
          onChange={onChange}
          error={!!errors.nombre}
          helperText={errors.nombre}
          fullWidth
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <TextField
          select
          label="Género"
          name="genero"
          value={filters.genero}
          onChange={onChange}
          fullWidth
        >
          <MenuItem value="">Todos</MenuItem>
          {generos.map((g) => (
            <MenuItem key={g} value={g}>{g}</MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <TextField
          label="Año de Inicio"
          name="anyoInicio"
          value={filters.anyoInicio}
          onChange={onChange}
          error={!!errors.anyoInicio}
          helperText={errors.anyoInicio}
          fullWidth
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*'
          }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
          <TextField
          select
          label="País"
          name="pais"
          value={filters.pais}
          onChange={onChange}
          fullWidth
        >
          <MenuItem value="">Todos</MenuItem>
          {paises.map((p) => (
            <MenuItem key={p.id} value={p.nombre}>
              <img
                src={p.bandera}
                alt={p.nombre}
                style={{
                  width: 24,
                  height: 24,
                  objectFit: 'cover',
                  marginRight: 8,
                  borderRadius: 4
                }}
              />
              {p.nombre}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12}>
  <Grid container justifyContent="flex-end" spacing={2}>
    <Grid item>
      <Button
        variant="contained"
        color="primary"
        onClick={onBuscar}
        disabled={loading}
        startIcon={<SearchIcon />}
      >
        Buscar
      </Button>
    </Grid>
    <Grid item>
      <Button
        variant="outlined"
        color="secondary"
        onClick={onLimpiar}
        disabled={loading}
        startIcon={<ClearIcon />}
      >
        Limpiar
      </Button>
    </Grid>
  </Grid>
</Grid>
    </Grid>
  );
};

export default ArtistaSearchForm;

