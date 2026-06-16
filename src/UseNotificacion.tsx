import { useSnackbar } from 'notistack';
import { IconButton, Paper, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import type { JSX } from 'react';

type Variant = 'success' | 'error' | 'warning' | 'info';

const iconMap: Record<Variant, () => JSX.Element> = {
  success: () => <CheckCircleIcon />,
  error: () => <ErrorIcon />,
  warning: () => <WarningIcon />,
  info: () => <InfoIcon />,
};

const colorMap: Record<Variant, string> = {
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
};

export const useNotificacion = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const mostrarNotificacion = (mensaje: string, tipo: Variant = 'info') => {
    enqueueSnackbar('', {
      content: (key) => (
        <Paper
          elevation={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: colorMap[tipo],
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
          }}
        >
          {iconMap[tipo]()}
          <Typography variant="body1" sx={{ flexGrow: 1, marginLeft: 1 }}>
            {mensaje}
          </Typography>
          <IconButton onClick={() => closeSnackbar(key)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Paper>
      ),
    });
  };

  return { mostrarNotificacion };
};