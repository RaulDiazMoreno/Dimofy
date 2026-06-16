import { useState,} from 'react';
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useSnackbar } from 'notistack'; 
import { useNavigate } from 'react-router-dom'
import { useUser } from './UserContext'


const App = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const { enqueueSnackbar } = useSnackbar(); 
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
  e.preventDefault();

  try {
    const response = await fetch('http://localhost:8080/app/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username: usuario, password: contrasena }),
    });
    
    if (response.ok) {
      const data = await response.json(); // o .json() si el   devuelve JSON
      console.log('DATA:', data);
      enqueueSnackbar("Inicio de sesión exitoso", { variant: 'success' });
      if (data.username) {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      }
      console.log('Usuario guardado:', localStorage.getItem('user'));
      navigate('/home');
    } else {
      const error = await response.text();
      enqueueSnackbar(error, { variant: 'warning' });
    }
  } catch (error) {
    console.error('Error al conectar con el backend:', error);
    enqueueSnackbar('Error de conexión', { variant: 'error' });
  }
};



  return (
    <div className="welcome-container">
      <div className="form-box">
        <div className="logo">
          <div className="icon-circle">
            <i className="bi bi-headphones"></i>
          </div>
          <h3 className="title">DimoFy</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <button type="submit">Acceder</button>
        </form>
        <div className="links">
          <a href="/registro">¿No tienes cuenta? Regístrate</a>
          <a href="/recuperar">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
    </div>
  );
};

export default App;




