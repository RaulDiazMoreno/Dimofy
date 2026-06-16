import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { parseBlob } from 'music-metadata-browser';
import CancionesTableI from './CancionesTableI';
import { FaArrowLeft, FaSave, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ArtistasTable from './ArtistasTable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Artista {
  id: number;
  nombre: string;
}

const CrearCanciones: React.FC = () => {
  const [, setArchivos] = useState<File[]>([]);
  const [canciones, setCanciones] = useState<any[]>([]);
  const [album, setAlbum] = useState('');
  const [anio, setAnio] = useState<Date>(new Date());
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const rowsPerPage = 10;
  const [artistaSeleccionado, setArtistaSeleccionado] = useState<Artista | null>(null);
  const [busquedaArtista, setBusquedaArtista] = useState('');

  const handleArchivos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setArchivos(files);

    const cancionesProcesadas = await Promise.all(files.map(async (file, index) => {
      try {
        const metadata = await parseBlob(file);
        return {
          id: index,
          titulo: metadata.common.title || file.name,
          duracion: metadata.format.duration
            ? `${Math.floor(metadata.format.duration / 60)}:${Math.floor(metadata.format.duration % 60).toString().padStart(2, '0')}`
            : 'Desconocida',
          album,
          artista: artistaSeleccionado?.nombre || '',
          anio: anio.getFullYear().toString()
        };
      } catch (error) {
        console.error('Error leyendo metadatos:', error);
        return {
          id: index,
          titulo: file.name,
          duracion: 'Desconocida',
          album,
          artista: artistaSeleccionado?.nombre || '',
          anio: anio.getFullYear().toString()
        };
      }
    }));

    setCanciones(cancionesProcesadas);
  };

  const handleGuardar = async () => {
  try {

    const userData = localStorage.getItem('user');
    if (!userData) return;
    const { token } = JSON.parse(userData);

    const response = await fetch('http://localhost:8080/app/canciones/crear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // <-- Aquí va el JWT
      },
      body: JSON.stringify(canciones),
    });

    if (response.ok) {
      toast.success('Canciones guardadas correctamente');
      navigate('/admin/cancionesA');
    } else {
      toast.error('Error al guardar las canciones');
    }
  } catch (error) {
    console.error('Error al guardar:', error);
    toast.error('Error de red al guardar las canciones');
  }
};


  const handleVolver = () => {
    navigate('/admin/cancionesA');
  };

  return (
    <Container className="mt-4">
      <h3>🆕 Crear Canciones de Álbum</h3>
      <Form onSubmit={(e) => { e.preventDefault(); handleGuardar(); }}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Título del Álbum</Form.Label>
              <Form.Control type="text" value={album} onChange={(e) => setAlbum(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Row className="align-items-end mb-2">
              <Col xs={8}>
                <Form.Group>
                  <Form.Label>Buscar Artista</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Buscar artista..."
                    value={busquedaArtista}
                    onChange={(e) => setBusquedaArtista(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs={4}>
                <Button
                  variant="outline-primary"
                  className="w-100 mt-4"
                  onClick={() => navigate('/artistas/crear')}
                >
                  <FaPlus className="me-2" />
                  Crear Artista
                </Button>
              </Col>
            </Row>
            <ArtistasTable
              onArtistaSeleccionado={setArtistaSeleccionado}
              filtroNombre={busquedaArtista}
              resetTrigger={false}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Seleccionar carpeta con archivos de música</Form.Label>
              <input
                type="file"
                className="form-control"
                multiple
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                webkitdirectory
                onChange={handleArchivos}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Año</Form.Label>
              <DatePicker
                selected={anio}
                onChange={(date: Date | null) => {
                  if (date) setAnio(date);
                }}
                showYearPicker
                dateFormat="yyyy"
                className="form-control"
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {canciones.length > 0 && (
        <CancionesTableI
          data={canciones}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
        />
      )}

      <Row>
        <Col md={6}></Col>
        <Col md={3}>
          <Button variant="primary" className="me-3" onClick={handleGuardar}>
            <FaSave className="me-2" />
            Guardar
          </Button>
        </Col>
        <Col md={3}>
          <Button variant="warning" className="text-white" onClick={handleVolver}>
            <FaArrowLeft className="me-2" />
            Volver
          </Button>
        </Col>
      </Row>
      <ToastContainer />
    </Container>
  );
};

export default CrearCanciones;

