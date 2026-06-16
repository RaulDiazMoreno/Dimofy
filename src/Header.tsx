import React from 'react';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '1rem',
        background: '#ddd',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span>{user.username}</span>
        {user.imagenBase64 && (
          <img
            src={user.imagenBase64}
            alt="Foto de perfil"
            style={{ width: 40, height: 40, borderRadius: '50%', marginRight: '1rem' }}
        />

        )}
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default Header;




