"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { firestore, storage } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button, Input, Spinner } from "@nextui-org/react";
import { ref, getDownloadURL } from "firebase/storage";
import { useCart } from "../../CartContext";
import { useUser } from "../../UserContext";
import Image from "next/image";

function ProductDetail() {
  const { id } = useParams();
  const { addCartItem } = useCart();
  const { user } = useUser();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTallas, setSelectedTallas] = useState({});
  const [showWarning, setShowWarning] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProduct = async () => {
      if (!id) return;

      try {
        const docRef = doc(firestore, "items", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData = docSnap.data();
          if (productData.img) {
            const storageRef = ref(storage, productData.img);
            const imageUrl = await getDownloadURL(storageRef);
            productData.imageUrl = imageUrl;
          }
          setProduct(productData);

          const initialSelectedTallas = {};
          Object.keys(productData.tallas || {}).forEach((talla) => {
            initialSelectedTallas[talla] = 0;
          });
          setSelectedTallas(initialSelectedTallas);

          const lowStock = Object.values(productData.tallas || {}).some(
            (stock) => stock <= 2
          );
          setShowWarning(lowStock);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user, router]);

  const handleTallaChange = (talla, value) => {
    if (product) {
      setSelectedTallas((prev) => ({
        ...prev,
        [talla]: Math.max(0, Math.min(value, product.tallas[talla])),
      }));
    }
  };

  const formatCurrencyCLP = (value) => {
    return value.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
    });
  };

  const calculateTotalValue = () => {
    let total = 0;
    if (product) {
      const pricePerUnit = product.valor;
      Object.keys(selectedTallas).forEach((talla) => {
        total += selectedTallas[talla] * pricePerUnit;
      });
    }
    return total;
  };

  const handleAddToCart = async () => {
    if (product && Object.values(selectedTallas).some((count) => count > 0)) {
      setIsAddingToCart(true);
      try {
        console.log("producto iamgen url  ", product.imageUrl)
        await addCartItem(product.id, selectedTallas, product.imageUrl);
      } catch (error) {
        console.error("Error adding to cart:", error);
      } finally {
        setIsAddingToCart(false);
      }
    }
  };

  const totalValue = calculateTotalValue();

  const isButtonDisabled = !Object.values(selectedTallas).some((count) => count > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return <div className="text-center text-black">Producto no encontrado.</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen">
      <div className="flex flex-col md:flex-row max-w-4xl mx-auto rounded-lg shadow-md overflow-hidden">
        <div className="md:w-1/2 relative h-48 md:h-96">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.nombre}
              layout="fill"
              objectFit="cover"
            />
          )}
        </div>
        <div className="md:w-1/2 p-4 md:p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.nombre}</h1>
            <p className="text-sm mb-4">{product.descripcion}</p>
            <p className="text-lg md:text-xl font-semibold mb-4">
              Precio: {formatCurrencyCLP(product.valor)}
            </p>
          </div>
          <div className="space-y-2">
            {product.tallas &&
              Object.keys(product.tallas).map((talla) => (
                <div key={talla} className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {talla.toUpperCase()}:
                  </span>
                  <Input
                    type="number"
                    min="0"
                    max={product.tallas[talla]}
                    value={selectedTallas[talla] || ""}
                    onChange={(e) =>
                      handleTallaChange(talla, parseInt(e.target.value) || 0)
                    }
                    className="w-20"
                  />
                  <span className="text-sm text-gray-400">
                    {product.tallas[talla]} disponibles
                  </span>
                </div>
              ))}
            {showWarning && (
              <p className="text-red-500 font-semibold">
                Stock Desfazado 1hr consultar disponibilidad si hay pocas unidades.
              </p>
            )}
            <div className="mt-4">
              <Button
                color={isButtonDisabled ? "default" : "primary"}
                shadow
                auto
                size="lg"
                onPress={handleAddToCart}
                disabled={isButtonDisabled || isAddingToCart} // Disable during the add-to-cart process
                className={`w-full ${isButtonDisabled ? "bg-gray-500" : ""}`}
              >
                {isAddingToCart ? <Spinner size="sm" color="default" /> : "Agregar al Carrito"}
              </Button>
            </div>

            <div className="mt-4">
              <span className="text-xl md:text-2xl font-semibold">
                Total: {formatCurrencyCLP(totalValue)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
