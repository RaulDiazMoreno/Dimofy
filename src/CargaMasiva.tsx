import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaArrowLeft, FaDatabase, FaUpload, FaFilePdf } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import DataTable from 'react-data-table-component';
import { type TableColumn } from 'react-data-table-component';
import 'react-toastify/dist/ReactToastify.css';

type CancionDTO = {
  id: number;
  titulo: string;
  duracion: string;
  artista: string;
  album: string;
};

type AlbumCancionesDTO = {
  idAlbum: number;
  titulo: string;
  anyo: string;
  cover: string;
  artista: string;
  genero: string;
  canciones: CancionDTO[];
};

const CargaMasiva: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AlbumCancionesDTO[]>([]);
  const [generando, setGenerando] = useState(false);
  const [esRecopilatorio, setEsRecopilatorio] = useState(false);
  const [informeDisponible, setInformeDisponible] = useState(false); // Nuevo estado

  const handleVolver = () => {
    navigate('/admin/albumsA');
  };

  const handleCargaBd = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      const { token } = JSON.parse(userData);

      const response = await fetch(`http://localhost:8080/app/albums/cargar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        toast.error("¡Error al cargar el fichero en la base de datos!");
        return;
      }

      toast.success("✅ Fichero cargado correctamente en la base de datos");
      navigate('/admin/albumsA');
    } catch (error) {
      console.error('Error de conexión:', error);
      toast.error('Error al conectar con el backend');
    }
  };

  const handleGenerarFichero = async () => {
    try {
      setGenerando(true);
      setInformeDisponible(false); // Reiniciar estado
      const userData = localStorage.getItem('user');
      if (!userData) return;
      const { token } = JSON.parse(userData);

      const response = await fetch(`http://localhost:8080/app/albums/generar?recopilatorio=${esRecopilatorio}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        toast.error("¡Error al generar el fichero!");
        return;
      }

      const json = await response.json();
      const arrayData = json.body as AlbumCancionesDTO[];
      setData(arrayData);
      setInformeDisponible(true); // Activar botón PDF

      toast.info('📄 Informe disponible: puedes visualizar el PDF de la carga.');
    } catch (error) {
      console.error('Error de conexión:', error);
      toast.error('Error al generar el fichero');
      setInformeDisponible(false);
    } finally {
      setGenerando(false);
    }
  };

  const handleMostrarPdf = () => {
    window.open('/assets/CargaAlbums.pdf', '_blank');
  };

  const columns: TableColumn<AlbumCancionesDTO>[] = [
    {
      name: 'Título',
      selector: row => row.titulo,
      sortable: true,
      wrap: true
    },
    {
      name: 'Artista',
      selector: row => row.artista,
      sortable: true
    },
    {
      name: 'Año',
      selector: row => row.anyo,
      sortable: true,
      center: true
    },
    {
      name: 'Género',
      selector: row => row.genero,
      sortable: true
    },
    {
      name: 'Nº Canciones',
      selector: row => row.canciones?.length ?? 0,
      sortable: true,
      right: true
    }
  ];

  const puedeMostrarInforme = informeDisponible;

  return (
    <div className="container mt-4">
      <h3>🛢️ Carga Masiva Albums y Canciones</h3>

      <div className="row mt-5 align-items-center">
        <div className="col-3">
          <Button
            variant="secondary"
            onClick={handleGenerarFichero}
            disabled={generando || data.length > 0}
          >
            <FaUpload className="me-2" />
            {generando ? 'Generando...' : 'Generar Fichero Carga'}
          </Button>
        </div>
        <div className="col-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="recopilatorioCheck"
              checked={esRecopilatorio}
              onChange={(e) => setEsRecopilatorio(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="recopilatorioCheck">
              Recopilatorio
            </label>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col">
          <h5>📄 Datos Generados</h5>
          <DataTable
            columns={columns}
            data={Array.isArray(data) ? data : []}
            pagination
            highlightOnHover
            striped
            responsive
          />
        </div>
      </div>

      <div className="row mt-2">
        {data.length > 0 && (
          <div className="col-6">
            <Button variant="primary" onClick={handleCargaBd}>
              <FaDatabase className="me-2" />
              Cargar Fichero en Base de Datos
            </Button>
          </div>
        )}
        <div className="col-3">
          <Button
            variant="danger"
            onClick={handleMostrarPdf}
            className="me-2"
            disabled={!puedeMostrarInforme}
          >
            <FaFilePdf className="me-2" />
            Informe Carga Albums
          </Button>
        </div>
        <div className="col-3">
          <Button variant="warning" className="text-white" onClick={handleVolver}>
            <FaArrowLeft className="me-2" />
            Volver
          </Button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default CargaMasiva;








   