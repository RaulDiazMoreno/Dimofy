import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination
} from '@mui/material';
import TablePaginationActions from '@mui/material/TablePagination/TablePaginationActions';

interface NovedadesTableProps<T> {
  title: string;
  data: T[];
  columns: { key: keyof T; label: string }[];
  page: number;
  rowsPerPage: number;
  handleChangePage: (event: unknown, newPage: number) => void;
}


const NovedadesTable = <T extends object>({
  title,
  data,
  columns,
  page,
  rowsPerPage,
  handleChangePage,
}: NovedadesTableProps<T>) => (
  <section style={{ marginBottom: '2rem' }}>
    <h3>{title}</h3>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            {columns.map((col) => (
              <TableCell key={String(col.key)} sx={{ fontWeight: 'bold' }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, index) => (
              <TableRow
                key={index}
                sx={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9' }}
              >
                {columns.map((col) => (
                  <TableCell key={String(col.key)}>
                    {String(row[col.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[]}
        labelRowsPerPage=""
        labelDisplayedRows={() => ''}
        ActionsComponent={TablePaginationActions}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem',
          '& .MuiTablePagination-actions': {
            display: 'flex',
            flexDirection: 'row',
            gap: '0.5rem',
          },
        }}
      />
    </TableContainer>
  </section>
);


export default NovedadesTable;
