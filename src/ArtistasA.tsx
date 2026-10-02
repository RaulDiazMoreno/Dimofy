import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaBrush, FaPlus, FaSearch } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import generosData from './generos.json';
import paisData from './Paises.json';
import ArtistasTableA from './ArtistasTableA';
import Select from 'react-select';

interface Pais {
  bandera: string;
  id: number;
  nombre: string;
}

interface Artistas {
  idArtista: number;
  nombre: string;
  anyoInicio: string;
  paises: Pais;
  genero: string;
  foto: string;
}

interface Genero {
  id: number;
  nombreGenero: string;
}

const ArtistasA: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artistas, setArtistas] = useState<Artistas[]>([]);
  const [generoFiltro, setGeneroFiltro] = useState(() => searchParams.get('genero') || '');
  const [filteredArtistas, setFilteredArtistas] = useState<Artistas[]>([]);
  const [artistaFiltro, setArtistaFiltro] = useState(() => searchParams.get('artista') || '');
  const [anyoFiltro, setAnyoFiltro] = useState(() => searchParams.get('anyo') || '');
  const [paisFiltro, setPaisFiltro] = useState(() => searchParams.get('pais') || '');
  const [showConfirm, setShowConfirm] = useState(false);
  const [ArtistaSeleccionada, setArtistaSeleccionada] = useState<Artistas | null>(null);
  const [page, setPage] = useState(() => {
    const pagina = Number(searchParams.get('page'));
    return Number.isNaN(pagina) || pagina < 0 ? 0 : pagina;
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(() => searchParams.get('buscar') === '1');
  const rowsPerPage = 10;
  const navigate = useNavigate();

  const buscarArtista = async (resetPage = true) => {
    const queryParams = new URLSearchParams();

    if (artistaFiltro) queryParams.append('nombre', artistaFiltro);
    if (anyoFiltro) queryParams.append('anyoInicio', anyoFiltro);
    if (paisFiltro) queryParams.append('pais', paisFiltro);
    if (generoFiltro) queryParams.append('genero', generoFiltro);

    setLoading(true);

    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      const { token } = JSON.parse(userData);

      const response = await fetch(`http://localhost:8080/app/artistas/buscar?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Respuesta del backend:", data);

        if (Array.isArray(data)) {
          const artistaFormateadas = data.map((c: any) => ({
            idArtista: c.idArtista,
            nombre: c.nombre,
            anyoInicio: c.anyoInicio || '',
            paises: {
              id: c.paises?.id ?? 0,
              nombre: c.paises?.nombre ?? '',
              bandera: c.paises?.bandera ?? ''
            },
            foto: c.foto ?? null,
            genero: c.generos?.nombreGenero ?? '',
          }));

          setArtistas(artistaFormateadas);
          setFilteredArtistas(artistaFormateadas);
          setHasSearched(true);
          if (resetPage) {
            setPage(0);
          }
        } else {
          toast.error("La respuesta del servidor no contiene artistas válidos.");
        }
      } else {
        toast.error("¡Error al buscar artistas!");
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      toast.error("¡Error de conexión!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams();

    if (page > 0) params.set('page', page.toString());
    if (artistaFiltro.trim()) params.set('artista', artistaFiltro);
    if (anyoFiltro.trim()) params.set('anyo', anyoFiltro);
    if (paisFiltro.trim()) params.set('pais', paisFiltro);
    if (generoFiltro.trim()) params.set('genero', generoFiltro);
    if (hasSearched) params.set('buscar', '1');

    setSearchParams(params, { replace: true });
  }, [page, artistaFiltro, anyoFiltro, paisFiltro, generoFiltro, hasSearched, setSearchParams]);

  useEffect(() => {
    if (searchParams.get('buscar') === '1') {
      buscarArtista(false);
    }
    // Solo restauramos la búsqueda al montar el listado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(filteredArtistas.length / rowsPerPage);

    if (totalPages > 0 && page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [filteredArtistas.length, page]);

  const buildReturnTo = () => {
    const params = new URLSearchParams();

    if (page > 0) params.set('page', page.toString());
    if (artistaFiltro.trim()) params.set('artista', artistaFiltro);
    if (anyoFiltro.trim()) params.set('anyo', anyoFiltro);
    if (paisFiltro.trim()) params.set('pais', paisFiltro);
    if (generoFiltro.trim()) params.set('genero', generoFiltro);
    if (hasSearched) params.set('buscar', '1');

    return `/admin/artistasA${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const handleCrear = () => navigate('/admin/ArtistasA/crear');
  const handleVolver = () => navigate('/home');
  const handleEditar = (id: number) =>
    navigate(`/admin/ArtistasA/editar/${id}`, { state: { returnTo: buildReturnTo() } });
  const handleConsultar = (id: number) =>
    navigate(`/admin/ArtistasA/consultar/${id}`, { state: { returnTo: buildReturnTo() } });

  const handleDelete = (id: number) => {
    const seleccionada = artistas.find(c => c.idArtista === id);
    setArtistaSeleccionada(seleccionada || null);
    setShowConfirm(true);
  };

  const confirmarBorrado = async () => {
    if (!ArtistaSeleccionada) return;

    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const { token } = JSON.parse(userData);
      const response = await fetch(`http://localhost:8080/app/artistas/eliminar/${ArtistaSeleccionada.idArtista}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const idBorrado = ArtistaSeleccionada.idArtista;
        setArtistas((prev) => prev.filter(c => c.idArtista !== idBorrado));
        setFilteredArtistas((prev) => prev.filter(c => c.idArtista !== idBorrado));
        toast.success("¡Artista borrado!");
      } else {
        toast.error("¡Error al borrar el artista!");
      }
    } catch (error) {
      console.log(error);
      toast.error("¡Error de conexión!");
    } finally {
      setShowConfirm(false);
      setArtistaSeleccionada(null);
    }
  };

  const limpiarCampos = () => {
    setArtistaFiltro('');
    setAnyoFiltro('');
    setPaisFiltro('');
    setGeneroFiltro('');
    setPage(0);
    setHasSearched(false);
    setArtistas([]);
    setFilteredArtistas([]);
  };

  
const paisOptions = paisData.map((p: Pais) => ({
  value: p.nombre,
  label: (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img
        src={p.bandera}
        alt={p.nombre}
        style={{ width: '20px', height: '15px', marginRight: '8px' }}
      />
      {p.nombre}
    </div>
  ),
}));

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col">
          <h3>🎤 Artistas</h3>
        </div>
      </div>

      <div className="row mt-3 mb-3 align-items-end">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por artista"
            value={artistaFiltro}
            onChange={(e) => setArtistaFiltro(e.target.value)}
            aria-label="Buscar por artista"
          />
        </div>
        <div className="col-md-4">
          <Form.Select
            value={generoFiltro}
            onChange={(e) => setGeneroFiltro(e.target.value)}
            aria-label="Filtrar por género"
          >
            <option value="">Todos los géneros</option>
            {generosData.map((g: Genero) => (
              <option key={g.id} value={g.nombreGenero}>
                {g.nombreGenero}
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="col-md-4">
          
          <Select
            options={paisOptions}
            value={paisOptions.find((option) => option.value === paisFiltro) || null}
            onChange={(selected) => setPaisFiltro(selected?.value || '')}
            placeholder="Filtrar por país"
          />

        </div>
      </div>

      <div className="row mb-3 align-items-end">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por año"
            value={anyoFiltro}
            onChange={(e) => setAnyoFiltro(e.target.value)}
            aria-label="Buscar por año"
          />
        </div>
        <div className="col-md-3 text-end">
          <Button variant="primary" onClick={() => buscarArtista(true)} aria-label="Buscar artistas">
            <FaSearch className="me-2" />
            Buscar
          </Button>
        </div>
        <div className="col-md-3 text-end">
          <Button variant="success" onClick={handleCrear} aria-label="Crear artista">
            <FaPlus className="me-2" />
            Crear Artista
          </Button>
        </div>
        <div className="col-md-3 text-end">
          <Button variant="secondary" onClick={limpiarCampos} aria-label="Limpiar filtros">
            <FaBrush className="me-2" />
            Limpiar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" role="status" />
          <span className="ms-2">Cargando artistas...</span>
        </div>
      ) : (

<ArtistasTableA
  data={filteredArtistas} 
  page={page}
  rowsPerPage={rowsPerPage}
  onPageChange={setPage}
  onEditar={handleEditar}
  onBorrar={handleDelete}
  onConsultar={handleConsultar}
/>
      )}

      <div className="row mt-4">
        <div className="col-md-10"></div>
        <div className="col-md-2 text-end">
          <Button variant="warning" className="text-white" onClick={handleVolver} aria-label="Volver">
            <FaArrowLeft className="me-2" />
            Volver
          </Button>
        </div>
      </div>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Borrado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas borrar el artista "{ArtistaSeleccionada?.nombre}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarBorrado}>
            Borrar
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default ArtistasA;