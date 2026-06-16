import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner, Pagination } from 'react-bootstrap';
import { FaRegCheckSquare, FaRegSquare } from 'react-icons/fa';
import ArtistasData from './Artista.json';

interface Artista {
  id: number;
  nombre: string;
}

interface ArtistasTableProps {
  onArtistaSeleccionado: (artista: Artista | null) => void;
  filtroNombre: string;
  resetTrigger: boolean;
  artistaSeleccionado?: Artista | null;
}

const ArtistasTable: React.FC<ArtistasTableProps> = ({
  onArtistaSeleccionado,
  filtroNombre,
  resetTrigger,
  artistaSeleccionado,
}) => {
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [artistaSeleccionadoId, setArtistaSeleccionadoId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(0);

  const rowsPerPage = 5;

  useEffect(() => {
    setLoading(true);
    setArtistas(ArtistasData);
    setLoading(false);
  }, []);

  useEffect(() => {
    setPage(0);
  }, [filtroNombre]);

  useEffect(() => {
    setArtistaSeleccionadoId(null);
  }, [resetTrigger]);

 useEffect(() => {
  if (!artistaSeleccionado) return;

  const index = artistas.findIndex(a => a.id === artistaSeleccionado.id);
  if (index !== -1) {
    setArtistaSeleccionadoId(artistaSeleccionado.id);
    const pageIndex = Math.floor(index / rowsPerPage);
    setPage(pageIndex);
  }
}, [artistaSeleccionado, artistas]);



  const artistasFiltrados = artistas.filter((a) =>
    a.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  const totalPages = Math.ceil(artistasFiltrados.length / rowsPerPage);
  const paginatedData = artistasFiltrados.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const handleSeleccionar = (artista: Artista) => {
    if (artistaSeleccionadoId === artista.id) {
      setArtistaSeleccionadoId(null);
      onArtistaSeleccionado(null);
    } else {
      setArtistaSeleccionadoId(artista.id);
      onArtistaSeleccionado(artista);
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
            {paginatedData.map((artista) => (
              <tr
                key={artista.id}
                className={artistaSeleccionadoId === artista.id ? 'table-info' : ''}
              >
                <td style={{ width: '60px' }}>{artista.id}</td>
                <td style={{ width: '100%' }}>{artista.nombre}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <Button
                    variant={
                      artistaSeleccionadoId === artista.id
                        ? 'success'
                        : 'outline-secondary'
                    }
                    size="sm"
                    onClick={() => handleSeleccionar(artista)}
                    active={artistaSeleccionadoId === artista.id}
                  >
                    {artistaSeleccionadoId === artista.id ? (
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
        <Pagination.Next
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages - 1}
        />
        <Pagination.Last
          onClick={() => setPage(totalPages - 1)}
          disabled={page >= totalPages - 1}
        />
      </Pagination>
    </section>
  );
};

export default ArtistasTable;


