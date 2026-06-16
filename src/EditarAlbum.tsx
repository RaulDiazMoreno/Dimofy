import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Image, Col, Row, Container } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaEdit } from 'react-icons/fa';
import GenerosTable from './GenerosTable';
import ArtistasTable from './ArtistasTable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Artista {
  id: number;
  nombre: string;
}

interface Genero {
  id: number;
  nombreGenero: string;
}

interface Album {
  idAlbum: number;
  titulo: string;
  anyo: string;
  artista: Artista;
  genero: Genero;
  cover: string;
}

const EditarAlbum: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [nuevaCaratula, setNuevaCaratula] = useState<File | null>(null);
  const [previewCaratula, setPreviewCaratula] = useState<string | null>(null);
  const [busquedaGenero, setBusquedaGenero] = useState('');
  const [busquedaArtista, setBusquedaArtista] = useState('');
  const [generoSeleccionado, setGeneroSeleccionado] = useState<Genero | null>(null);
  const [artistaSeleccionado, setArtistaSeleccionado] = useState<Artista | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbum = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const { token } = JSON.parse(userData);
      const response = await fetch(`http://localhost:8080/app/albums/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
          // Transformar artista y género si vienen como string
            const artistaTransformado = typeof data.artista === 'string'
              ? { id: 0, nombre: data.artista }
              : data.artista;

            const generoTransformado = typeof data.genero === 'string'
              ? { id: 0, nombreGenero: data.genero }
              : data.genero;

            const albumTransformado = {
              ...data,
              artista: artistaTransformado,
              genero: generoTransformado,
            };

            setAlbum(albumTransformado);
            setArtistaSeleccionado(artistaTransformado);
            setGeneroSeleccionado(generoTransformado);
      } else {
        toast.error("¡Álbum no encontrado!");
      }
    };

    fetchAlbum();
  }, [id]);

useEffect(() => {
  if (artistaSeleccionado) {
    setAlbum((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        artista: artistaSeleccionado,
      };
    });
  }
}, [artistaSeleccionado]);

useEffect(() => {
  if (generoSeleccionado) {
    setAlbum((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        genero: generoSeleccionado,
      };
    });
  }
}, [generoSeleccionado]);


useEffect(() => {
  if (album) {
    setArtistaSeleccionado(album.artista);
    setGeneroSeleccionado(album.genero);
  }
}, [album]);




  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!album) return;
    const { name, value } = e.target;
    setAlbum({ ...album, [name]: value });
  };

  const obtenerNombreArchivo = (ruta: string) => {
    return ruta?.split('/').pop();
  };

  const handleSubmit = async (e: React.FormEvent) => {
     
    e.preventDefault();

    if (!album ) {
      toast.error("Faltan datos obligatorios: asegúrate de seleccionar un artista y un género.");
      return;
    }

  const userData = localStorage.getItem('user');
  if (!userData) return;
  const { token } = JSON.parse(userData);

  if (!userData) {
        navigate('/login');
        return;
  }

  const formData = new FormData();
  formData.append('titulo', album.titulo);
  formData.append('anyo', album.anyo);

  const idArtistaS = artistaSeleccionado?.id;
  const idGeneroS = generoSeleccionado?.id;
  const idArtista = album.artista.nombre;
  const idGenero = album.genero.nombreGenero;

  
  if(!idArtistaS && !idArtista){
       toast.error("Faltan datos obligatorios: asegúrate de seleccionar un artista y un género.");
       return;
  }else{
    if(idArtistaS){
      formData.append('idArtista', idArtistaS.toString());
    }else{
      formData.append('idArtista', idArtista.toString());
    }
  }
  if(!idGeneroS && !idGenero)  {
        toast.error("Faltan datos obligatorios: asegúrate de seleccionar un artista y un género.");
        return;
  }else{
        if(idGeneroS){
          formData.append('idGenero', idGeneroS.toString());
        }else{
          
          formData.append('idGenero', idGenero.toString());
        }
  }    
  
  if (nuevaCaratula) {
    formData.append('cover', nuevaCaratula);
  }

  try {
    const response = await fetch(`http://localhost:8080/app/albums/editar/${album.idAlbum}`, {
      method: 'POST',
         body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      toast.success("¡Álbum modificado correctamente!");
      navigate('/admin/albumsA');
      return
    } else {
      toast.error("¡Error al actualizar el álbum!");
      return;
    }
  } catch (error) {
    console.error("Error en la petición:", error);
    toast.error("Error de red al intentar actualizar el álbum.");
    return;
  }
  
};


  const handleVolver = () => {
    navigate('/admin/albumsA');
  };

  if (!album) return <p>Cargando...</p>;

  return (
    <Container className="mt-4">
      <div className="container mt-4">
        <h3>
          <FaEdit style={{ color: 'blue' }} className="me-2" />
          Editar Álbum
        </h3>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  type="text"
                  name="titulo"
                  value={album.titulo}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Año</Form.Label>
                <Form.Control
                  type="text"
                  name="anyo"
                  value={album.anyo}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Artista</Form.Label>
                  <Form.Control
                    type="text"
                    name="artista"
                    value={artistaSeleccionado?.nombre || ''}
                    readOnly
                    style={{ backgroundColor: '#e9ecef' }} 
                  />
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
              </Row>
              {(!artistaSeleccionado || !artistaSeleccionado.id) && (
                <ArtistasTable
                  onArtistaSeleccionado={setArtistaSeleccionado}
                  filtroNombre={busquedaArtista}
                  resetTrigger={false}
                  artistaSeleccionado={artistaSeleccionado}
                />
              )}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Genero</Form.Label>
                <Form.Control
                  type="text"
                  name="genero"
                  value={generoSeleccionado?.nombreGenero || ''}
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
              {(!generoSeleccionado || !generoSeleccionado.id) && (
                <GenerosTable
                  onGeneroSeleccionado={setGeneroSeleccionado}
                  filtroNombre={busquedaGenero}
                  resetTrigger={false}
                  generoSeleccionado={generoSeleccionado}
                />
              )}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
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
                {album.cover && !previewCaratula && (
                  <Form.Text className="text-muted">
                    Carátula actual: {obtenerNombreArchivo(album.cover)}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-center justify-content-center">
              {(previewCaratula || album.cover) && (
                <Image
                  src={
                    previewCaratula
                      ? previewCaratula
                      : `/assets/Cover/${obtenerNombreArchivo(album.cover)}`
                  }
                  alt="Carátula"
                  fluid
                  style={{ maxHeight: '200px' }}
                />
              )}
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
      </div>
      <ToastContainer />
    </Container>
  );
};

export default EditarAlbum;



