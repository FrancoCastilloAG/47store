"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from "../UserContext";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { firestore } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function ProfilePage() {
  const { user, handleLogout } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState([]); // Para almacenar los pedidos del usuario
  const [selectedOrder, setSelectedOrder] = useState(null); // Pedido seleccionado para mostrar en el modal

  // Fetch orders
  const fetchOrders = async () => {
    if (user && user.uid) {
      try {
        const q = query(collection(firestore, "ventas"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map((doc) => {
          const orderData = doc.data();
          // Convertir el campo de fecha (asumido como 'date' en Firestore) a una cadena legible
          if (orderData.date) {
            orderData.date = orderData.date.toDate().toLocaleDateString(); // Convierte el timestamp a una fecha legible
          }
          return orderData;
        });
        setOrders(ordersData);
      } catch (error) {
        console.error("Error al obtener los pedidos:", error);
      }
    }
  };

  useEffect(() => {
    const userString = localStorage.getItem("user"); // Obtén el string del objeto JSON almacenado
    const user = userString ? JSON.parse(userString) : null; // Parsealo a un objeto si existe
    const isAuthenticated = user !== null; // Verifica si el usuario está autenticado

    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchOrders(); // Si el usuario está autenticado, obtenemos los pedidos
    }
  }, [router, user]);

  // Mostrar el modal con el detalle del pedido
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  // Cerrar el modal
  const closeModal = () => {
    setSelectedOrder(null);
  };

  // Función para determinar el color del estado del pedido
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmacion":
        return "bg-yellow-500 text-white-900"; // Color amarillo para "confirmacion"
      case "pagado":
        return "bg-green-500 text-white"; // Color verde para "pagado"
      default:
        return "bg-gray-500 text-white"; // Color por defecto (gris) para otros estados
    }
  };

  return (
    <div className="min-h-screen bg-black max-w-4xl mx-auto p-4 sm:p-6">
      {user ? (
        <>
          {/* Perfil del Usuario */}
          <div className="shadow-md rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center">
              <Image
                src={user.photoURL}
                alt="User Avatar"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mb-4 sm:mb-0 sm:mr-4"
                width={128}
                height={128}
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white-900">{user.displayName}</h1>
                <p className="text-white-700">{user.email}</p>
                <p className="text-gray-700">{user.role}</p>
                <button
                  onClick={handleLogout}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-blue-600"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>

          {/* Sección de Compras */}
          <div className="shadow-md rounded-lg p-4 sm:p-6 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-white-900 mb-4">Compras Recientes</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y text-white">
                <thead className="">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Fecha</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Monto</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Estado</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-3 py-4 text-sm text-gray-400">{order.date}</td>
                      <td className="px-3 py-4 text-sm text-gray-400">{order.total}</td>
                      <td className="px-3 py-4 text-sm">
                        <span className={`px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal de Detalle del Pedido */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 min-h-screen">
              <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
                <div className="mt-4">
                  {selectedOrder.imageUrl && (
                    <div className="w-full h-64 relative">
                      <Image
                        src={selectedOrder.imageUrl}
                        alt="Detalle del pedido"
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md"
                      />
                    </div>
                  )}
                </div>

                {/* Botón de descarga */}
                {selectedOrder.fileUrl && (
                  <div className="mt-4">
                    <a
                      href={selectedOrder.fileUrl}
                      download
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Descargar
                    </a>
                  </div>
                )}

                <button
                  onClick={closeModal}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

        </>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
          <p className="text-gray-700">No se encontró información del usuario.</p>
        </div>
      )}
    </div>
  );
}
