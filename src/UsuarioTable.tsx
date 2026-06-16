import React from 'react';
import { Table, Button, Pagination } from 'react-bootstrap';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

interface Usuarios {
  id: number;
  username: string;
  nombre: string;
  apellidos: string;
}

interface UsuariosTableProps {
  data: Usuarios[];
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onEditar: (id: number) => void;
  onBorrar: (id: number) => void;
  onConsultar: (id: number) => void;
}

const UsuarioTable: React.FC<UsuariosTableProps> = ({
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
    <section className="mb-5">
      <div className="table-responsive">
        <Table striped bordered hover size="sm">
          <thead className="table-primary">
            <tr>
              <th>Id</th>
              <th>UserName</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Consultar</th>
              <th>Editar</th>
              <th>Borrar</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.username}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.apellidos}</td>
                <td>
                  <Button variant="outline-info" size="sm" onClick={() => onConsultar(usuario.id)}>
                    <FaEye />
                  </Button>
                </td>
                <td>
                  <Button variant="outline-primary" size="sm" onClick={() => onEditar(usuario.id)}>
                    <FaEdit />
                  </Button>
                </td>
                <td>
                  <Button variant="outline-danger" size="sm" onClick={() => onBorrar(usuario.id)}>
                    <FaTrash />
                  </Button>
                </td>
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

export default UsuarioTable;
