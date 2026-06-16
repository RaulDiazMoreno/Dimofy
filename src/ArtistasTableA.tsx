import React from 'react';
import { Table, Button, Pagination } from 'react-bootstrap';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';

interface Pais {
  bandera: string;
  id: number;
  nombre: string;
}

interface Artista {
  idArtista: number;
  nombre: string;
  anyoInicio: string;
  paises: Pais;
  foto: string;
  genero: string;
}

interface Props {
  data: Artista[];
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onConsultar: (id: number) => void;
  onEditar: (id: number) => void;
  onBorrar: (id: number) => void;
}

const ArtistasTableA: React.FC<Props> = ({
  data,
  page,
  rowsPerPage,
  onPageChange,
  onConsultar,
  onEditar,
  onBorrar,
}) => {
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <section className="mb-5">
      <div className="table-responsive">
        <Table striped bordered hover size="sm" className="small">
          <thead className="table-primary">
            <tr>
              <th>Nombre</th>
              <th>Año Inicio</th>
              <th>País</th>
              <th>Género</th>
              <th>Consultar</th>
              <th>Editar</th>
              <th>Borrar</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  No se encontraron artistas.
                </td>
              </tr>
            ) : (
              paginatedData.map((artista) => (
                <tr key={artista.idArtista}>
                  <td>{artista.nombre}</td>
                  <td>{artista.anyoInicio}</td>
                  <td>
                    {artista.paises?.bandera ? (
                      <>
                        <img
                          src={`/assets/Paises/${encodeURIComponent(artista.paises.bandera.split('\\').pop() || '')}`}
                          alt={`Bandera de ${artista.paises.nombre}`}
                          style={{ width: '24px', height: '16px', marginRight: '8px' }}
                        />
                        {artista.paises.nombre}
                      </>
                    ) : (
                      'Sin país'
                    )}
                  </td>
                  <td>{artista.genero}</td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => onConsultar(artista.idArtista)}
                      aria-label={`Consultar artista ${artista.nombre}`}
                    >
                      <FaEye />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onEditar(artista.idArtista)}
                      aria-label={`Editar artista ${artista.nombre}`}
                    >
                      <FaEdit />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onBorrar(artista.idArtista)}
                      aria-label={`Borrar artista ${artista.nombre}`}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.First onClick={() => onPageChange(0)} disabled={page === 0} />
          <Pagination.Prev onClick={() => onPageChange(page - 1)} disabled={page === 0} />
          <Pagination.Item active>{page + 1}</Pagination.Item>
          <Pagination.Next
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
          />
          <Pagination.Last
            onClick={() => onPageChange(totalPages - 1)}
            disabled={page >= totalPages - 1}
          />
        </Pagination>
      )}
    </section>
  );
};

export default ArtistasTableA;

