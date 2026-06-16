import React from "react";
import { Table, Button, Pagination } from "react-bootstrap";
import { FaEdit, FaTrash, FaCompactDisc } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Cancion {
  idCancion: number;
  titulo: string;
  artista: string;
  album: string;
  genero: string;
  anyo: string;
  duracion: string;
}

interface Props {
  data: Cancion[];
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onEditar: (id: number) => void;
  onBorrar: (id: number) => void;
}

const CancionesTable: React.FC<Props> = ({
  data,
  page,
  rowsPerPage,
  onPageChange,
  onEditar,
  onBorrar,
}) => {
  const navigate = useNavigate();

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
              <th>Título</th>
              <th>Artista</th>
              <th>Álbum</th>
              <th>Género</th>
              <th>Año</th>
              <th>Duración</th>
              <th>Ir al Álbum</th>
              <th>Editar</th>
              <th>Borrar</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center">
                  No se encontraron canciones.
                </td>
              </tr>
            ) : (
              paginatedData.map((cancion) => (
                <tr key={cancion.idCancion}>
                  <td>{cancion.titulo}</td>
                  <td>{cancion.artista}</td>
                  <td>{cancion.album}</td>
                  <td>{cancion.genero}</td>
                  <td>{cancion.anyo}</td>
                  <td>{cancion.duracion}</td>

                  <td>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/album/titulo/${encodeURIComponent(cancion.album)}`
                        )
                      }
                      aria-label={`Ir al álbum ${cancion.album}`}
                    >
                      <FaCompactDisc />
                    </Button>
                  </td>

                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onEditar(cancion.idCancion)}
                      aria-label={`Editar canción ${cancion.titulo}`}
                    >
                      <FaEdit />
                    </Button>
                  </td>

                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onBorrar(cancion.idCancion)}
                      aria-label={`Borrar canción ${cancion.titulo}`}
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
          <Pagination.First
            onClick={() => onPageChange(0)}
            disabled={page === 0}
          />
          <Pagination.Prev
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
          />
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

export default CancionesTable;
