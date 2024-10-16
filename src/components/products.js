"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { firestore, storage } from "../../src/app/firebase";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Spinner,
} from "@nextui-org/react";
import { ref, getDownloadURL } from "firebase/storage";
import { useCart } from "../../src/app/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

function Products({ brand }) {
  const { addCartItem } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Create a query to filter items by the specified brand
    const itemsCollection = collection(firestore, "items");
    const itemsQuery = brand ? query(itemsCollection, where("brand", "==", brand)) : itemsCollection;

    const unsubscribe = onSnapshot(
      itemsQuery,
      async (snapshot) => {
        const itemsData = [];
        await Promise.all(
          snapshot.docs.map(async (doc) => {
            const itemData = doc.data();
            if (itemData.img && itemData.img.length > 0) {
              // Get the first image from the array if available
              const storageRef = ref(storage, itemData.img[0]);
              const imageUrl = await getDownloadURL(storageRef);
              itemData.imageUrl = imageUrl;
            }
            itemData.id = doc.id; // Add document ID to the item data
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
  }, [brand]); // Re-fetch when the brand changes

  const handleAddToCart = (itemId) => {
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
            className="transition-transform transform hover:scale-105"
          >
            <CardBody className="p-0">
              {item.imageUrl && (
                <div className="relative w-full h-[300px] overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.nombre}
                    layout="fill"
                    objectFit="contain"
                    className="transition-transform duration-300 ease-in-out"
                  />
                </div>
              )}
            </CardBody>
            <CardFooter>
              <div>
                <b>{item.nombre}</b>
                {item.cantidad > 0 ? (
                  <p>{item.valor_formateado}</p>
                ) : (
                  <p className="text-red-500">Fuera de stock</p>
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
