import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GenerosTableA from './GenerosTableA';
import GeneroFormModal from './GeneroFormModal';

interface Genero {
  idGenero: number;
  nombreGenero: string;
}

const GenerosA: React.FC = () => {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [filtro, setFiltro] = useState('');
  const [filtroDebounced, setFiltroDebounced] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [generoSeleccionado, setGeneroSeleccionado] = useState<Genero | null>(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 6;
  const navigate = useNavigate();
  const [showFormModal, setShowFormModal] = useState(false);
  const [generoEditando, setGeneroEditando] = useState<Genero | undefined>(undefined);

  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) return;
        const { token } = JSON.parse(userData);

        const response = await fetch(`http://localhost:8080/app/generos/total`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setGeneros(data);
        } else {
          toast.error("¡Error al obtener géneros!");
        }
      } catch (error) {
        toast.error("¡Error de conexión!");
        console.log(error);
      }
    };

    fetchGeneros();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFiltroDebounced(filtro);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filtro]);

  const generosFiltrados = generos.filter(g =>
    g.nombreGenero.toLowerCase().includes(filtroDebounced.toLowerCase())
  );

  const handleDelete = (id: number) => {
    const seleccionado = generos.find(g => g.idGenero === id);
    setGeneroSeleccionado(seleccionado || null);
    setShowConfirm(true);
  };

  const confirmarBorrado = async () => {
    if (!generoSeleccionado) return;

    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      const { token } = JSON.parse(userData);

      const response = await fetch(`http://localhost:8080/app/generos/eliminar/${generoSeleccionado.idGenero}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setGeneros(generos.filter(g => g.idGenero !== generoSeleccionado.idGenero));
        toast.success("¡Género borrado!");
      } else {
        toast.error("¡Error al borrar el género!");
      }
    } catch (error) {
      toast.error("¡Error de conexión!");
      console.log(error);
    } finally {
      setShowConfirm(false);
      setGeneroSeleccionado(null);
    }
  };

  const handleCrear = () => {
    setGeneroEditando(undefined);
    setShowFormModal(true);
  };

  const handleEditar = (id: number) => {
    const genero = generos.find(g => g.idGenero === id);
    setGeneroEditando(genero);
    setShowFormModal(true);
  };

  const handleVolver = () => {
    navigate('/home');
  };

  const handleSaveGenero = async (genero: Genero) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      const { token } = JSON.parse(userData);

      const url = genero.idGenero
        ? `http://localhost:8080/app/generos/editar/${genero.idGenero}`
        : `http://localhost:8080/app/generos/crear`;

      const method = genero.idGenero ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(genero),
      });

      if (response.ok) {
        const nuevoGenero = await response.json();
        if (genero.idGenero) {
          setGeneros(prev =>
            prev.map(g => (g.idGenero === nuevoGenero.idGenero ? nuevoGenero : g))
          );
          toast.success("¡Género actualizado!");
        } else {
          setGeneros(prev => [...prev, nuevoGenero]);
          toast.success("¡Género creado!");
        }
        setShowFormModal(false);
      } else {
        toast.error("¡Error al guardar el género!");
      }
    } catch (error) {
      toast.error("¡Error de conexión!");
      console.log(error);
    }
  };

  return (
    <div className="container mt-4">
      <h3>🎼 Géneros</h3>
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="col-md-3 text-end">
          <Button variant="success" onClick={handleCrear}>
            <FaPlus className="me-2" />
            Crear Género
          </Button>
        </div>
      </div>

      {generosFiltrados.length === 0 ? (
        <p>No se encontraron géneros con ese nombre.</p>
      ) : (
        <GenerosTableA
          data={generosFiltrados}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onEditar={handleEditar}
          onBorrar={handleDelete}
        />
      )}

      <GeneroFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        onSave={handleSaveGenero}
        genero={generoEditando}
      />

      <div className="row mt-4">
        <div className="col-4"></div>
        <div className="col-4"></div>
        <div className="col d-flex justify-content-end">
          <Button variant="warning" className="text-white" onClick={handleVolver}>
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
          ¿Estás seguro de que deseas borrar el género "{generoSeleccionado?.nombreGenero}"?
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

export default GenerosA;

