"use client";
import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { firestore, storage } from '../firebase';
import { useRouter } from 'next/navigation';
import { ref, deleteObject } from 'firebase/storage';
import { Input, Button, Progress } from '@nextui-org/react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";

export default function ModificarTallas() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedTallas, setUpdatedTallas] = useState({});
  const [updatedValue, setUpdatedValue] = useState(""); // Initialize as an empty string

  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRole = () => {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const isAuthenticated = user !== null;

      if (!isAuthenticated) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/productos');
      }
    };

    checkAuthAndRole();

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
  }, [router]);

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setUpdatedTallas(item.tallas);
    setUpdatedValue(item.valor.toString()); // Ensure it's a string
    setIsModalOpen(true);
  };

  // Function to format input value as Chilean currency
  const formatCurrency = (amount) => {
    // Ensure the amount is a string
    if (typeof amount !== 'string') {
      amount = amount.toString();
    }

    // Replace logic to parse the number
    const number = parseFloat(amount.replace(/\./g, "").replace(",", "."));
    if (isNaN(number)) return ""; // Return empty string if parsing fails
    return number.toLocaleString("es-CL");
  };

  // Function to handle changes in the value field
  const handleValueChange = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^\d,]/g, "").replace(",", ".");
    setUpdatedValue(numericValue); // Store the raw numeric value, keep as a string
  };

  const handleUpdateTallas = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      const itemRef = doc(firestore, 'items', selectedItem.id);
      const totalCantidad = Object.values(updatedTallas).reduce((acc, curr) => acc + curr, 0);

      // Convert the formatted value back to a number before updating Firestore
      const numberValue = parseFloat(updatedValue.replace(/\./g, "").replace(",", "."));

      // Format the numeric value to get the formatted string for Firestore
      const formattedValue = formatCurrency(numberValue); // Call directly for formatted value

      await updateDoc(itemRef, {
        tallas: updatedTallas,
        cantidad: totalCantidad,
        valor: numberValue, // Save the numeric value to Firestore
        valor_formateado: `$${formattedValue}`
      });

      setItems(prevItems =>
        prevItems.map(item =>
          item.id === selectedItem.id ? { 
            ...item, 
            tallas: updatedTallas, 
            cantidad: totalCantidad, 
            valor: numberValue, 
            valor_formateado: `$${formattedValue}` 
          } : item
        )
      );

      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error updating tallas: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id, img) => {
    try {
      setLoading(true);
      await deleteDoc(doc(firestore, 'items', id));

      if (img) {
        const imgRef = ref(storage, img);
        await deleteObject(imgRef);
      }

      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-lg">
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
                <p className="text-gray-600">Tallas disponibles: {JSON.stringify(item.tallas)}</p>
              </div>
            </div>
            <div className="flex flex-col items-center sm:flex-row">
              <button
                onClick={() => handleOpenModal(item)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 mb-2 sm:mb-0 sm:mr-2"
              >
                Modificar Tallas
              </button>
              <button
                onClick={() => handleDeleteItem(item.id, item.img)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                disabled={loading}
              >
                Eliminar Proyecto
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          <ModalHeader>
            <h3>Modificar Tallas</h3>
          </ModalHeader>
          <ModalBody>
            <div className="mb-4">
              <label className="block mb-1">Valor</label>
              <Input
                type="text" // Use text to allow formatted input
                value={updatedValue}
                onChange={handleValueChange} // Use the new change handler
                className="w-full"
              />
            </div>
            {updatedTallas && Object.keys(updatedTallas).map(talla => (
              <div key={talla} className="flex justify-between items-center">
                <p>{talla.toUpperCase()}</p>
                <Input
                  type="number"
                  value={updatedTallas[talla]}
                  onChange={(e) =>
                    setUpdatedTallas({
                      ...updatedTallas,
                      [talla]: parseInt(e.target.value, 10)
                    })
                  }
                  min={0}
                  className="w-20"
                />
              </div>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button auto onClick={handleUpdateTallas} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            <Button auto flat color="error" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {loading && (
        <Progress
          size="sm"
          isIndeterminate
          aria-label="Procesando..."
          className="mt-2 w-full"
        />
      )}
    </div>
  );
}
