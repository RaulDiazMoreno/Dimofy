import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { getStoredUser } from "../src/dashboard/utils/getStoredUser";

interface SidebarProps {
  isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isAdmin }) => {
  const navigate = useNavigate();

  const user = getStoredUser();
  const userId = user?.idUsuario ?? user?.id;
  const userName = user?.username ?? user?.nombre ?? "Usuario";
  const avatarSrc = user?.imagenBase64;

  const goToUserProfile = () => {
  if (!userId) return;
  navigate(isAdmin ? `/admin/usuarios/editar/${userId}` : `/admin/usuarios/editar/${userId}`);
};

  const handleNavigation = (path: string) => {
    navigate(path);
  };


  return (
    <div className={styles.sidebar}>
      
      <div className={styles.topSection}>
        <div className="logo">
          <div className="icon-circle">
            <i className="bi bi-headphones"></i>
          </div>
          <h3 className="title">DimoFy</h3>
        </div>

        <hr className={styles.divider} />

        <ul className={styles.menu}>
          {isAdmin && (
            <li onClick={() => handleNavigation('/admin/usuarios')}>
              Usuarios
            </li>
          )}

          <li onClick={() => handleNavigation(isAdmin ? '/admin/albumsA' : '/albums')}>
            Albums
          </li>

          <li onClick={() => handleNavigation(isAdmin ? '/admin/artistasA' : '/artistas')}>
            Artistas
          </li>

          <li onClick={() => handleNavigation(isAdmin ? '/admin/generosA' : '/generos')}>
            Géneros
          </li>

          <li onClick={() => handleNavigation(isAdmin ? '/admin/cancionesA' : '/canciones')}>
            Canciones
          </li>

          {!isAdmin && (
            <li onClick={() => handleNavigation('/listas')}>
              Listas
            </li>
          )}
        </ul>
      </div>
        {!isAdmin && userId && (
          <div className={styles.userSection} onClick={goToUserProfile}>
            
            <div className={styles.avatar}>
              <img
                src={avatarSrc}
                alt="Foto de perfil"
                style={{ width: 40, height: 40, borderRadius: '50%', marginRight: '1rem' }}
            />
            </div>

            <div className={styles.userInfo}>
              <div className={styles.userName}>{userName}</div>
              <div className={styles.userSub}>Ver perfil</div>
            </div>

          </div>
        )}  
    </div>
  );
};

export default Sidebar;






