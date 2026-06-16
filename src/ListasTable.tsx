import React from 'react';
import { Table, Button, Image, Pagination } from 'react-bootstrap';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

interface Lista {
  idLista: number;
  nombre: string;
  caratula: string;
  numeroCanciones: string;
}

interface ListasTableProps {
  data: Lista[];
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onEditar: (id: number) => void;
  onBorrar: (id: number) => void;
  onConsultar: (id: number) => void; // Nueva función para consultar
}

const ListasTable: React.FC<ListasTableProps> = ({
  data,
  page,
  rowsPerPage,
  onPageChange,
  onEditar,
  onBorrar,
  onConsultar,
}) => {
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
  <section className="mb-4">
    <div className="l-table-wrap">
      <div className="table-responsive">
        <Table bordered hover size="sm" className="small l-table">
          <thead>
            <tr>
              <th>Carátula</th>
              <th>Nombre</th>
              <th>Canciones</th>
              <th>Consultar</th>
              <th>Editar</th>
              <th>Borrar</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((lista) => (
              <tr key={lista.idLista}>
                <td className="cover-col">
                    <Image
                      src={lista.caratula}
                      alt={lista.nombre}
                      className="l-cover"
                      rounded
                    />
                  </td>
                <td>{lista.nombre}</td>
                <td>{lista.numeroCanciones}</td>
                <td className="actions-col">
                  <Button className="l-mini-btn" variant="outline-info" size="sm" onClick={() => onConsultar(lista.idLista)}>
                    <FaEye />
                  </Button>
                </td>

                <td className="actions-col">
                  <Button className="l-mini-btn" variant="outline-primary" size="sm" onClick={() => onEditar(lista.idLista)}>
                    <FaEdit />
                  </Button>
                </td>

                <td className="actions-col">
                  <Button className="l-mini-btn" variant="outline-danger" size="sm" onClick={() => onBorrar(lista.idLista)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>

    <Pagination className="justify-content-center l-pagination mt-3">
      <Pagination.First onClick={() => onPageChange(0)} disabled={page === 0} />
      <Pagination.Prev onClick={() => onPageChange(page - 1)} disabled={page === 0} />
      <Pagination.Item active>{page + 1}</Pagination.Item>
      <Pagination.Next onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1} />
      <Pagination.Last onClick={() => onPageChange(totalPages - 1)} disabled={page >= totalPages - 1} />
    </Pagination>
  </section>
  );
};

export default ListasTable;
