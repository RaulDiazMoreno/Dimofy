import React, { useEffect, useState } from 'react';
import { Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import UsuarioTable from './UsuarioTable';

interface Usuarios {
  id: number;
  username: string;
  nombre: string;
  apellidos: string;
}

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuarios[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuarios | null>(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const navigate = useNavigate();
  const rowsPerPage = 5;

  const getToken = (): string | null => {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    return JSON.parse(userData).token;
  };

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(`http://localhost:8080/app/usuarios/admin`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsuarios(data);
        } else {
          setError('Error al obtener la lista de usuarios.');
        }
      } catch (error) {
        setError('Error de conexión al obtener usuarios.');
        console.error(error);
      }
    };

    fetchUsuarios();
  }, []);

  const handleDelete = (id: number) => {
    const usuario = usuarios.find((u) => u.id === id);
    setUsuarioSeleccionado(usuario || null);
    setShowConfirm(true);
  };

  const confirmarBorrado = async () => {
    if (!usuarioSeleccionado) return;

    setLoadingDelete(true);
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`http://localhost:8080/app/usuarios/admin/borrar/${usuarioSeleccionado.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUsuarios((prev) => prev.filter((u) => u.id !== usuarioSeleccionado.id));
      } else {
        setError('Error al borrar el usuario.');
      }
    } catch (error) {
      setError('Error de conexión al borrar usuario.');
      console.error(error);
    } finally {
      setLoadingDelete(false);
      setShowConfirm(false);
      setUsuarioSeleccionado(null);
    }
  };

  const handleEditar = (id: number) => {
    navigate(`/admin/usuarios/editar/${id}`);
  };

  const handleConsultar = (id: number) => {
    navigate(`/admin/usuarios/consultar/${id}`);
  };

  const handleVolver = () => {
    navigate('/home');
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col">
          <h3>👥 Usuarios</h3>
        </div>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <UsuarioTable
        data={usuarios}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onEditar={handleEditar}
        onBorrar={handleDelete}
        onConsultar={handleConsultar}
      />

      <div className="row mt-4">
        <div className="col-3"></div>
        <div className="col-3"></div>
        <div className="col-3"></div>
        <div className="col d-flex justify-content-end">
          <Button variant="warning" className="text-white" onClick={handleVolver}>
            <FaArrowLeft className="me-2" />
            Volver
          </Button>
        </div>
      </div>

      {/* Modal de confirmación */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} aria-labelledby="confirm-delete-modal">
        <Modal.Header closeButton>
          <Modal.Title id="confirm-delete-modal">Confirmar Borrado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas borrar el usuario "{usuarioSeleccionado?.username}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={loadingDelete}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarBorrado} disabled={loadingDelete}>
            {loadingDelete ? <Spinner animation="border" size="sm" /> : 'Borrar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Usuarios;

