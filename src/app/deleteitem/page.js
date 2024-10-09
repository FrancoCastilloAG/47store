"use client";
import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore, storage } from '../firebase';
import { useRouter } from 'next/navigation'; // Importa el hook de navegación de Next.js
import { ref, deleteObject } from 'firebase/storage';
import { Progress } from "@nextui-org/react"; // Importa el componente de barra de progreso de NextUI

function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false); // Estado de carga
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

  // Función para eliminar un item y su imagen
  const handleDelete = async (id, imgUrl) => {
    try {
      setLoading(true); // Activamos el estado de carga
      if (imgUrl) {
        // Si hay una imagen, eliminarla de Firebase Storage
        const imageRef = ref(storage, imgUrl);
        await deleteObject(imageRef);
      }

      // Eliminar el item de Firestore
      await deleteDoc(doc(firestore, 'items', id));

      // Filtrar el item eliminado de la lista local
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item: ", error);
    } finally {
      setLoading(false); // Desactivamos el estado de carga al finalizar el proceso
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold mb-6 text-white">Lista de Items</h2>
      <ul className="space-y-4">
        {items.map(item => (
          <li key={item.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-gray-300 rounded bg-white">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-x-4 sm:space-y-0">
              {item.img && (
                <img
                  src={item.img}
                  alt={item.nombre}
                  className="w-24 h-24 object-cover rounded-md"
                />
              )}
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-black">{item.nombre}</h3>
                <p className="text-gray-600">Valor: {item.valor_formateado}</p>
                <p className="text-gray-600">Descripción: {item.descripcion}</p>
                <p className="text-gray-600">Cantidad: {item.cantidad}</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(item.id, item.img)}
              className={`mt-4 sm:mt-0 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading} // Deshabilitar el botón cuando se está eliminando
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
            {/* Mostrar barra de progreso cuando está en carga */}
            {loading && (
              <Progress
                size="sm"
                isIndeterminate
                aria-label="Eliminando item..."
                className="mt-2 w-full"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ItemList;
