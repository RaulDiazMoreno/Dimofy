import React, { createContext, useContext, useState, useEffect } from 'react';

interface Role {
  authority: string;
}

interface RawUser {
  id: number;
  username: string;
  nombre: string;
  pais: string;
  passW: string;
  telefono: string;
  dni: string;
  email: string;
  fechaAlta: string;
  fechaNacimiento: string;
  imagenBase64: string;
  generos: string[];
  artistas: string[];
  tokenExpiracion: string;
  tokenRecuperacion: string;
  roles: Role[];
}

interface User extends Omit<RawUser, 'roles'> {
  isAdmin: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: RawUser | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);

  const setUser = (rawUser: RawUser | null) => {
    if (rawUser) {
      const isAdmin = rawUser.roles?.some(role => role.authority === 'ROLE_ADMIN');
      const userWithAdmin: User = {
        ...rawUser,
        isAdmin,
      };
      setUserState(userWithAdmin);
      localStorage.setItem('user', JSON.stringify(userWithAdmin));
    } else {
      setUserState(null);
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    try {
      if (storedUser && storedUser !== 'undefined') {
        const parsedUser: User = JSON.parse(storedUser);
        setUserState(parsedUser);
      }
    } catch (error) {
      console.error('Error al parsear el usuario desde localStorage:', error);
      localStorage.removeItem('user');
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de un UserProvider');
  }
  return context;
};



