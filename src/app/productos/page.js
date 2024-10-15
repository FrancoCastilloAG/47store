"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore, storage } from "../firebase";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Spinner,
} from "@nextui-org/react";
import { ref, getDownloadURL } from "firebase/storage";
import { useCart } from "../CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Importar el componente Image de Next.js

function Products() {
  const { addCartItem } = useCart(); // Obtener la función addCartItem del contexto del carrito
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, "items"),
      async (snapshot) => {
        const itemsData = [];
        await Promise.all(
          snapshot.docs.map(async (doc) => {
            const itemData = doc.data();
            if (itemData.img) {
              const storageRef = ref(storage, itemData.img);
              const imageUrl = await getDownloadURL(storageRef);
              itemData.imageUrl = imageUrl;
            }
            itemsData.push(itemData);
          })
        );
        setItems(itemsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error en la carga de datos:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleAddToCart = (itemId) => {
    // Redirige a la página de detalles del producto con el ID
    router.push(`/ProductDetail/${itemId}`);
  };


  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      )}
      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item, index) => (
          <Card
            shadow="sm"
            key={index}
            isPressable
            onClick={() => handleAddToCart(item.id)}
            className="transition-transform transform hover:scale-105" // Añadir un efecto hover
          >
            <CardBody className="p-0">
              {item.imageUrl && (
                <div className="relative w-full h-[300px] overflow-hidden"> {/* Altura fija para el contenedor de la imagen */}
                  <Image
                    src={item.imageUrl}
                    alt={item.nombre}
                    layout="fill"
                    objectFit="contain" // Cambiar a "contain" para que la imagen se ajuste completamente
                    className="transition-transform duration-300 ease-in-out" // Añadir una transición a la imagen
                  />
                </div>
              )}
            </CardBody>
            <CardFooter> {/* Padding para el footer */}
              <div>
                <b>{item.nombre}</b>
                {item.cantidad > 0 ? (
                  <p>{item.valor_formateado}</p>
                ) : (
                  <p className="text-red-500">Fuera de stock</p> // Mensaje en rojo si está fuera de stock
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>

  );
}

export default Products;
