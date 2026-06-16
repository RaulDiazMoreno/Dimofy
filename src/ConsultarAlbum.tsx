import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Image, Col, Row, Container } from 'react-bootstrap';
import { FaArrowLeft, FaEye} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DataTable from 'react-data-table-component';



interface Cancion {
  id: number;
  titulo: string;
  duracion: string;
}

interface Album {
  idAlbum: number;
  titulo: string;
  anyo: string;
  artista: string;
  genero: string;
  cover: string;
  canciones: Cancion[]; 
}

const ConsultarAlbum: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [previewCaratula] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbum = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const { token } = JSON.parse(userData);
      const response = await fetch(`http://localhost:8080/app/albums/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlbum(data);
      } else {
        toast.error("¡Álbum no encontrado!");
      }
    };

    fetchAlbum();
  }, [id]);


  const handleVolver = () => {
    navigate('/admin/albumsA');
  };

  const obtenerNombreArchivo = (ruta: string) => {
    return ruta?.split('/').pop();
  };

  if (!album) return <p>Cargando...</p>;

  return (
  <Container className="mt-4">
    <div className="container mt-4">
      <h3>
        <FaEye style={{ color: 'blue' }} className="me-2" />
        Consultar Álbum
      </h3>
      <Row>
        <Col md={8}>
          <Form>
            <Row className="mb-3">
              <Col md={7}>
                <Form.Group className="mb-3">
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    type="text"
                    name="titulo"
                    value={album.titulo}
                    readOnly
                    style={{ backgroundColor: '#e9ecef' }}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>Artista</Form.Label>
                  <Form.Control
                    type="text"
                    name="artista"
                    value={album.artista}
                    readOnly
                    style={{ backgroundColor: '#e9ecef' }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
               <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Año</Form.Label>
                  <Form.Control
                    type="text"
                    name="anyo"
                    value={album.anyo}
                    readOnly
                    style={{ backgroundColor: '#e9ecef' }}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Género</Form.Label>
                  <Form.Control
                    type="text"
                    name="genero"
                    value={album.genero}
                    readOnly
                    style={{ backgroundColor: '#e9ecef' }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Col>
        <Col md={4} className="d-flex align-items-start justify-content-center">
          {(previewCaratula || album.cover) && (
                <Image src={
                      previewCaratula? previewCaratula
                                    : `/assets/Cover/${obtenerNombreArchivo(album.cover)}`
                                }
                       alt="Carátula"
                       fluid
                       style={{ maxHeight: '200px' }}
                />
           )}
        </Col>
      </Row>
    </div>
    {album.canciones && album.canciones.length > 0 && (
      <>
        <h5 className="mt-4">Listado de Canciones</h5>
        <DataTable
          columns={[
            { name: 'Título', selector: row => row.titulo, sortable: true },
            { name: 'Duración', selector: row => row.duracion, sortable: true },
          ]}
          data={album.canciones}
          pagination
          highlightOnHover
          striped
        />
      </>
    )}
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

export default ConsultarAlbum;