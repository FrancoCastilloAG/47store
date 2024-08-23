"use client";
import React, { useEffect } from 'react';
import { useUser } from "../UserContext";
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, handleLogout } = useUser();
  const router = useRouter();
  // Ejemplo de datos de compras, reemplaza con datos reales si es necesario
  const purchases = [
    { id: 1, item: "Cámara Fotográfica", date: "2024-08-01", amount: "$500" },
    { id: 2, item: "Auriculares Bluetooth", date: "2024-07-15", amount: "$150" },
    { id: 3, item: "Smartwatch", date: "2024-06-22", amount: "$250" },
  ];
  useEffect(() => {
    const userString = localStorage.getItem("user"); // Obtén el string del objeto JSON almacenado
    const user = userString ? JSON.parse(userString) : null; // Parsealo a un objeto si existe
    const isAuthenticated = user !== null; // Verifica si el usuario está autenticado

    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-100">
      {user ? (
        <>
          {/* Perfil del Usuario */}
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center">
              <img
                src={user.photoURL}
                alt="User Avatar"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mb-4 sm:mb-0 sm:mr-4"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.displayName}</h1>
                <p className="text-gray-700">{user.email}</p>
                <p className="text-gray-700">{user.role}</p>
                <button
                  onClick={handleLogout}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>

          {/* Sección de Compras */}
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Compras Recientes</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchases.map(purchase => (
                    <tr key={purchase.id}>
                      <td className="px-3 py-4 text-sm font-medium text-gray-900">{purchase.item}</td>
                      <td className="px-3 py-4 text-sm text-gray-500">{purchase.date}</td>
                      <td className="px-3 py-4 text-sm text-gray-500">{purchase.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
          <p className="text-gray-700">No se encontró información del usuario.</p>
        </div>
      )}
    </div>
  );
}
