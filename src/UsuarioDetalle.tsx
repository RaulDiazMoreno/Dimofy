import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft,FaIdBadge,
  FaUser,
  FaAddressCard,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaGlobe,
  FaCalendarAlt } from 'react-icons/fa';
import paisData from './Paises.json';


interface Usuario {
  id: number;
  username: string;
  nombre: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  fechaNacimiento: string; // o Date si lo parseas
  pais: string;
  imagenBase64: string;
  fechaAlta: string; // o Date
}

interface Pais {
  id: number;
  nombre: string;
  bandera: string
}

const UsuarioDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getToken = (): string | null => {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    return JSON.parse(userData).token;
  };

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(`http://localhost:8080/app/usuarios/admin/consultar/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsuario(data);
        } else {
          setError('No se pudo obtener la información del usuario.');
        }
      } catch (err) {
        setError('Error de conexión al obtener el usuario.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [id]);

  const handleVolver = () => {
    navigate('/admin/usuarios');
  };

  const formatearFecha = (fechaIso: string): string => {
    const fecha = new Date(fechaIso);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}-${mes}-${año}`;
  };

 const obtenerPais = (nombrePais: string): Pais | undefined => {
    return paisData.find((p: Pais) => p.nombre.toLowerCase() === nombrePais.toLowerCase());
 };


  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <Alert variant="danger" className="mt-4">{error}</Alert>;
  }

  return (
    <div className="container mt-4">
      <Card>
        <Card.Header as="h5">👤 Detalle del Usuario</Card.Header>
        <Card.Body className="d-flex justify-content-between">
  <div>
    <Card.Text><FaIdBadge className="me-2" /><strong>ID:</strong> {usuario?.id}</Card.Text>
    <Card.Text><FaUser className="me-2" /><strong>Username:</strong> {usuario?.username}</Card.Text>
    <Card.Text><FaUser className="me-2" /><strong>Nombre:</strong> {usuario?.nombre}</Card.Text>
    <Card.Text><FaAddressCard className="me-2" /><strong>Apellidos:</strong> {usuario?.apellidos}</Card.Text>
    <Card.Text><FaIdBadge className="me-2" /><strong>DNI:</strong> {usuario?.dni}</Card.Text>
    <Card.Text><FaEnvelope className="me-2" /><strong>Email:</strong> {usuario?.email}</Card.Text>
    <Card.Text><FaPhone className="me-2" /><strong>Teléfono:</strong> {usuario?.telefono}</Card.Text>
    <Card.Text>
        <FaBirthdayCake className="me-2" />
        <strong>Fecha de Nacimiento:</strong> {usuario?.fechaNacimiento && formatearFecha(usuario.fechaNacimiento)}
    </Card.Text>
    <Card.Text>
        <FaCalendarAlt className="me-2" />
        <strong>Fecha de Alta:</strong> {usuario?.fechaAlta && formatearFecha(usuario.fechaAlta)}
    </Card.Text>
    <Card.Text>
  <FaGlobe className="me-2" />
  <strong>País:</strong>{' '}
  {usuario?.pais && (
    <>
      {obtenerPais(usuario.pais)?.bandera && (
        <img
          src={obtenerPais(usuario.pais)!.bandera}
          alt={`Bandera de ${usuario.pais}`}
          style={{ width: '24px', height: '16px', marginRight: '8px', verticalAlign: 'middle' }}
        />
      )}
      {usuario.pais}
    </>
  )}
</Card.Text>


  </div>

  {usuario?.imagenBase64 && (
    <div>
      <img src={usuario.imagenBase64} alt="Usuario" style={{ maxWidth: '200px', borderRadius: '8px' }} />
    </div>
  )}
</Card.Body>

      </Card>
       <div className="row">
             <div className="col-3"></div>
             <div className="col-3"></div>
             <div className="col-3"></div>
             <div className="col-3">
                <Button variant="warning" className="text-white mt-3" onClick={handleVolver}>
                    <FaArrowLeft className="me-2" />
                    Volver
                </Button>
             </div>
       </div>
    </div>
   
  );
};

export default UsuarioDetalle;
