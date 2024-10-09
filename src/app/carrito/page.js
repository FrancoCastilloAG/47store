"use client";

import React, { useEffect, useState, useRef } from "react";
import { firestore, storage } from "../firebase";
import { doc, setDoc, collection, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button, Card, Progress } from "@nextui-org/react";
import { useUser } from "../UserContext";
import { useRouter } from "next/navigation";
import { useCart } from "../CartContext";
import Image from "next/image";
import html2canvas from "html2canvas"; // Importar html2canvas

function CartPage() {
  const { cart, clearCart } = useCart();
  const { user } = useUser(); // Obtén el usuario logueado
  const [cartDetails, setCartDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventaId, setVentaId] = useState(null); // Estado para almacenar el ID de la venta
  const [imageUrl, setImageUrl] = useState(""); // Estado para almacenar la URL de la imagen
  const router = useRouter();
  const cartRef = useRef(null); // Refs para la captura de la boleta

  // Validar si el usuario está autenticado
  useEffect(() => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  // Fetch cart details
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
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, [cart, user, router]);

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

    // Guardamos la venta en la colección "ventas" con el estado "confirmacion"
    const ventaRef = doc(collection(firestore, "ventas"));
    await setDoc(ventaRef, {
      userId: user.uid, // Asegurarse de que userId esté definido
      total: calculateTotal().toFixed(3), // Asegurarse de que el total esté formateado como un número decimal
      date: new Date(),
      status: "confirmacion", // Cambiamos el estado a "confirmacion"
      cart: cartDetails.map((item) => ({
        nombre: item.nombre,
        tallas: item.selectedTallas,
        precio: item.valor_formateado,
      })),
    });

    // Obtener el ID de la venta recién creada
    const ventaSnap = await getDoc(ventaRef);
    const ventaId = ventaSnap.id;
    setVentaId(ventaId); // Almacenar el ID de la venta en el estado

    // Verificar que cartRef.current tiene el contenido adecuado
    if (cartRef.current) {
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(cartRef.current, {
            scale: 3, // Aumentamos la escala para mejorar la calidad de la imagen
            useCORS: true,
          });

          // Convertimos el canvas en un archivo blob (imagen PNG)
          const imageBlob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/png")
          );

          // Subimos la boleta al storage
          const storageRef = ref(storage, `boletas/${user.uid}_${Date.now()}.png`);
          await uploadBytes(storageRef, imageBlob);

          // Obtenemos la URL de la imagen
          const imageUrl = await getDownloadURL(storageRef);
          setImageUrl(imageUrl); // Guardamos la URL de la imagen

          // Guardamos la URL de la boleta y el ID de la venta
          await updateDoc(ventaRef, { imageUrl: imageUrl, ventaId: ventaId });

          // Limpiar el carrito después de realizar el pago
          clearCart();
          router.push("/perfil"); // Redirigir al panel de ventas
        } catch (error) {
          console.error("Error capturando la imagen:", error);
        }
      }, 500); // Esperar medio segundo antes de intentar capturar la imagen
    }
  };

  // Enviar mensaje a WhatsApp con los detalles del pedido
  const sendWhatsAppMessage = () => {
    if (!ventaId) {
      console.error("El ID de la venta no está disponible");
      return;
    }

    const orderDetails = cartDetails.map((item) => {
      return `Producto: ${item.nombre} | Tallas: ${JSON.stringify(item.selectedTallas)}`;
    }).join("\n");

    const message = `
      Nombre: ${user?.displayName}\n
      Productos:\n
      ${orderDetails}\n
      Total: $${calculateTotal().toFixed(3)}\n
      ID del pedido: ${ventaId}\n
    `;

    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "1234567890"; // Cambia este número por el que recibirá el WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
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
      <div className="min-h-screen bg-black flex justify-center items-center h-screen">
        <p h3>Tu carrito está vacío.</p>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <p h1 className="text-3xl font-bold text-white-100 mb-6 text-center">
        Carrito de Compras
      </p>
      <div className="space-y-6" ref={cartRef}>
        {/* Nombre del comprador, Total a pagar e ID de la venta */}
        <p className="text-lg font-semibold text-gray-500">Nombre del comprador: {user?.displayName}</p>
        <p className="text-lg font-semibold text-gray-500">Total a pagar: ${total.toFixed(3)}</p>
        <p className="text-lg font-semibold text-gray-500">ID de venta: {ventaId}</p>

        {/* Detalles del carrito */}
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

      {/* Mostramos el total después de la lista de productos */}
      <div className="mt-8 flex justify-between items-center">
        <p h2 className="text-2xl font-semibold">Total: ${total.toFixed(3)}</p>
        <div className="space-x-4">
          <Button
            color="error"
            shadow
            auto
            onPress={handlePay}
            className="bg-green-600 hover:bg-green-700"
          >
            Pagar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
