import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Row, Col, Image } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaSearch,FaEdit } from 'react-icons/fa';
import DataTable, { type TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';


interface Artista {
  idArtista: number;
  nombre: string;

}

interface Album {
  idAlbum: number;
  titulo: string;
}

interface Cancion {
  id: number;
  titulo: string;
  artista: Artista;
  duracion: string;
  album: Album;
}

interface CancionBackend {
  idCancion: number;
  titulo: string;
  artista: Artista;
  duracion: string;
  album: Album;
}



const EditarLista: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [caratula, setCaratula] = useState('');
  const [nuevaCaratula, setNuevaCaratula] = useState<File | null>(null);
  const [previewCaratula, setPreviewCaratula] = useState<string | null>(null);
  const [cancionesLista, setCancionesLista] = useState<Cancion[]>([]);
  const [tituloCancion, setTituloCancion] = useState('');
  const [artista, setArtista] = useState('');
  const [resultados, setResultados] = useState<Cancion[]>([]);

  useEffect(() => {
  const fetchLista = async () => {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const { token } = JSON.parse(userData);

    try {
      const response = await fetch(`http://localhost:8080/app/listas/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los datos de la lista');
      }

      const data = await response.json();

      setNombre(data.nombre);
      setCaratula(data.caratula);

      // ✅ Mapear correctamente las canciones con `id`
      const cancionesMapeadas: Cancion[] = (data.canciones || []).map((c: CancionBackend) => ({
        ...c,
        id: c.idCancion,
      }));

      setCancionesLista(cancionesMapeadas);
    } catch (error) {
      console.error('❌ Error al cargar la lista:', error);
    }
  };

  fetchLista();
}, [id]);


  const handleGuardar = async () => {
  const userData = localStorage.getItem('user');
  if (!userData) {
    toast.error('Usuario no autenticado');
    return;
  }

  const { token } = JSON.parse(userData);

  try {
    // Validación básica
    if (!nombre.trim()) {
      toast.warning('El nombre de la lista no puede estar vacío');
      return;
    }

    if (cancionesLista.length === 0) {
      toast.warning('La lista debe contener al menos una canción');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre);

    if (nuevaCaratula) {
      formData.append('caratula', nuevaCaratula);
    }

    const cancionesIds = cancionesLista.map(c => c.id);
    formData.append('canciones', JSON.stringify(cancionesIds));

    const response = await fetch(`http://localhost:8080/app/listas/Editar/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${errorText}`);
    }

    toast.success('✅ Lista guardada correctamente');
    navigate('/listas');
  } catch (error) {
    console.error('❌ Error al guardar la lista:', error);
    toast.error('Ocurrió un error al guardar la lista');
  }
};



  const obtenerNombreArchivo = (ruta: string): string => {
    return ruta.split(/[/\\]/).pop() || '';
  };

  const eliminarCancion = (id: number) => {
    setCancionesLista(prev => prev.filter(c => c.id !== id));
  };

  const columnasCancionesLista: TableColumn<Cancion>[] = [
      { name: 'Título', selector: row => row.titulo },
      { name: 'Artista', selector: row => row.artista.nombre},
      { name: 'Duración', selector: row => row.duracion, sortable: true, width: '100px' },
      { name: 'Álbum', selector: row => row.album.titulo, sortable: true, grow: 2 },
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

     const columnasBusqueda: TableColumn<Cancion>[] = [
         { name: 'Título', selector: row => row.titulo },
         { name: 'Artista', selector: row => row.artista.nombre},
         { name: 'Duración', selector: row => row.duracion, sortable: true, width: '100px' },
         { name: 'Álbum', selector: row => row.album.titulo, sortable: true, grow: 2 },
        {
  name: 'Agregar',
  cell: row => {
    const yaAgregada = cancionesLista.some(c => String(c.id) === String(row.id));
    return (
      <Button
        variant="success"
        className="text-white"
        size="sm"
        onClick={() => agregarCancion(row)}
        disabled={yaAgregada}
      >
        {yaAgregada ? '✔️' : '➕'}
      </Button>
    );
  },
  ignoreRowClick: true,
  width: '100px',
}

      ];

  const buscarCanciones = async () => {
  try {
    const params = new URLSearchParams();
    if (tituloCancion) params.append('titulo', tituloCancion);
    if (artista) params.append('artista', artista);

    const response = await fetch(`/app/listas/cancionesE?${params.toString()}`);
    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType?.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Respuesta inesperada del servidor: ${text}`);
    }

    const data: CancionBackend[] = await response.json();

    const cancionesMapeadas: Cancion[] = data.map(c => ({
      ...c,
      id: c.idCancion, // 👈 mapeamos correctamente
    }));

    setResultados(cancionesMapeadas);
  } catch (error) {
    console.error('Error al buscar canciones:', error);
  }
};



const agregarCancion = (cancion: Cancion) => {
  console.log('🧪 ID de la canción a agregar:', cancion.id, typeof cancion.id);
  console.log('🧪 IDs en la lista:', cancionesLista.map(c => `${c.id} (${typeof c.id})`));

  if (!cancionesLista.some(c => c.id === cancion.id)) {
    const nuevaLista = [...cancionesLista, cancion];
    console.log('✅ Canción agregada:', cancion);
    console.log('🎵 Lista actualizada:', nuevaLista);
    setCancionesLista(nuevaLista);
  }
};




  return (
  <div className="container mt-4">
    <h2>
      <FaEdit style={{ color: 'blue' }} className="me-2" />
      Editar Lista
    </h2>

    {/* Campos + Imagen */}
    <Row className="mb-4">
      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre de la Lista</Form.Label>
          <Form.Control
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Seleccionar nueva carátula</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0] || null;
              setNuevaCaratula(file);
              if (file) {
                setPreviewCaratula(URL.createObjectURL(file));
              }
            }}
          />
          {caratula && !previewCaratula && (
            <Form.Text className="text-muted">
              Carátula actual: {obtenerNombreArchivo(caratula)}
            </Form.Text>
          )}
        </Form.Group>
      </Col>

      <Col md={6} className="d-flex align-items-center justify-content-center">
        {(previewCaratula || caratula) && (
          <Image
            src={
              previewCaratula
                ? previewCaratula
                : `/assets/Cover/${obtenerNombreArchivo(caratula)}`
            }
            alt="Carátula"
            fluid
            style={{ maxHeight: '200px' }}
          />
        )}
      </Col>
    </Row>

    {/* Tabla de canciones */}
    <h5>Canciones en la Lista</h5>
    <DataTable
      key={cancionesLista.length} 
      columns={columnasCancionesLista}
      data={cancionesLista}
      dense
      pagination
    />
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
    {/* Botón guardar */}
   {/* Botones alineados a la derecha */}
 <div className="d-flex justify-content-end mt-4">
          <div className="col-3"></div>
          <div className="col-2 me-3">
            <Button variant="primary" type="button" onClick={handleGuardar}>
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
  </div>
);
};

export default EditarLista;







