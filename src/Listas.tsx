import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import ListasTable from './ListasTable';
import './listas-dark.css';


interface Lista {
  idLista: number;
  nombre: string;
  caratula: string;
  numeroCanciones: string;
}

const Listas: React.FC = () => {
  const { user } = useUser();
  const [listas, setListas] = useState<Lista[]>([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);
  const [listaSeleccionada, setListaSeleccionada] = useState<Lista | null>(null);

  useEffect(() => {
    const fetchListas = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) return;

        const { token, id: userId } = JSON.parse(userData);
        const response = await fetch(`http://localhost:8080/app/listas/usuario/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setListas(data);
        } else {
          console.error('Error al obtener listas');
        }
      } catch (error) {
        console.error('Error de conexión:', error);
      }
    };

    fetchListas();
  }, []);

  const handleCrear = () => {
    console.log('Crear nueva lista para usuario ID:', user?.id);
    navigate('/listas/crear');
  };

  const handleEditar = (id: number) => {
    navigate(`/listas/editar/${id}`);
  };


  const handleBorrar = (id: number) => {
    const lista = listas.find((l) => l.idLista === id);
    setListaSeleccionada(lista || null);
    setShowConfirm(true);
  };

  const confirmarBorrado = async () => {
    if (!listaSeleccionada) return;

    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const { token } = JSON.parse(userData);
      const response = await fetch(`http://localhost:8080/app/listas/${listaSeleccionada.idLista}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setListas(listas.filter((l) => l.idLista !== listaSeleccionada.idLista));
      } else {
        console.error('Error al borrar la lista');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setShowConfirm(false);
      setListaSeleccionada(null);
    }
  };

  const handleConsultar = (id: number) => {
    navigate(`/listas/consultar/${id}`);
  };

  const handleVolver = () => {
    navigate('/home');
  };

  return (
  <div className="listas-page">
    <div className="listas-panel">
      <div className="listas-head">
          <h2 className="listas-title">
            <span className="l-title-icon" aria-hidden="true">📋</span>
            Listas
          </h2>

          <div className="listas-actions">
            <Button className="l-btn l-btn-primary" onClick={handleCrear}>
              <FaPlus className="me-2" />
              Crear Lista
            </Button>
          </div>
      </div>


      <ListasTable
        data={listas}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onEditar={handleEditar}
        onBorrar={handleBorrar}
        onConsultar={handleConsultar}
      />

      <div className="mt-3 d-flex justify-content-end">
        <Button className="l-btn" variant="warning" onClick={handleVolver}>
          <FaArrowLeft className="me-2" />
          Volver
        </Button>
      </div>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <div className="modal-content l-modal">
          <Modal.Header className="l-modal" closeButton>
            <Modal.Title>Confirmar Borrado</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            ¿Estás seguro de que deseas borrar la lista "{listaSeleccionada?.nombre}"?
          </Modal.Body>
          <Modal.Footer className="l-modal">
            <Button className="l-btn" variant="secondary" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button className="l-btn" variant="danger" onClick={confirmarBorrado}>
              Borrar
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </div>
  </div>
  );
};

export default Listas;


