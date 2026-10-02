import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaArrowLeft,FaBomb,FaPlus, FaUpload } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AlbumsTable from './AlbumsTable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



interface Albums {
  idAlbum: number;
  titulo: string;
  artista: string;
  genero: string;
  anyo: string;
  cover: string;
}


const AlbumsA: React.FC = () => {
  const [albums, setAlbums] = useState<Albums[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<Albums[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tituloFiltro, setTituloFiltro] = useState(() => searchParams.get('titulo') || '');
  const [artistaFiltro, setArtistaFiltro] = useState(() => searchParams.get('artista') || '');
  const [showConfirm, setShowConfirm] = useState(false);
  const [albumSeleccionado, setAlbumSeleccionado] = useState<Albums | null>(null);
  const [page, setPage] = useState(() => {
    const pageParam = Number(searchParams.get('page'));
    return Number.isNaN(pageParam) || pageParam < 0 ? 0 : pageParam;
  });
  const rowsPerPage = 10;
  const navigate = useNavigate();
  const [showMassDeleteConfirm, setShowMassDeleteConfirm] = useState(false);


  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const userData = localStorage.getItem('user');
        
        if (!userData) {
          navigate('/login');
          return;
        }

        const { token } = JSON.parse(userData);

        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch("http://localhost:8080/app/albums/total", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Álbumes recibidos:', data);
          setAlbums(data);
          setFilteredAlbums(data);
        } else {
          console.error('Error al obtener álbumes');
          toast.error("¡Error al obtener álbumes!");
        }
      } catch (error) {
        console.error('Error de conexión:', error);
        toast.error("¡Error de conexión!");
      }
    };

    fetchAlbums();
  }, []);

  useEffect(() => {
    const filtrados = albums.filter((album) => {
      const titulo = album.titulo || '';
      const artistaNombre = album.artista || '';

      return (
        titulo.toLowerCase().includes(tituloFiltro.toLowerCase()) &&
        artistaNombre.toLowerCase().includes(artistaFiltro.toLowerCase())
      );
    });

    setFilteredAlbums(filtrados);
  }, [tituloFiltro, artistaFiltro, albums]);

  // Mantiene página y filtros en la URL para poder restaurarlos al volver
  // desde ConsultarAlbum o EditarAlbum.
  useEffect(() => {
    const params = new URLSearchParams();

    if (page > 0) {
      params.set('page', page.toString());
    }

    if (tituloFiltro.trim()) {
      params.set('titulo', tituloFiltro);
    }

    if (artistaFiltro.trim()) {
      params.set('artista', artistaFiltro);
    }

    setSearchParams(params, { replace: true });
  }, [page, tituloFiltro, artistaFiltro, setSearchParams]);

  // Si se borra el último elemento de la última página, retrocede una página.
  // En cualquier otro borrado se conserva la página actual.
  useEffect(() => {
    const totalPages = Math.ceil(filteredAlbums.length / rowsPerPage);

    if (totalPages > 0 && page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [filteredAlbums.length, page, rowsPerPage]);


  const handleDelete = (id: number) => {
    const albumSeleccionadoTemp = albums.find((l) => l.idAlbum === id);
    setAlbumSeleccionado(albumSeleccionadoTemp || null);
    setShowConfirm(true);
  };

  const confirmarBorrado = async () => {
    if (!albumSeleccionado) return;

    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const { token } = JSON.parse(userData);
      const response = await fetch(`http://localhost:8080/app/albums/eliminar/${albumSeleccionado.idAlbum}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAlbums((prevAlbums) =>
          prevAlbums.filter((l) => l.idAlbum !== albumSeleccionado.idAlbum)
        );
        toast.error("¡Album Borrado!");
      } else {
        console.error('Error al borrar el álbum');
         toast.error("¡Error al borrar el álbum!");
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      toast.error("¡Error de conexión!");
    } finally {
      setShowConfirm(false);
      setAlbumSeleccionado(null);
    }
  };

  const handleCrear = () => {
    navigate('/admin/albumsA/crear');
  };

   const handleCargaMasiva = () => {
    navigate('/admin/albumsA/carga');
  };

  const getReturnTo = () => {
    const params = new URLSearchParams();

    if (page > 0) {
      params.set('page', page.toString());
    }

    if (tituloFiltro.trim()) {
      params.set('titulo', tituloFiltro);
    }

    if (artistaFiltro.trim()) {
      params.set('artista', artistaFiltro);
    }

    const query = params.toString();
    return `/admin/albumsA${query ? `?${query}` : ''}`;
  };

  const handleEditar = (id: number) => {
    navigate(`/admin/albumsA/editar/${id}`, {
      state: { returnTo: getReturnTo() },
    });
  };

  const handleConsultar = (id: number) => {
    navigate(`/admin/albumsA/consultar/${id}`, {
      state: { returnTo: getReturnTo() },
    });
  };

  const handleBorradoMasivo = () => {
  setShowMassDeleteConfirm(true);
  };

  const confirmarBorradoMasivo = async () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const { token } = JSON.parse(userData);

    const response = await fetch(`http://localhost:8080/app/albums/borradoMasivo`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setAlbums([]);
      setFilteredAlbums([]);
      toast.success("¡Todos los álbumes y canciones han sido borrados!");
    } else {
      console.error('Error al borrar masivamente');
      toast.error("¡Error al borrar masivamente!");
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    toast.error("¡Error de conexión!");
  } finally {
    setShowMassDeleteConfirm(false);
  }
};



  const handleVolver = () => {
    navigate('/home');
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col">
          <h3>🎵 Albums</h3>
        </div>
      </div>
      <div className="row mb-3 align-items-end">
  <div className="col-md-3">
    <input
      type="text"
      className="form-control"
      placeholder="Buscar por título"
      value={tituloFiltro}
      onChange={(e) => {
        setTituloFiltro(e.target.value);
        setPage(0);
      }}
    />
  </div>
  <div className="col-md-3">
    <input
      type="text"
      className="form-control"
      placeholder="Buscar por artista"
      value={artistaFiltro}
      onChange={(e) => {
        setArtistaFiltro(e.target.value);
        setPage(0);
      }}
    />
  </div>
  <div className="col-md-2 text-end">
    <Button variant="success" onClick={handleCrear}>
        <FaPlus className="me-2" />
        Crear Album
    </Button>
  </div>
  <div className="col-md-2 text-end">
    <Button variant="secondary" onClick={handleCargaMasiva}>
        <FaUpload className="me-2" />
        Carga Masiva
    </Button>
  </div>
  <div className="col-md-2 text-end">
    <Button variant="primary" onClick={handleBorradoMasivo}>
        <FaBomb className="me-2" />
        Borrado Masivo
    </Button>
  </div>
</div>


      

      <AlbumsTable
        data={filteredAlbums}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onEditar={handleEditar}
        onBorrar={handleDelete}
        onConsultar={handleConsultar}
      />

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

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Borrado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas borrar el álbum "{albumSeleccionado?.titulo}"?
        </Modal.Body>
        <Modal.Footer>
           <Button variant="danger" onClick={confirmarBorrado}>
            Borrar
          </Button>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showMassDeleteConfirm} onHide={() => setShowMassDeleteConfirm(false)}>
      <Modal.Header closeButton>
        <Modal.Title>⚠️ Borrado Masivo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Esta acción eliminará <strong>todos los álbumes y sus canciones</strong> de forma permanente.
        ¿Estás seguro de que deseas continuar?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={confirmarBorradoMasivo}>
          Borrar Todo
        </Button>
        <Button variant="secondary" onClick={() => setShowMassDeleteConfirm(false)}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
    <ToastContainer />
    </div>
  );
};

export default AlbumsA;
