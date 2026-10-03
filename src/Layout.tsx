import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';
import { useUser } from './UserContext';

const Layout: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null; // o un loader

  return (
  <div className={`${styles.layout} ${user.isAdmin ? styles.adminBackground : styles.userBackground}`}>
    <Sidebar isAdmin={user.isAdmin} id={user.id} />
    <div className={styles.mainContent}>
      <Header />
      <div className={styles.pageContent}>
        <Outlet />
      </div>
    </div>
  </div>
);
};

export default Layout;


