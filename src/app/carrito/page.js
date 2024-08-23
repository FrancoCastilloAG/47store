"use client";

import React, { useEffect, useState } from "react";
import { firestore } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@nextui-org/react";
import { useUser } from "../UserContext";
import { useRouter } from "next/navigation";
import { useCart } from "../CartContext";

function CartPage() {
  const { cart, removeCartItem, clearCart } = useCart();
  const { user } = useUser();
  const [cartDetails, setCartDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userString = localStorage.getItem("user"); // Obtén el string del objeto JSON almacenado
    const user = userString ? JSON.parse(userString) : null; // Parsealo a un objeto si existe
    const isAuthenticated = user !== null; // Verifica si el usuario está autenticado

    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        const fetchedDetails = await Promise.all(
          cart.map(async (item) => {
            const docRef = doc(firestore, "items", item.id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              return {
                ...docSnap.data(),
                id: item.id,
                selectedTallas: item.tallas,
              };
            }
            return null;
          })
        );
        setCartDetails(fetchedDetails.filter((detail) => detail !== null));
      } catch (error) {
        console.error("Error al obtener detalles del carrito:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, [cart, user, router]);

  const calculateTotal = () => {
    return cartDetails.reduce((total, item) => {
      const pricePerUnit = parseFloat(
        item.valor_formateado.replace(/[^0-9.-]+/g, "")
      );
      const itemTotal = Object.keys(item.selectedTallas).reduce(
        (sum, talla) => {
          return sum + item.selectedTallas[talla] * pricePerUnit;
        },
        0
      );
      return total + itemTotal;
    }, 0);
  };

  const handleRemoveItem = (itemId) => {
    removeCartItem(itemId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  if (loading) {
    return <div className="text-center">Cargando carrito...</div>;
  }

  if (cartDetails.length === 0) {
    return <div className="text-center">Tu carrito está vacío.</div>;
  }

  const total = calculateTotal();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Carrito de Compras
      </h1>
      <div className="space-y-4">
        {cartDetails.map((item) => (
          <div
            key={item.id}
            className="flex flex-col md:flex-row items-center justify-between border-b pb-4"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16">
                <img
                  src={item.imageUrl}
                  alt={item.nombre}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {item.nombre}
                </h2>
                <p className="text-gray-600">Precio: {item.valor_formateado}</p>
                <p className="text-gray-600">Tallas seleccionadas:</p>
                <ul className="list-disc list-inside">
                  {Object.keys(item.selectedTallas).map((talla) => (
                    <li key={talla}>
                      {talla.toUpperCase()}: {item.selectedTallas[talla]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                color="error"
                shadow
                auto
                onPress={() => handleRemoveItem(item.id)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Total: ${total.toFixed(2)}
        </h2>
        <Button color="warning" shadow auto onPress={handleClearCart}>
          Vaciar Carrito
        </Button>
      </div>
    </div>
  );
}

export default CartPage;
