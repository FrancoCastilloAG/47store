"use client";

import React, { useEffect, useState, useRef } from "react";
import { firestore, storage } from "../firebase";
import { doc, setDoc, collection, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button, Card, Spinner } from "@nextui-org/react"; // Usamos Spinner
import { useUser } from "../UserContext";
import { useRouter } from "next/navigation";
import { useCart } from "../CartContext";
import Image from "next/image";
import html2canvas from "html2canvas";

function CartPage() {
  const { cart, clearCart } = useCart();
  const { user } = useUser();
  const [cartDetails, setCartDetails] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [ventaId, setVentaId] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isPaying, setIsPaying] = useState(false); // Estado para el botón de pagar
  const router = useRouter();
  const cartRef = useRef(null);

  // Validar si el usuario está autenticado
  useEffect(() => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  // Fetch cart details using onSnapshot for real-time updates
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "items"), async (snapshot) => {
      try {
        setLoading(true); // Iniciamos la carga
        const fetchedDetails = await Promise.all(
          cart.map(async (item) => {
            const docRef = doc(firestore, "items", item.id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const productData = docSnap.data();
              let imageUrl = "";
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
                imageUrl: imageUrl,
              };
            }
            return null;
          })
        );
        setCartDetails(fetchedDetails.filter((detail) => detail !== null));
      } catch (error) {
        console.error("Error al obtener detalles del carrito:", error);
      } finally {
        setLoading(false); // Finalizamos la carga una vez que los productos están listos
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [cart]);

  // Calcular el total del carrito
  const calculateTotal = () => {
    return cartDetails.reduce((total, item) => {
      const pricePerUnit = parseFloat(
        item.valor_formateado.replace(/[^0-9.-]+/g, "")
      );
      const itemTotal = Object.keys(item.selectedTallas).reduce(
        (sum, talla) => sum + item.selectedTallas[talla] * pricePerUnit,
        0
      );
      return total + itemTotal;
    }, 0);
  };

  const handlePay = async () => {
    if (!user || !user.uid) {
      console.error("El usuario no está autenticado correctamente.");
      return;
    }

    setIsPaying(true); // Iniciar el estado de carga del botón

    // Guardamos la venta en la colección "ventas" con el estado "confirmacion"
    const ventaRef = doc(collection(firestore, "ventas"));
    await setDoc(ventaRef, {
      userId: user.uid,
      total: calculateTotal().toFixed(3),
      date: new Date(),
      status: "confirmacion",
      cart: cartDetails.map((item) => ({
        nombre: item.nombre,
        tallas: item.selectedTallas,
        precio: item.valor_formateado,
      })),
    });

    const ventaSnap = await getDoc(ventaRef);
    const ventaId = ventaSnap.id;
    setVentaId(ventaId);

    if (cartRef.current) {
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(cartRef.current, {
            scale: 3,
            useCORS: true,
          });

          const imageBlob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/png")
          );

          const storageRef = ref(storage, `boletas/${user.uid}_${Date.now()}.png`);
          await uploadBytes(storageRef, imageBlob);

          const imageUrl = await getDownloadURL(storageRef);
          setImageUrl(imageUrl);

          await updateDoc(ventaRef, { imageUrl: imageUrl, ventaId: ventaId });

          clearCart();
          setIsPaying(false); // Detener el estado de carga del botón
          router.push("/perfil");
        } catch (error) {
          console.error("Error capturando la imagen:", error);
          setIsPaying(false); // Detener el estado de carga si hay error
        }
      }, 500);
    }
  };

  // Mostrar spinner mientras se carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (cartDetails.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center h-screen">
        <p h3>Tu carrito está vacío.</p>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <p h1 className="text-3xl font-bold text-white-100 mb-6 text-center">
        Carrito de Compras
      </p>
      <div className="space-y-6" ref={cartRef}>
        <p className="text-lg font-semibold text-gray-500">Nombre del comprador: {user?.displayName}</p>
        <p className="text-lg font-semibold text-gray-500">Total a pagar: ${total.toFixed(3)}</p>
        <p className="text-lg font-semibold text-gray-500">ID de venta: {ventaId}</p>

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
                  <p h3 className="font-semibold">{item.nombre}</p>
                  <p>Precio: {item.valor_formateado}</p>
                  <p className="mt-2">Tallas seleccionadas:</p>
                  <ul className="list-disc list-inside">
                    {Object.keys(item.selectedTallas).map((talla) => (
                      <li key={talla}>
                        {talla.toUpperCase()}: {item.selectedTallas[talla]}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <p h2 className="text-2xl font-semibold">Total: ${total.toFixed(3)}</p>
        <div className="space-x-4">
          <Button
            color="error"
            shadow
            auto
            onPress={handlePay}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={isPaying} // Desactivamos el botón mientras se paga
          >
            {isPaying ? <Spinner size="sm" /> : "Pagar"} {/* Spinner en el botón */}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
