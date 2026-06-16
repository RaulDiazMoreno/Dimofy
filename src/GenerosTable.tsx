import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner, Pagination } from 'react-bootstrap';
import { FaRegCheckSquare, FaRegSquare } from 'react-icons/fa';
import generosData from './generos.json';

interface Genero {
  id: number;
  nombreGenero: string;
}

interface GenerosTableProps {
  onGeneroSeleccionado: (genero: Genero | null) => void;
  filtroNombre: string;
  resetTrigger: boolean;
  generoSeleccionado?: Genero | null;
}

const GenerosTable: React.FC<GenerosTableProps> = ({
  onGeneroSeleccionado,
  filtroNombre,
  resetTrigger,
  generoSeleccionado,
}) => {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generoSeleccionadoId, setGeneroSeleccionadoId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(0);

  const rowsPerPage = 5;

  useEffect(() => {
    setLoading(true);
    setGeneros(generosData);
    setLoading(false);
  }, []);

  useEffect(() => {
    setPage(0);
  }, [filtroNombre]);

  useEffect(() => {
    setGeneroSeleccionadoId(null);
  }, [resetTrigger]);

  useEffect(() => {   
    if (generoSeleccionado && generos.length > 0) {
        setGeneroSeleccionadoId(generoSeleccionado.id);
        const index = generos.findIndex(g => g.id === generoSeleccionado.id);
        if (index !== -1) {
          const pageIndex = Math.floor(index / rowsPerPage);
          setPage(pageIndex);
        }
    }
  }, [generoSeleccionado, generos]);

  const generosFiltrados = generos.filter(g =>
    g.nombreGenero.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  const totalPages = Math.ceil(generosFiltrados.length / rowsPerPage);
  const paginatedData = generosFiltrados.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleSeleccionar = (genero: Genero) => {
    if (generoSeleccionadoId === genero.id) {
      setGeneroSeleccionadoId(null);
      onGeneroSeleccionado(null);
    } else {
      setGeneroSeleccionadoId(genero.id);
      onGeneroSeleccionado(genero);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <section className="mb-5">
      <div className="table-responsive">
        <Table striped bordered hover size="sm">
          <thead className="table-primary">
            <tr>
              <th>Id</th>
              <th>Nombre</th>
              <th>Seleccionar</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((genero) => (
              <tr key={genero.id} className={generoSeleccionadoId === genero.id ? 'table-info' : ''}>
                <td style={{ width: '60px' }}>{genero.id}</td>
                <td style={{ width: '100%' }}>{genero.nombreGenero}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <Button
                    variant={generoSeleccionadoId === genero.id ? 'success' : 'outline-secondary'}
                    size="sm"
                    onClick={() => handleSeleccionar(genero)}
                    active={generoSeleccionadoId === genero.id}
                  >
                    {generoSeleccionadoId === genero.id ? (
                      <FaRegCheckSquare className="me-1" />
                    ) : (
                      <FaRegSquare className="me-1" />
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Pagination className="justify-content-center">
        <Pagination.First onClick={() => setPage(0)} disabled={page === 0} />
        <Pagination.Prev onClick={() => setPage(page - 1)} disabled={page === 0} />
        <Pagination.Item active>{page + 1}</Pagination.Item>
        <Pagination.Next onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1} />
        <Pagination.Last onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} />
      </Pagination>
    </section>
  );
};

export default GenerosTable;




