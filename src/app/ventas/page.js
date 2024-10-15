"use client";
import React, { useEffect, useState } from 'react';
import { firestore } from "../firebase";
import { collection, query, getDocs, updateDoc, writeBatch, orderBy, doc, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function VentasPage() {
  const [ventas, setVentas] = useState([]); // Para almacenar las ventas
  const [selectedVenta, setSelectedVenta] = useState(null); // Venta seleccionada para mostrar en el modal
  const router = useRouter();

  // Fetch ventas
  const fetchVentas = async () => {
    try {
      const q = query(collection(firestore, "ventas"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const ventasData = querySnapshot.docs.map((doc) => {
        const ventaData = doc.data();
        if (ventaData.date) {
          ventaData.date = ventaData.date.toDate().toLocaleDateString(); // Convierte el timestamp a una fecha legible
        }
        return { id: doc.id, ...ventaData };
      });
      setVentas(ventasData);
    } catch (error) {
      console.error("Error al obtener las ventas:", error);
    }
  };

  useEffect(() => {
    fetchVentas(); // Al cargar la página, obtenemos las ventas
  }, []);

  // Mostrar el modal con el detalle de la venta
  const handleViewDetails = (venta) => {
    setSelectedVenta(venta);
  };

  // Cerrar el modal
  const closeModal = () => {
    setSelectedVenta(null);
  };

  // Cambiar el estado de la venta a 'pagado' y actualizar el stock
  // Cambiar el estado de la venta a 'pagado' y actualizar el stock
  const handleMarkAsPaid = async (ventaId) => {
    try {
      // Referencia al documento de la venta
      const ventaRef = doc(firestore, "ventas", ventaId);

      // Obtener los detalles de la venta
      const ventaSnapshot = await getDoc(ventaRef);
      if (!ventaSnapshot.exists()) {
        console.error("La venta no existe.");
        return;
      }

      const ventaData = ventaSnapshot.data();

      // Actualizar el stock de cada producto en la venta
      if (ventaData.productos && Array.isArray(ventaData.productos)) {
        const batch = writeBatch(firestore);

        // Crear un array de promesas para obtener los productos
        const productPromises = ventaData.productos.map(async (producto) => {
          const productoRef = doc(firestore, "items", producto.id);
          const productoSnapshot = await getDoc(productoRef);

          // Solo proceder si el producto existe
          if (productoSnapshot.exists()) {
            const productoData = productoSnapshot.data();
            const updatedTallas = { ...productoData.tallas };

            // Restar la cantidad vendida de cada talla
            Object.keys(producto.tallas).forEach((talla) => {
              if (updatedTallas[talla] !== undefined) {
                updatedTallas[talla] = Math.max(
                  0,
                  updatedTallas[talla] - (producto.tallas[talla] || 0)
                );
              }
            });

            // Actualizar el stock de tallas en el batch
            batch.update(productoRef, {
              tallas: updatedTallas,
            });
          }
        });

        // Esperar a que todas las promesas se resuelvan
        await Promise.all(productPromises);

        // Ejecutar las actualizaciones del stock
        await batch.commit();
      }

      // Actualizar el estado de la venta a 'pagado'
      await updateDoc(ventaRef, {
        status: "pagado",
      });

      // Volver a obtener las ventas para actualizar la lista
      fetchVentas();
    } catch (error) {
      console.error("Error al actualizar el estado de la venta y el stock:", error);
    }
  };


  // Función para determinar el color del estado de la venta
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmacion":
        return "bg-yellow-500"; // Color amarillo para "confirmacion"
      case "pagado":
        return "bg-green-500 text-white"; // Color verde para "pagado"
      default:
        return "bg-gray-500 text-white"; // Color por defecto (gris) para otros estados
    }
  };

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-4 sm:p-6">
      {/* Título */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Todas las Ventas</h1>

      {/* Tabla de ventas */}
      <div className="shadow-md rounded-lg p-4 sm:p-6 mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">Monto</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id}>
                  <td className="px-3 py-4 text-sm">{venta.date}</td>
                  <td className="px-3 py-4 text-sm">{venta.total}</td>
                  <td className="px-3 py-4 text-sm">
                    <span className={`px-2 py-1 rounded ${getStatusColor(venta.status)}`}>
                      {venta.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <button
                      onClick={() => handleViewDetails(venta)}
                      className="px-4 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600"
                    >
                      Ver detalle
                    </button>
                    {venta.status !== "pagado" && (
                      <button
                        onClick={() => handleMarkAsPaid(venta.id)}
                        className="ml-2 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Marcar como pagado
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalle de venta */}
      {selectedVenta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h3 className="text-2xl font-semibold text-gray-900">Detalle de la Venta</h3>
            <div className="mt-4">
              {selectedVenta.imageUrl && (
                <div className="w-full h-64 relative">
                  <Image
                    src={selectedVenta.imageUrl}
                    alt="Detalle de la venta"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
