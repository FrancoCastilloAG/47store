"use client";
import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { useRouter } from 'next/navigation'; // Importa el hook de navegación de Next.js

function ItemList() {
  const [items, setItems] = useState([]);
  const router = useRouter(); // Inicializa el hook de navegación

  useEffect(() => {
    // Función para redirigir según el rol y la autenticación
    const checkAuthAndRole = () => {
      const userString = localStorage.getItem('user'); // Obtén el string del objeto JSON almacenado
      const user = userString ? JSON.parse(userString) : null; // Parsealo a un objeto si existe
      const isAuthenticated = user !== null; // Verifica si el usuario está autenticado

      if (!isAuthenticated) {
        console.log('No autenticado. Redirigiendo a login...');
        router.push('/login');
        return;
      } else if (user.role !== 'admin') {
        console.log('Usuario no es admin. Redirigiendo a productos...');
        router.push('/productos');
        return;
      }
    };

    checkAuthAndRole();

    // Fetch items sólo si el usuario está autenticado y es admin
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'items'));
        const itemsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setItems(itemsList);
      } catch (error) {
        console.error("Error fetching items: ", error);
      }
    };

    fetchItems();
  }, [router]); // Incluye `router` en las dependencias

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'items', id));
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Lista de Items</h2>
      <ul className="space-y-4">
        {items.map(item => (
          <li key={item.id} className="flex items-center justify-between p-4 border border-gray-300 rounded">
            <div>
              <h3 className="text-lg font-semibold">{item.nombre}</h3>
              <p className="text-gray-600">Valor: {item.valor}</p>
              <p className="text-gray-600">Descripción: {item.descripcion}</p>
              <p className="text-gray-600">Cantidad: {item.cantidad}</p>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ItemList;
