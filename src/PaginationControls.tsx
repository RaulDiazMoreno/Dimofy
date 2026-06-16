import React from 'react';
import { Grid, Button, Typography } from '@mui/material';

interface Props {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const PaginationControls: React.FC<Props> = ({ currentPage, totalPages, setCurrentPage }) => (
  <Grid container justifyContent="center" spacing={2} style={{ marginTop: '1rem' }}>
    <Grid item>
      <Button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>Inicio</Button>
    </Grid>
    <Grid item>
      <Button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>Anterior</Button>
    </Grid>
    <Grid item>
      <Typography variant="body2" style={{ paddingTop: '0.5rem' }}>
        Página {currentPage} de {totalPages}
      </Typography>
    </Grid>
    <Grid item>
      <Button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages}>Siguiente</Button>
    </Grid>
    <Grid item>
      <Button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Final</Button>
    </Grid>
  </Grid>
);

export default PaginationControls;
