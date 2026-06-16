import React from 'react';
import Dashboard from './dashboard/Dashboard';
import { useUser } from './UserContext';

const Home: React.FC = () => {
  const { user } = useUser();

  if (!user) return <div>Acceso no autorizado</div>;

  return <Dashboard userName={user.username} />;
};

export default Home;





