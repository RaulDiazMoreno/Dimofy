import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Registro.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarAlt, faAddressCard, faEnvelope, faPhone, faPaperPlane, faEraser,faUndo, faEye,
     } from '@fortawesome/free-solid-svg-icons';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import DualListBox from './DualListBox';
import ComboPaises from './ComboPaises';
import generos from './generos.json';
import artistas from './Artista.json';
import paises from './Paises.json';
import { useSnackbar } from 'notistack'; 

const Registrate: React.FC = () => {
  const [image, setImage] = useState<string>('');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); 
  const handleBack = () => {
    navigate('/');
  };


  interface Pais {
    id: number;
    nombre: string;
    bandera: string;
  }

  
interface Item {
  id: number | string;
  nombre: string;
}


  const [username, setUsername] = useState('');
  const [passW, setPassW] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [selectedPais, setSelectedPais] = useState<Pais | null>(null);
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
  const [artistasSeleccionados, setArtistasSeleccionados] = useState<Item[]>([]);
  const [generosSeleccionados, setGenerosSeleccionados] = useState<Item[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const mostrarImagen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  
  const handleReset = () => {
      setUsername('');
      setPassW('');
      setNombre('');
      setApellidos('');
      setDni('');
      setEmail('');
      setTelefono('');
      setFechaNacimiento(null);
      setSelectedPais(null);
      setImage('');
      setArtistasSeleccionados([]);
      setGenerosSeleccionados([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
  };

  const handleSubmit = async () => {
 
const datos = {
  username,
  passW,
  nombre,
  apellidos,
  dni,
  email,
  telefono,
  fechaNacimiento: fechaNacimiento ? fechaNacimiento.toISOString().split('T')[0] : null,
  pais: selectedPais?.nombre || '',
  imagenBase64: image ? image.replace(/^data:image\/\w+;base64,/, '') : null,
  artistas: artistasSeleccionados.map(a => a.nombre), // o .id si el backend espera IDs
  generos: generosSeleccionados.map(g => g.nombre),// igual aquí
};

  try {
  console.log('Datos enviados:', datos);
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:8080/app/usuarios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(datos),
  });

  console.log('Código de estado:', response.status);

  if (response.ok) {
    enqueueSnackbar('Usuario registrado correctamente', { variant: 'success' });
    handleReset();
  } else {
    if (response.status === 409) {
      enqueueSnackbar('Usuario ya existente', { variant: 'warning' });
    } else {
      const errorData = await response.json().catch(() => null);
      enqueueSnackbar(errorData?.message || 'Error al registrar usuario', { variant: 'error' });
    }
  }
} catch (error) {
  console.error('Error en el envío:', error);
  enqueueSnackbar('Error al registrar usuario', { variant: 'error' });
}
};

  useEffect(() => {
    // Aquí podrías inicializar un datepicker de React si lo necesitas
  }, []);

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <h3 className="text-center">Registro de Usuario</h3>
        </div>
      </div>
      <form>
        <div className="row mt-3">
          <div className="col-3">
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <input type="text" id="user" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </div>
          <div className="col-3">
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faEye} />
              </span>
              <input type="password" id="passW" className="form-control" value={passW} onChange={(e) => setPassW(e.target.value)} />

            </div>
          </div>
          <div className="col-3">
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <input type="text" id="nombre" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
          </div>
          <div className="col-3">
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <input type="text" id="apellidos" className="form-control" value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-8">
            <div className="row">
              <div className="col-6">
                <div className="input-group">
                  <DatePicker
                    selected={fechaNacimiento}
                    onChange={(date: Date | null) => setFechaNacimiento(date)}
                    className="form-control"
                    placeholderText="Fecha de nacimiento"
                  />
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                  </span>
                </div>
              </div>
              <div className="col-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faAddressCard} />
                  </span>
                  <input type="text" id="dni" className="form-control" value={dni} onChange={(e) => setDni(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="row mt-5">
              <div className="col-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </span>
                  <input type="email" id="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="col-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faPhone} />
                  </span>
                   <input type="text" id="telefono" className="form-control" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="row mt-5">
               <div className="col-6">

                <ComboPaises
                    paises={paises}
                    value={selectedPais}
                    onChange={setSelectedPais}
                />
              </div>      
              <div className="col-6">
                <input type="file" className="form-control" onChange={mostrarImagen} ref={fileInputRef}/>
              </div>
            </div>
          </div>

          <div className="col-4 imagen mt-2">
            {image && <img src={image} alt="Foto" className="rounded-circle imagen" />}
          </div>
        </div>

        <div className="row mt-2">
                <div className="col-6">
                  <h3 className="text-center">Artistas</h3>
                </div>
                <div className="col-6">
                  <h3 className="text-center">Genero</h3>
                </div>
              </div>
              <div className="row">
                  <div className="col-6">
                    <DualListBox
                        data={artistas}
                        value={artistasSeleccionados}
                        onChange={setArtistasSeleccionados}
                      />
                  </div> 
                  <div className="col-6">
                    <DualListBox
                      data={generos}
                      value={generosSeleccionados}
                      onChange={setGenerosSeleccionados}
                    />
                  </div> 
              </div>


        <div className="row mt-5 mb-3">
          <div className="col-12 d-flex gap-2 justify-content-center">
            <button className="btn btn-outline-primary" type="button" onClick={handleSubmit}>
              <FontAwesomeIcon icon={faPaperPlane} /> Enviar
            </button>
            <button className="btn btn-outline-secondary" type="button" onClick={handleReset}>
              <FontAwesomeIcon icon={faEraser} /> Limpiar
            </button>
            <button className="btn btn-outline-warning" type="button" onClick={handleBack}>
              <FontAwesomeIcon icon={faUndo} /> Volver
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Registrate;
