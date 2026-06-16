import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner, Pagination } from 'react-bootstrap';
import { FaRegCheckSquare, FaRegSquare } from 'react-icons/fa';
import paisData from './Paises.json';

interface Pais {
  id: number;
  nombre: string;
  bandera: string
}

interface PaisTableProps {
  onPaisSeleccionado: (pais: Pais | null) => void;
  filtroNombre: string;
  resetTrigger: boolean;
  paisSeleccionado?: Pais | null;
}

const PaisesTable: React.FC<PaisTableProps> = ({
  onPaisSeleccionado,
  filtroNombre,
  resetTrigger,
  paisSeleccionado,
}) => {
  const [pais, setPais] = useState<Pais[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paisSeleccionadoId, setPaisSeleccionadoId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(0);

  const rowsPerPage = 5;

  useEffect(() => {
    setLoading(true);
    setPais(paisData);
    setLoading(false);
  }, []);

  useEffect(() => {
    setPage(0);
  }, [filtroNombre]);

  useEffect(() => {
    setPaisSeleccionadoId(null);
  }, [resetTrigger]);

  useEffect(() => {   
    if (paisSeleccionado && pais.length > 0) {
        setPaisSeleccionadoId(paisSeleccionado.id);
        const index = pais.findIndex(g => g.id === paisSeleccionado.id);
        if (index !== -1) {
          const pageIndex = Math.floor(index / rowsPerPage);
          setPage(pageIndex);
        }
    }
  }, [paisSeleccionado, pais]);

  const paisFiltrados = pais.filter(g =>
    g.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  const totalPages = Math.ceil(paisFiltrados.length / rowsPerPage);
  const paginatedData = paisFiltrados.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleSeleccionar = (pais: Pais) => {
    if (paisSeleccionadoId === pais.id) {
      setPaisSeleccionadoId(null);
      onPaisSeleccionado(null);
    } else {
      setPaisSeleccionadoId(pais.id);
      onPaisSeleccionado(pais);
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
            {paginatedData.map((pais) => (
              <tr key={pais.id} className={paisSeleccionadoId === pais.id ? 'table-info' : ''}>
                <td style={{ width: '60px' }}>{pais.id}</td>
                <td style={{ width: '100%' }}>
                  <img
                    src={pais.bandera}
                    alt={`Bandera de ${pais.nombre}`}
                    style={{ width: '24px', height: '16px', marginRight: '8px', objectFit: 'cover' }}
                  />
                  {pais.nombre}
                </td>

                <td style={{ whiteSpace: 'nowrap' }}>
                  <Button
                    variant={paisSeleccionadoId === pais.id ? 'success' : 'outline-secondary'}
                    size="sm"
                    onClick={() => handleSeleccionar(pais)}
                    active={paisSeleccionadoId === pais.id}
                  >
                    {paisSeleccionadoId === pais.id ? (
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

export default PaisesTable;