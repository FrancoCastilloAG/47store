"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore, storage } from "../firebase";
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Button,
  Progress,
} from "@nextui-org/react";
import { ref, getDownloadURL } from "firebase/storage";
import { useCart } from "../CartContext";
import { useRouter } from "next/navigation";

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
    <div className="p-4 md:p-6 lg:p-8">
      {loading && (
        <Progress
          size="sm"
          isIndeterminate
          aria-label="Loading..."
          className="max-w-md mx-auto"
        />
      )}
      <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
        {items.map((item, index) => (
          <Card
            shadow="sm"
            key={index}
            isPressable
            className="bg-black"
            onClick={() => handleAddToCart(item.id)} // Redirige al hacer clic en cualquier parte del Card
          >
            <CardBody className="overflow-hidden p-0">
              {item.imageUrl && (
                <Image
                  shadow="sm"
                  radius="lg"
                  width="100%"
                  height="auto"
                  alt={item.nombre}
                  className="w-full object-cover h-[140px]"
                  src={item.imageUrl}
                />
              )}
            </CardBody>
            <CardFooter className="flex justify-center items-center p-4 text-small">
              <div className="text-center">
                <b className="text-default-100">{item.nombre}</b>
                <p className="text-default-100">{item.valor_formateado}</p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Products;
