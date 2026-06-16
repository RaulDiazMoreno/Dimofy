import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ResetearContrasena: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/app/resetear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaContrasena }),
      });

      if (response.ok) {
        setMensaje('Contraseña actualizada correctamente.');
      } else {
        const data = await response.json();
        setMensaje(`Error: ${data.message || 'No se pudo actualizar la contraseña.'}`);
      }
    } catch (error) {
      setMensaje('Error al conectar con el servidor.');
      console.error(error);
    }
  };

  return (
    <div className="form-box">
      <h2>Restablecer contraseña</h2>
      {token ? (
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            required
          />
          <button type="submit">Actualizar contraseña</button>
        </form>
      ) : (
        <p>Token inválido o faltante.</p>
      )}
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default ResetearContrasena;
