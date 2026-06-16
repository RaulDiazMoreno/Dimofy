import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Container, Image } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DataTable, { type TableColumn } from 'react-data-table-component';
import { useForm } from 'react-hook-form';
import { useUser } from './UserContext';
import { toast } from 'react-toastify';


interface Cancion {
  id: number;
  titulo: string;
  artista: string;
  duracion: string;
  album: string;
}

interface FormInputs {
  nombreLista: string;
}

const CrearLista: React.FC = () => {
  const navigate = useNavigate();
  const [caratulaFile, setCaratulaFile] = useState<File | null>(null);
  
  const [caratulaPreview, setCaratulaPreview] = useState<string | null>(null);
  const [tituloCancion, setTituloCancion] = useState('');
  const [artista, setArtista] = useState('');
  const [resultados, setResultados] = useState<Cancion[]>([]);
  const [cancionesSeleccionadas, setCancionesSeleccionadas] = useState<Cancion[]>([]);
  const { user } = useUser(); 
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>();

  const handleCaratulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCaratulaFile(file);
      setCaratulaPreview(URL.createObjectURL(file));
    }
  };

  // Limpieza de URL de carátula
  useEffect(() => {
    return () => {
      if (caratulaPreview) {
        URL.revokeObjectURL(caratulaPreview);
      }
    };
  }, [caratulaPreview]);

  const buscarCanciones = async () => {
    try {
      const params = new URLSearchParams();
      if (tituloCancion) params.append('titulo', tituloCancion);
      if (artista) params.append('artista', artista);

      const response = await fetch(`/app/listas/canciones?${params.toString()}`);
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType?.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Respuesta inesperada del servidor: ${text}`);
      }

      const data: Cancion[] = await response.json();
      setResultados(data);
    } catch (error) {
      console.error('Error al buscar canciones:', error);
    }
  };

  const agregarCancion = (cancion: Cancion) => {
    if (!cancionesSeleccionadas.find(c => c.id === cancion.id)) {
      setCancionesSeleccionadas([...cancionesSeleccionadas, cancion]);
    }
  };

  const eliminarCancion = (id: number) => {
    setCancionesSeleccionadas(prev => prev.filter(c => c.id !== id));
  };

  const onSubmit = async (data: FormInputs) => {
    if (cancionesSeleccionadas.length === 0) {
      toast.warn("Debes seleccionar al menos una canción.");
      return;
    }
    
    const formData = new FormData();
    formData.append('nombre', data.nombreLista);
    if (caratulaFile) {
      formData.append('caratula', caratulaFile);
    }
    formData.append('canciones', JSON.stringify(cancionesSeleccionadas.map(c => c.id)));
    if (!user) {
       toast.warn("Usuario no autenticado.");
      return;
    }

    formData.append('userName', user.username);
    formData.append('userId', user.id.toString());
    try {
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      if (!token) {
        toast.error("Token JWT no encontrado");
        return;
      }

      const response = await fetch('http://localhost:8080/app/listas/guardarLista', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
    if (response.ok) {
      toast.success("¡Lista creada correctamente!");
      navigate('/listas');
    } else {
      const errorText = await response.text();
      toast.error(`Error del servidor: ${errorText}`);
    }

      navigate('/listas');
    } catch (error) {
      console.error('Error al guardar la lista:', error);
    }
  };

  const columnasBusqueda: TableColumn<Cancion>[] = [
    { name: 'Título', selector: row => row.titulo, sortable: true },
    { name: 'Artista', selector: row => row.artista, sortable: true },
    { name: 'Duración', selector: row => row.duracion, sortable: true, width: '100px' },
    { name: 'Álbum', selector: row => row.album, sortable: true, grow: 2 },
    {
      name: 'Agregar',
      cell: row => (
        <Button variant="success" className="text-white" size="sm" onClick={() => agregarCancion(row)}>
          ➕
        </Button>
      ),
      ignoreRowClick: true,
      width: '100px',
    }
  ];

  const columnasSeleccionadas: TableColumn<Cancion>[] = [
    { name: 'Título', selector: row => row.titulo },
    { name: 'Artista', selector: row => row.artista },
    { name: 'Duración', selector: row => row.duracion, sortable: true, width: '100px' },
    { name: 'Álbum', selector: row => row.album, sortable: true, grow: 2 },
    {
      name: 'Eliminar',
      cell: row => (
        <Button variant="danger" size="sm" className="text-white" onClick={() => eliminarCancion(row.id)}>
          🗑️
        </Button>
      ),
      ignoreRowClick: true,
      width: '100px',
    },
  ];

  return (
    <Container className="mt-4">
      <h3>🆕 Crear Nueva Lista</h3>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row className="align-items-center mb-4">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Lista</Form.Label>
              <Form.Control
                type="text"
                {...register("nombreLista", { required: "Este campo es obligatorio" })}
                isInvalid={!!errors.nombreLista}
              />
              <Form.Control.Feedback type="invalid">
                {errors.nombreLista?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Seleccionar Carátula</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleCaratulaChange} />
            </Form.Group>
          </Col>
          <Col md={6} className="text-center">
            {caratulaPreview && (
              <Image src={caratulaPreview} alt="Vista previa de carátula" fluid style={{ maxHeight: '200px' }} />
            )}
          </Col>
        </Row>

        <Row className="align-items-end mb-3">
          <Col md={5}>
            <Form.Group>
              <Form.Label>Título de la Canción</Form.Label>
              <Form.Control
                type="text"
                value={tituloCancion}
                onChange={(e) => setTituloCancion(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group>
              <Form.Label>Artista</Form.Label>
              <Form.Control
                type="text"
                value={artista}
                onChange={(e) => setArtista(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Button className="w-100" onClick={buscarCanciones}>
              <FaSearch />
              <span className="ms-2">Buscar</span>
            </Button>
          </Col>
        </Row>

        <h5>Resultados de Búsqueda</h5>
        <DataTable columns={columnasBusqueda} data={resultados} dense pagination />

        <h5 className="mt-4">Canciones Seleccionadas</h5>
        <DataTable columns={columnasSeleccionadas} data={cancionesSeleccionadas} dense pagination />

        <div className="d-flex justify-content-end mt-4">
          <div className="col-3"></div>
          <div className="col-2 me-3">
            <Button variant="primary" type="submit">
              <FaSave />
              <span className="ms-2">Guardar Lista</span>
            </Button>
          </div>
          <div className="col-2">
            <Button variant="warning" onClick={() => navigate('/listas')}>
              <FaArrowLeft className="me-2" />
              <span className="ms-2">Volver</span>
            </Button>
          </div>
        </div>
      </Form>
    </Container>
  );
};

export default CrearLista;






