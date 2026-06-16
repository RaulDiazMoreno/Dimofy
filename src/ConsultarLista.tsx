import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import DataTable, { type TableColumn } from 'react-data-table-component';
import './consultar-lista-dark.css';

interface Cancion {
  id: number;
  titulo: string;
  artista: string;
  duracion: string;
  album: string;
}

interface ListaDetalle {
  idLista: number;
  nombre: string;
  caratula: string;
  numeroCanciones: number | string;
}

const ConsultarLista: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [detalle, setDetalle] = useState<ListaDetalle | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) return;

        const { token } = JSON.parse(userData);

        // 1) Detalle de la lista (nombre/caratula/numCanciones)
        try {
          const rDetalle = await fetch(`http://localhost:8080/app/listas/detalle/${id}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (rDetalle.ok) {
            const d = await rDetalle.json();
            setDetalle(d);
          }
        } catch {
          // si no existe endpoint detalle, simplemente no mostramos detalle
        }

        // 2) Canciones de la lista
        const response = await fetch(`http://localhost:8080/app/listas/consultar/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCanciones(Array.isArray(data) ? data : []);
        } else {
          console.error('Error al obtener canciones');
        }
      } catch (error) {
        console.error('Error de conexión:', error);
      }
    };

    fetchData();
  }, [id]);

  const columnas: TableColumn<Cancion>[] = [
  {
    name: '#',
    cell: (_row: Cancion, index: number) => <span>{index + 1}</span>,
    width: '60px',
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
  {
    name: 'Título',
    selector: (row: Cancion) => row.titulo,
    sortable: true,
    grow: 1,           // 👈 más estrecha
    minWidth: '120px',
  },
  {
    name: 'Artista',
    selector: (row: Cancion) => row.artista,
    sortable: true,
    grow: 1,           // 👈 más estrecha
    minWidth: '120px',
  },
  {
    name: 'Álbum',
    selector: (row: Cancion) => row.album,
    sortable: true,
    grow: 1,           // 👈 más estrecha
    minWidth: '120px',
  },
  {
    name: 'Duración',
    selector: (row: Cancion) => row.duracion,
    sortable: true,
    right: true,
    grow: 0.7,         // 👈 menos crecimiento que las otras
    minWidth: '140px', // 👈 más espacio mínimo
  },
];


  const coverSrc = detalle?.caratula || '/assets/Cover/default.webp';

  return (
    <div className="cl-page">
      <div className="cl-panel">
        <div className="cl-header">
          <img className="cl-cover" src={coverSrc} alt={detalle?.nombre ?? 'Lista'} />

          <div className="cl-htext">
            <h2 className="cl-title">
              {detalle?.nombre ? detalle.nombre : 'Canciones de la Lista'}
            </h2>

            <div className="cl-sub">
              <span className="cl-pill">
              <span>Número de canciones:</span>
              <strong>{detalle?.numeroCanciones ?? canciones.length}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* DATATABLE */}
        <div className="cl-table-wrap cl-table">
          <DataTable
            columns={columnas}
            data={canciones}
            pagination
            highlightOnHover
            striped
            responsive
          />
        </div>
        <div className="cl-footer">
          <Button className="cl-btn" onClick={() => navigate('/listas')}>
            <FaArrowLeft className="me-2" />
              Volver
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsultarLista;




