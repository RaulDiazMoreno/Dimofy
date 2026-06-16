import React from 'react';
import {
  Grid,
  TextField,
  Button,
  CircularProgress
} from '@mui/material';

interface Props {
  filters: {
    nombre: string;
    genero: string;
    anyoInicio: string;
    pais: string;
  };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => void;
  onBuscar: () => void;
  onLimpiar: () => void;
  loading: boolean;
  buttonStyles?: {
    buscar?: any;
    limpiar?: any;
  };
}

const ArtistaSearchForm: React.FC<Props> = ({ filters, errors, onChange, onBuscar, onLimpiar, loading, buttonStyles }) => {
  return (
    <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Nombre"
          name="nombre"
          value={filters.nombre}
          onChange={onChange}
          error={!!errors.nombre}
          helperText={errors.nombre}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Género"
          name="genero"
          value={filters.genero}
          onChange={onChange}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Año de inicio"
          name="anyoInicio"
          value={filters.anyoInicio}
          onChange={onChange}
          error={!!errors.anyoInicio}
          helperText={errors.anyoInicio}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="País"
          name="pais"
          value={filters.pais}
          onChange={onChange}
        />
      </Grid>

      <Grid item xs={12} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          {...(buttonStyles?.buscar || { variant: 'contained', color: 'primary' })}
          onClick={onBuscar}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Buscar'}
        </Button>
        <Button
          {...(buttonStyles?.limpiar || { variant: 'outlined', color: 'primary' })}
          onClick={onLimpiar}
          disabled={loading}
        >
          Limpiar
        </Button>
      </Grid>
    </Grid>
  );
};

export default ArtistaSearchForm;

