import React from 'react';
import { Table, Image, Pagination } from 'react-bootstrap';

interface Lista {
  id: number;
  nombre: string;
  caratula: string;
  numeroCanciones: string;
}

interface ListaTableProps {
  title: string;
  tableId: string;
  data: Lista[];
  page: number;
  rowsPerPage: number;
  handleChangePage: (tableId: string, newPage: number) => void;
}

const ListaTableDashBoard: React.FC<ListaTableProps> = ({
  title,
  tableId,
  data,
  page,
  rowsPerPage,
  handleChangePage,
}) => {
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <section className="mb-5">
      <h4 className="mb-3">{title}</h4>
      <div className="table-responsive">
        <Table striped bordered hover size="sm">
          <thead className="table-primary">
            <tr>
              <th>Carátula</th>
              <th>Nombre</th>
              <th>Canciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((lista) => (
              <tr key={lista.id}>
                <td>
                  <Image src={lista.caratula} alt={lista.nombre} width={50} rounded />
                </td>
                <td>{lista.nombre}</td>
                <td>{lista.numeroCanciones}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Pagination className="justify-content-center">
        <Pagination.First onClick={() => handleChangePage(tableId, 0)} disabled={page === 0} />
        <Pagination.Prev onClick={() => handleChangePage(tableId, page - 1)} disabled={page === 0} />
        <Pagination.Item active>{page + 1}</Pagination.Item>
        <Pagination.Next
          onClick={() => handleChangePage(tableId, page + 1)}
          disabled={page >= totalPages - 1}
        />
        <Pagination.Last
          onClick={() => handleChangePage(tableId, totalPages - 1)}
          disabled={page >= totalPages - 1}
        />
      </Pagination>
    </section>
  );
};

export default ListaTableDashBoard;
