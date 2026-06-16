import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Image, Col, Row, Container } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaEdit } from 'react-icons/fa';
import GenerosTable from './GenerosTable';
import PaisesTable from './PaisesTable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface Pais {
  idpais: number;
  nombre: string;
  bandera: string;
}

interface Genero {
  idGenero: number;
  nombreGenero: string;
}

interface Artista {
  idArtista: number;
  nombre: string;
  anyoInicio: string;
  paises: Pais;
  generos: Genero;
  foto: string;
  resumenWikipedia: string;
}

const EditarArtista: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artista, setArtista] = useState<Artista | null>(null);
  const [nuevaCaratula, setNuevaCaratula] = useState<File | null>(null);
  const [previewCaratula, setPreviewCaratula] = useState<string | null>(null);
  const [busquedaGenero, setBusquedaGenero] = useState('');
  const [busquedaPais] = useState('');
  const [generoSeleccionado, setGeneroSeleccionado] = useState<Genero | null>(null);
  const [paisSeleccionado, setPaisSeleccionado] = useState<Pais | null>(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchArtista = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/login');
        return;
      }
      const { token } = JSON.parse(userData);

      try {
        const response = await fetch(`http://localhost:8080/app/artistas/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          toast.error('¡Artista no encontrado!');
          return;
        }

        const data: Artista = await response.json();
        setArtista(data);
        setGeneroSeleccionado(data.generos);
        setPaisSeleccionado(data.paises);
      } catch {
        toast.error('Error de red al cargar el artista.');
      }
    };

    fetchArtista();
  }, [id, navigate]);

  useEffect(() => {
    if (paisSeleccionado || generoSeleccionado) {
      setArtista((prev) =>
        prev
          ? {
              ...prev,
              paises: paisSeleccionado ?? prev.paises,
              generos: generoSeleccionado ?? prev.generos,
            }
          : prev
      );
    }
  }, [paisSeleccionado, generoSeleccionado]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!artista) return;
    const { name, value } = e.target;
    setArtista({ ...artista, [name]: value });
  };

  const obtenerNombreArchivo = (ruta: string) => ruta?.split('/').pop() || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!artista?.nombre.trim()) {
      toast.error('El nombre del artista es obligatorio.');
      return;
    }

    if (!artista?.anyoInicio.match(/^\d{4}$/)) {
      toast.error('El año de inicio debe tener 4 dígitos.');
      return;
    }

    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const { token } = JSON.parse(userData);

    const formData = new FormData();
    formData.append('nombre', artista.nombre);
    formData.append('anyoInicio', artista.anyoInicio);
    formData.append('resumenWikipedia', artista.resumenWikipedia);

    const idPais = paisSeleccionado?.idpais ?? artista.paises?.idpais ?? null;
    const idGenero = generoSeleccionado?.idGenero ?? artista.generos?.idGenero ?? null;

    if (!idPais || !idGenero) {
      toast.error('Faltan datos obligatorios: país y género.');
      return;
    }

    formData.append('idPais', idPais.toString());
    formData.append('idGenero', idGenero.toString());

    if (nuevaCaratula) {
      formData.append('foto', nuevaCaratula);
    }

    try {
      const response = await fetch(`http://localhost:8080/app/artistas/editar/${artista.idArtista}`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('¡Artista modificado correctamente!');
        navigate('/admin/artistasA');
      } else {
        toast.error('¡Error al actualizar el artista!');
      }
    } catch {
      toast.error('Error de red al intentar actualizar el artista.');
    }
  };

  const handleVolver = () => {
    navigate('/admin/artistasA');
  };

  if (!artista) return <p>Cargando...</p>;

  return (
    <Container className="mt-4">
      <h3>
        <FaEdit style={{ color: 'blue' }} className="me-2" />
        Editar Artista
      </h3>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={artista.nombre}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Año Inicio</Form.Label>
              <Form.Control
                type="text"
                name="anyoInicio"
                value={artista.anyoInicio}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>País</Form.Label>
              <Form.Control
                type="text"
                name="paises"
                value={artista.paises?.nombre || ''}
                readOnly
                style={{ backgroundColor: '#e9ecef' }}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <PaisesTable
              onPaisSeleccionado={(pais) => {
                if (pais) {
                  const paisAdaptado: Pais = {
                    idpais: pais.id, 
                    nombre: pais.nombre,
                    bandera: pais.bandera,
                  };
                  setPaisSeleccionado(paisAdaptado);
                } else {
                  setPaisSeleccionado(null);
                }
              }}
              filtroNombre={busquedaPais}
              resetTrigger={false}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Género</Form.Label>
              <Form.Control
                type="text"
                name="generos"
                value={artista.generos?.nombreGenero || ''}
                readOnly
                style={{ backgroundColor: '#e9ecef' }}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Row className="align-items-end mb-2">
              <Col xs={8}>
                <Form.Group>
                  <Form.Label>Buscar Género</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Buscar género..."
                    value={busquedaGenero}
                    onChange={(e) => setBusquedaGenero(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <GenerosTable
            onGeneroSeleccionado={(genero) => {
              if (genero) {
                const generoAdaptado: Genero = {
                  idGenero: genero.id, 
                  nombreGenero: genero.nombreGenero 
                };
                setGeneroSeleccionado(generoAdaptado);
              } else {
                setGeneroSeleccionado(null);
              }
            }}
            filtroNombre={busquedaGenero}
            resetTrigger={false}
          />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Seleccionar Imagen</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0] || null;
                  setNuevaCaratula(file);
                  if (previewCaratula) URL.revokeObjectURL(previewCaratula);
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setPreviewCaratula(url);
                  } else {
                    setPreviewCaratula(null);
                  }
                }}
              />
              {artista.foto && !previewCaratula && (
                <Form.Text className="text-muted">
                  Carátula actual: {obtenerNombreArchivo(artista.foto)}
                </Form.Text>
              )}
            </Form.Group>
          </Col>
          <Col md={6} className="d-flex align-items-center justify-content-center">
            {(previewCaratula || artista.foto) && (
              <Image
                src={
                  previewCaratula
                    ? previewCaratula
                    : `/assets/Artistas/${obtenerNombreArchivo(artista.foto)}`
                }
                alt="Carátula"
                fluid
                style={{ maxHeight: '200px' }}
              />
            )}
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Información</Form.Label>
              <Form.Control
                as="textarea"
                name="resumenWikipedia"
                value={artista.resumenWikipedia}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <div className="d-flex justify-content-end mt-4">
            <Button variant="primary" type="submit" className="me-3">
              <FaSave className="me-2" />
              Guardar
            </Button>
            <Button variant="warning" onClick={handleVolver}>
              <FaArrowLeft className="me-2" />
              Volver
            </Button>
          </div>
        </Row>
      </Form>
      <ToastContainer />
    </Container>
  );
};

export default EditarArtista;
