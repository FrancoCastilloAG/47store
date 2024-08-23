// UserContext.js
"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import {auth} from "./firebase"


const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Intenta obtener el usuario desde el almacenamiento local al cargar la página
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const updateUser = (newUser) => {
    setUser(newUser);
    // Almacena el usuario en el almacenamiento local
    localStorage.setItem('user', JSON.stringify(newUser));
  };
  const handleLogout = async () => {
    try {
      await auth.signOut(); // Cierra la sesión
      setUser(null); // Limpia el estado del usuario en el contexto
      localStorage.removeItem('user'); // Limpia la información del usuario del localStorage
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUser ,handleLogout}}>
      {children}
    </UserContext.Provider>
  );
};
