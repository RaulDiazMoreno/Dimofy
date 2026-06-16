import React from 'react';
import { Table, Button, Pagination } from 'react-bootstrap';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';


interface Albums {
  idAlbum: number;
  titulo: string;
  artista: string;
  genero: string;
  anyo: string;
  cover: string;
}


interface AlbumsTableProps {
  data: Albums[];
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onEditar: (id: number) => void;
  onBorrar: (id: number) => void;
  onConsultar: (id: number) => void;
}

const AlbumsTable: React.FC<AlbumsTableProps> = ({
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
        <Table striped bordered hover size="sm" className="small">
          <thead className="table-primary">
            <tr>
              <th>Id</th>
              <th>Título</th>
              <th>Artista</th>
              <th>Género</th>
              <th>Año</th>
              <th>Consultar</th>
              <th>Editar</th>
              <th>Borrar</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((album) => (
              <tr key={album.idAlbum}>
                <td>{album.idAlbum}</td>
                <td>{album.titulo}</td>
                <td>{album.artista ?? 'Desconocido'}</td>
                <td>{album.genero ?? 'Desconocido'}</td>
                <td>{album.anyo}</td>
                <td>
                  <Button variant="outline-info" size="sm" onClick={() => onConsultar(album.idAlbum)}>
                    <FaEye />
                  </Button>
                </td>
                <td>
                  <Button variant="outline-primary" size="sm" onClick={() => onEditar(album.idAlbum)}>
                    <FaEdit />
                  </Button>
                </td>
                <td>
                  <Button variant="outline-danger" size="sm" onClick={() => onBorrar(album.idAlbum)}>
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

export default AlbumsTable;

