"use client";

import React, { useEffect, useState } from "react";
import { firestore,storage } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { Button, Card, Text, Spacer, Loading, Progress } from "@nextui-org/react";
import { useUser } from "../UserContext";
import { useRouter } from "next/navigation";
import { useCart } from "../CartContext";
import Image from "next/image";

function CartPage() {
  const { cart, removeCartItem, clearCart } = useCart();
  const { user } = useUser();
  const [cartDetails, setCartDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const isAuthenticated = user !== null;

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
              const productData = docSnap.data();
              let imageUrl = "";
    
              // Obtener URL de la imagen si existe
              if (productData.img) {
                const storageRef = ref(storage, productData.img);
                try {
                  imageUrl = await getDownloadURL(storageRef);
                } catch (error) {
                  console.error("Error fetching image URL:", error);
                }
              }
    
              return {
                ...productData,
                id: item.id,
                selectedTallas: item.tallas,
                imageUrl: imageUrl, // Añadir imageUrl a los datos del producto
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
    return (
      <div className="flex justify-center items-center h-screen">
        <Progress size="lg">Cargando carrito...</Progress>
      </div>
    );
  }

  if (cartDetails.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p h3>Tu carrito está vacío.</p>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <p h1 className="text-3xl font-bold text-white-100 mb-6 text-center">
        Carrito de Compras
      </p>
      <div className="space-y-6">
        {cartDetails.map((item) => (
          <Card key={item.id} className="p-4 shadow-md">
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex items-center space-x-4">
               <div className="relative w-24 h-24">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.nombre}
                      layout="fill"
                      className="object-cover"
                    />
                  ) : (
                    <p className="text-red-500">Imagen no disponible</p>
                  )}
                </div>
                <div>
                  <p h3 className="font-semibold">
                    {item.nombre}
                  </p>
                  <p>
                    Precio: {item.valor_formateado}
                  </p>
                  <p className=" mt-2">
                    Tallas seleccionadas:
                  </p>
                  <ul className="list-disc list-inside">
                    {Object.keys(item.selectedTallas).map((talla) => (
                      <li key={talla}>
                        {talla.toUpperCase()}: {item.selectedTallas[talla]}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-auto">
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
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-between items-center">
        <p h2 className="text-2xl font-semibold">
          Total: ${total.toFixed(3)}
        </p>
        <Button
          color="warning"
          shadow
          auto
          onPress={handleClearCart}
        >
          Vaciar Carrito
        </Button>
      </div>
    </div>
  );
}

export default CartPage;
