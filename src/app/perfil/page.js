"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from "../UserContext";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { firestore } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function ProfilePage() {
  const { user, handleLogout } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState([]); // To store user orders
  const [selectedOrder, setSelectedOrder] = useState(null); // Selected order for modal display

  // Fetch orders
  const fetchOrders = async () => {
    if (user && user.uid) {
      try {
        const q = query(
          collection(firestore, "ventas"),
          where("userId", "==", user.uid),
          orderBy("date", "desc") // Order by date descending
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map((doc) => {
          const orderData = doc.data();
          // Convert date to a readable string
          if (orderData.date) {
            orderData.date = orderData.date.toDate().toLocaleDateString();
          }
          return { id: doc.id, ...orderData }; // Ensure to include the document ID
        });
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }
  };

  useEffect(() => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    if (!user) {
      router.push("/login");
    } else {
      fetchOrders();
    }
  }, [router, user]);

  // Show order details in modal
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  // Close the modal
  const closeModal = () => {
    setSelectedOrder(null);
  };

  // Determine order status color
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmacion":
        return "bg-yellow-500 text-white-900"; // Yellow for confirmation
      case "pagado":
        return "bg-green-500 text-white"; // Green for paid
      default:
        return "bg-gray-500 text-white"; // Default color for other statuses
    }
  };

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-4 sm:p-6">
      {user ? (
        <>
          {/* User Profile */}
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
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>

          {/* Recent Purchases Section */}
          <div className="shadow-md rounded-lg p-4 sm:p-6 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-white-900 mb-4">Compras Recientes</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium  uppercase tracking-wider">Fecha</th>
                    <th className="px-3 py-3 text-left text-xs font-medium  uppercase tracking-wider">Monto</th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-3 py-4 text-sm text-gray-400">{order.date}</td>
                      <td className="px-3 py-4 text-sm text-gray-400">{order.total}</td>
                      <td className="px-3 py-4 text-sm text-white">
                        <span className={`px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm flex space-x-2"> {/* Flex for alignment */}
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Ver detalle
                        </button>
                        {/* Download button next to view details */}
                        {order.imageUrl && (
                          <a
                            href={order.imageUrl} // Ensure this is the correct URL
                            download // This attribute triggers download
                            className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Descargar Imagen
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Detail Modal */}
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

                {/* Close button */}
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
