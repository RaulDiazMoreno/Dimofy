import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaPlus } from 'react-icons/fa';
import GenerosTable from './GenerosTable';
import PaisesTable from './PaisesTable'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface Genero {
  id: number;
  nombreGenero: string;
}

interface Pais {
  id: number;
  nombre: string;
  bandera: string
}


const CrearArtista = () => {
  const [titulo, setTitulo] = useState('');
  const [generoSeleccionado, setGeneroSeleccionado] = useState<Genero | null>(null);
  const [paisSeleccionado, setPaisSeleccionado] = useState<Pais | null>(null);
  const [anyo, setAnyo] = useState('');
  const [caratula, setCaratula] = useState<File | null>(null);
  const [caratulaPreview, setCaratulaPreview] = useState<string | null>(null);
  const [busquedaGenero, setBusquedaGenero] = useState('');
  const [busquedaPais, setBusquedaPais] = useState('');
  const navigate = useNavigate();

  const handleCaratulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCaratula(file);
      setCaratulaPreview(URL.createObjectURL(file));
    }
  };

  const handleGuardar = async () => {
    if (!generoSeleccionado || !paisSeleccionado) {
      toast.error('Debes seleccionar un género y un pais');
      return;
    }

    const userData = localStorage.getItem('user');
    if (!userData) return;
    const { token } = JSON.parse(userData);

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('anyo', anyo);
    formData.append('idGenero', generoSeleccionado.id.toString());
    formData.append('idPais', paisSeleccionado.id.toString());

    if (caratula) {
      formData.append('cover', caratula);
    }

    try {
      const response = await fetch('http://localhost:8080/app/artistas/crear', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log("Respuesta OK");
        toast.success("¡Artista creado correctamente!");
      } else {
        const errorText = await response.text();
        toast.error(`Error al crear el artista': ${errorText}`);
      }
    } catch (error) {
      toast.error(`Error al crear el artista': ${error}`);
    }
  };

  const handleVolver = () => {
    navigate('/admin/artistasA');
  };

  return (
    <Container className="mt-4">
      <h3>🆕 Crear Nuevo Artista</h3>
      <Form onSubmit={(e) => { e.preventDefault(); handleGuardar(); }}>
        {/* Título y Año */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nombre Artista</Form.Label>
              <Form.Control
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Año</Form.Label>
              <Form.Control
                type="text"
                value={anyo}
                onChange={(e) => setAnyo(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          {/* Género */}
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
              <Col xs={4}>
                <Button
                  variant="outline-primary"
                  className="w-100 mt-4"
                  onClick={() => navigate('/generos/crear')}
                >
                  <FaPlus className="me-2" />
                  Crear Género
                </Button>
              </Col>
            </Row>
            <GenerosTable
              onGeneroSeleccionado={setGeneroSeleccionado}
              filtroNombre={busquedaGenero} resetTrigger={false}            />
          </Col>
           <Col md={6}>
            <Row className="align-items-end mb-2">
              <Col xs={8}>
                <Form.Group>
                  <Form.Label>Buscar Pais</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Buscar pais..."
                    value={busquedaPais}
                    onChange={(e) => setBusquedaPais(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <PaisesTable
              onPaisSeleccionado={setPaisSeleccionado}
              filtroNombre={busquedaPais} resetTrigger={false}            />
          </Col>
        </Row>


        {/* Carátula */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Seleccionar Carátula</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleCaratulaChange} />
            </Form.Group>
          </Col>
          <Col md={6} className="text-center">
            {caratulaPreview && (
              <Image src={caratulaPreview} alt="Vista previa" fluid style={{ maxHeight: '200px' }} />
            )}
          </Col>
        </Row>

        {/* Botones */}
        <div className="d-flex justify-content-end">
          <col></col>
          <Button variant="primary" type="submit" className="me-3">
            <FaSave className="me-2" />
            Guardar
          </Button>
          <Button variant="warning" onClick={handleVolver}>
            <FaArrowLeft className="me-2" />
            Volver
          </Button>
        </div>
      </Form>
      <ToastContainer />
    </Container>
  );
};

export default CrearArtista;