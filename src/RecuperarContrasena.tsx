import React, { useState} from 'react';
import './App.css';

const RecuperarContrasena: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [mensaje, setMensaje] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/app/recuperarPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMensaje('Revisa tu correo para continuar con la recuperación.');
      } else {
        const errorData = await response.json();
        setMensaje(`Error: ${errorData.message || 'No se pudo enviar el correo.'}`);
      }
    } catch (error) {
      setMensaje('Ocurrió un error al intentar enviar el correo. Intenta más tarde.');
      console.error(error);
    }
  };


  return (
    <div className="welcome-container">
      <div className="form-box">
        <div className="logo">
          <div className="icon-circle">
            <i className="bi bi-unlock"></i>
          </div>
          <h3 className="title">Recuperar Contraseña</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Introduce tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar enlace</button>
        </form>
        {mensaje && <p className="mensaje">{mensaje}</p>}
        <div className="links">
          <a href="/">Volver al inicio</a>
        </div>
      </div>
    </div>
  );
};

export default RecuperarContrasena;
