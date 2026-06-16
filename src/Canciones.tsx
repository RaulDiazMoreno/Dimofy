import React, { useState} from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { FaArrowLeft, FaBrush, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CancionesTable from './CancionesTable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import generosData from './generos.json'; 
import './canciones-dark.css';
import { FaMusic } from 'react-icons/fa';



interface Cancion {
  idCancion: number;
  titulo: string;
  artista: string;
  album: string;
  genero: string;
  anyo: string;
  duracion: string;
}

interface AlbumInfo {
  titulo: string;
  genero: string;
  anyo: string;
  canciones: Cancion[];
}

interface Genero {
  id: number;
  nombreGenero: string;
}

const Canciones: React.FC = () => {
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [filteredCanciones, setFilteredCanciones] = useState<Cancion[]>([]);
  const [tituloFiltro, setTituloFiltro] = useState('');
  const [artistaFiltro, setArtistaFiltro] = useState('');
  const [anyoFiltro, setAnyoFiltro] = useState('');
  const [generoFiltro, setGeneroFiltro] = useState('');
  const [albumFiltro, setAlbumFiltro] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancionSeleccionada, setCancionSeleccionada] = useState<Cancion | null>(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const navigate = useNavigate();

  const buscarCanciones = async () => {
    const queryParams = new URLSearchParams({
      titulo: tituloFiltro,
      artista: artistaFiltro,
      anyo: anyoFiltro,
      genero: generoFiltro,
      album: albumFiltro,
    });

    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      const { token } = JSON.parse(userData);

      const response = await fetch(`http://localhost:8080/app/canciones/buscar?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Respuesta del backend:", data);

       if (Array.isArray(data) && data.length > 0) {
          const cancionesFormateadas = (data as AlbumInfo[]).flatMap((albumInfo) =>
    albumInfo.canciones.map((c) => ({
        idCancion: c.idCancion,
        titulo: c.titulo,
        artista: c.artista,
        album: albumInfo.titulo,
        genero: albumInfo.genero || '',
        anyo: albumInfo.anyo || '',
        duracion: c.duracion,
    }))
    );

          setCanciones(cancionesFormateadas);
          setFilteredCanciones(cancionesFormateadas);
          setPage(0);
        }else {
          toast.error("La respuesta del servidor no contiene canciones válidas.");
          console.error("Respuesta inesperada:", data);
        }
        setPage(0);
      } else {
        toast.error("¡Error al buscar canciones!");
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      toast.error("¡Error de conexión!");
    }
  };

  const handleDelete = (id: number) => {
    const seleccionada = canciones.find(c => c.idCancion === id);
    setCancionSeleccionada(seleccionada || null);
    setShowConfirm(true);
  };

  const confirmarBorrado = async () => {
    if (!cancionSeleccionada) return;

    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const { token } = JSON.parse(userData);
      const response = await fetch(`http://localhost:8080/app/canciones/eliminar/${cancionSeleccionada.idCancion}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCanciones(canciones.filter(c => c.idCancion !== cancionSeleccionada.idCancion));
        toast.success("¡Canción borrada!");
      } else {
        toast.error("¡Error al borrar la canción!");
      }
    } catch (error) {
      console.log(error);
      toast.error("¡Error de conexión!");
    } finally {
      setShowConfirm(false);
      setCancionSeleccionada(null);
    }
  };

  const handleEditar = (id: number) => {
    navigate(`/admin/cancionesA/editar/${id}`);
  };

  const handleVolver = () => {
    navigate('/home');
  };

  const limpiarCampos = () => {
  setTituloFiltro('');
  setArtistaFiltro('');
  setAnyoFiltro('');
  setGeneroFiltro('');
  setAlbumFiltro('');
};


  return (
  <div className="canciones-page">
    <div className="canciones-panel">
      <div className="canciones-head">
        <h2 className="canciones-title">
          <FaMusic className="c-title-icon" />
          Buscar Canciones
        </h2>
      </div>
      {/* Filtros (grid consistente con Albums/Artistas) */}
      <div className="canciones-filters">
        <div className="cf-4">
          <input
            type="text"
            className="form-control c-input"
            placeholder="Buscar por título"
            value={tituloFiltro}
            onChange={(e) => setTituloFiltro(e.target.value)}
          />
        </div>

        <div className="cf-4">
          <input
            type="text"
            className="form-control c-input"
            placeholder="Buscar por artista"
            value={artistaFiltro}
            onChange={(e) => setArtistaFiltro(e.target.value)}
          />
        </div>

        <div className="cf-4">
          <input
            type="text"
            className="form-control c-input"
            placeholder="Buscar por álbum"
            value={albumFiltro}
            onChange={(e) => setAlbumFiltro(e.target.value)}
          />
        </div>

        <div className="cf-6">
          <Form.Select
            className="c-input"
            value={generoFiltro}
            onChange={(e) => setGeneroFiltro(e.target.value)}
          >
            <option value="">Todos los géneros</option>
            {generosData.map((g: Genero) => (
              <option key={g.id} value={g.nombreGenero}>
                {g.nombreGenero}
              </option>
            ))}
          </Form.Select>
        </div>

        <div className="cf-2">
          <input
            type="text"
            className="form-control c-input"
            placeholder="Buscar por año"
            value={anyoFiltro}
            onChange={(e) => setAnyoFiltro(e.target.value)}
          />
        </div>

        <div className="cf-4 c-actions">
          <Button className="c-btn" variant="secondary" onClick={limpiarCampos}>
            <FaBrush className="me-2" />
            Limpiar
          </Button>

          <Button className="c-btn c-btn-primary" variant="primary" onClick={buscarCanciones}>
            <FaSearch className="me-2" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <CancionesTable
        data={filteredCanciones}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onEditar={handleEditar}
        onBorrar={handleDelete}
      />

      {/* Volver */}
      <div className="mt-3 d-flex justify-content-end">
        <Button className="c-btn" variant="warning" onClick={handleVolver}>
          <FaArrowLeft className="me-2" />
          Volver
        </Button>
      </div>

      {/* Modal confirmación */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <div className="modal-content c-modal">
          <Modal.Header className="c-modal" closeButton>
            <Modal.Title>Confirmar Borrado</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            ¿Estás seguro de que deseas borrar la canción "{cancionSeleccionada?.titulo}"?
          </Modal.Body>
          <Modal.Footer className="c-modal">
            <Button className="c-btn" variant="secondary" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button className="c-btn" variant="danger" onClick={confirmarBorrado}>
              Borrar
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  </div>
);
};

export default Canciones;