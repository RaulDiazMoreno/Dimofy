import React from "react";
import { Table, Button, Pagination } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

interface Genero {
  idGenero: number;
  nombreGenero: string;
}

interface Props {
  data: Genero[];
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onEditar: (id: number) => void;
  onBorrar: (id: number) => void;
}

const GenerosTableA: React.FC<Props> = ({
  data,
  page,
  rowsPerPage,
  onPageChange,
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
              <th>Nombre del Género</th>
              <th>Editar</th>
              <th>Borrar</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center">
                  No se encontraron géneros.
                </td>
              </tr>
            ) : (
              paginatedData.map((genero) => (
                <tr key={genero.idGenero}>
                  <td>{genero.nombreGenero}</td>

                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onEditar(genero.idGenero)}
                      aria-label={`Editar género ${genero.nombreGenero}`}
                    >
                      <FaEdit />
                    </Button>
                  </td>

                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onBorrar(genero.idGenero)}
                      aria-label={`Borrar género ${genero.nombreGenero}`}
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

export default GenerosTableA;
