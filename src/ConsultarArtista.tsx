import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Form, Image, Col, Row, Container,InputGroup } from 'react-bootstrap';
import { FaArrowLeft, FaEye} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface Pais {
  bandera: string;
  idpais: number;
  nombre: string;
}

interface Generos {
  idGenero: number;
  nombreGenero: string;
}

interface Artista {
  idArtista: number;
  nombre: string;
  anyoInicio: string;
  paises: Pais;
  generos: Generos;
  foto: string;
  resumenWikipedia: string; 
}

const ConsultarArtista: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artista, setArtista] = useState<Artista | null>(null);
  const [previewCaratula] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/admin/artistasA';

  useEffect(() => {
    const fetchArtista = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const { token } = JSON.parse(userData);
      const response = await fetch(`http://localhost:8080/app/artistas/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setArtista(data);
      } else {
        toast.error("¡Artista no encontrado!");
      }
    };

    fetchArtista();
  }, [id]);


  const handleVolver = () => {
    navigate(returnTo);
  };

const obtenerNombreArchivo = (ruta: string | undefined | null): string => {
  if (!ruta) return '';
  console.log(ruta.split(/[/\\]+/).pop() || '');
  return ruta.split(/[/\\]+/).pop() || '';
};




  if (!artista) return <p>Cargando...</p>;

  return (
  <Container className="mt-4">
    <div className="container mt-4">
      <h3>
        <FaEye style={{ color: 'blue' }} className="me-2" />
        Consultar Artista
      </h3>
      <Row>
        <Col md={8}>
          <Form>
            <Row className="mb-3">
              <Col md={7}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre Artista</Form.Label>
                  <Form.Control
                    type="text"
                    name="titulo"
                    value={artista.nombre}
                    readOnly
                    style={{ backgroundColor: '#e9ecef' }}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>Año</Form.Label>
                  <Form.Control
                    type="text"
                    name="artista"
                    value={artista.anyoInicio}
                    readOnly
                    style={{ backgroundColor: '#e9ecef' }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
               <Col md={4}>
                <Form.Group className="mb-3">
                <Form.Label>País</Form.Label>
                <InputGroup>
                    {artista.paises?.bandera && (
                    <InputGroup.Text style={{ backgroundColor: '#e9ecef' }}>
                        <Image
                        src={`/assets/Paises/${encodeURIComponent(obtenerNombreArchivo(artista.paises.bandera) || '')}`}
                        alt={`Bandera de ${artista.paises.nombre}`}
                        style={{ maxHeight: '20px' }}
                        />
                    </InputGroup.Text>
                    )}
                    <Form.Control
                    type="text"
                    name="pais"
                    value={artista.paises.nombre}
                    readOnly
                    style={{ backgroundColor: '#e9ecef' }}
                    />
                </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Género</Form.Label>
                  <Form.Control
                    type="text"
                    name="genero"
                    value={artista.generos.nombreGenero || ''}
                    readOnly
                    style={{ backgroundColor: '#e9ecef' }}
                    />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Col>
         <Col md={4} className="d-flex align-items-start justify-content-center">
                  {(previewCaratula || artista.foto) && (
                        <Image 
                               src={`/assets/Artistas/${encodeURIComponent(obtenerNombreArchivo(artista.foto) || '')}`}
                               alt="Foto Artista"
                               fluid
                               style={{ maxHeight: '200px' }}
                        />
                   )}
                </Col>
      </Row>
    </div>
     <Row className="mb-3">
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>Información</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={artista.resumenWikipedia}
              readOnly
              style={{ backgroundColor: '#e9ecef', whiteSpace: 'pre-wrap' }}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
                <div className="row mt-4">
                       <div className="col"></div>
                       <div className="col"></div>
                       <div className="col"></div>
                       <div className="col d-flex justify-content-end">
                          <Button variant="warning" className="text-white" onClick={handleVolver}>
                              <FaArrowLeft className="me-2" />
                               Volver
                           </Button>
                        </div>
                     </div>
            </Row>
    <ToastContainer />
  </Container>
);
};

export default ConsultarArtista;