import React from 'react';
import { Table, Pagination } from 'react-bootstrap';

interface Cancion {
  id: number;
  titulo: string;
  artista: string;
  album: string;
  anio: string;
}

interface CancionesTableProps {
  data: Cancion[];
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
}

const CancionesTableI: React.FC<CancionesTableProps> = ({
  data,
  page,
  rowsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <section className="mb-5">
      <div className="table-responsive">
        <Table striped bordered hover size="sm" className="small mt-4">
          <thead className="table-primary">
            <tr>
              <th>Id</th>
              <th>Título</th>
              <th>Artista</th>
              <th>Álbum</th>
              <th>Año</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((cancion) => (
              <tr key={cancion.id}>
                <td>{cancion.id}</td>
                <td>{cancion.titulo}</td>
                <td>{cancion.artista}</td>
                <td>{cancion.album}</td>
                <td>{cancion.anio}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Pagination className="justify-content-center">
        <Pagination.First onClick={() => onPageChange(0)} disabled={page === 0} />
        <Pagination.Prev onClick={() => onPageChange(page - 1)} disabled={page === 0} />
        <Pagination.Item active>{page + 1}</Pagination.Item>
        <Pagination.Next onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1} />
        <Pagination.Last onClick={() => onPageChange(totalPages - 1)} disabled={page >= totalPages - 1} />
      </Pagination>
    </section>
  );
};

export default CancionesTableI;

