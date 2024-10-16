"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { storage, firestore } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Input, Progress, Button, Select } from "@nextui-org/react";

function AddItem() {
  const [nombre, setNombre] = useState("");
  const [valor, setValor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tallas, setTallas] = useState({
    xs: 0,
    s: 0,
    m: 0,
    l: 0,
    xl: 0,
  });
  const [images, setImages] = useState([]);
  const [brand, setBrand] = useState(""); // State for selected brand
  const [itemId, setItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const isAuthenticated = user !== null;

    if (!isAuthenticated) {
      router.push("/login");
    } else if (user.role !== "admin") {
      router.push("/productos");
    }
  }, [router]);

  const formatCurrency = (amount) => {
    const number = parseFloat(amount.replace(/\./g, "").replace(",", "."));
    if (isNaN(number)) return "";
    return number.toLocaleString("es-CL");
  };

  const handleValueChange = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^\d,]/g, "").replace(",", ".");
    setValor(formatCurrency(numericValue));
  };

  const handleTallaChange = (e) => {
    const { name, value } = e.target;
    setTallas((prevTallas) => ({
      ...prevTallas,
      [name]: value,
    }));
  };

  useEffect(() => {
    const allFieldsFilled =
      nombre &&
      valor &&
      descripcion &&
      brand && // Ensure brand is selected
      Object.values(tallas).every((talla) => talla >= 0);
    setFormValid(allFieldsFilled);
  }, [nombre, valor, descripcion, brand, tallas]);

  const handleUpload = async () => {
    if (!formValid) return;

    setLoading(true);
    try {
      const numericValue = parseFloat(valor.replace(/\./g, "").replace(",", "."));
      const totalCantidad = Object.values(tallas).reduce(
        (acc, talla) => acc + (parseInt(talla) || 0),
        0
      );

      const itemData = {
        nombre: nombre,
        valor: numericValue,
        descripcion: descripcion,
        cantidad: totalCantidad,
        tallas: tallas,
        brand: brand, // Include the selected brand in the item data
        valor_formateado: `$${formatCurrency(valor)}`,
      };

      const docRef = await addDoc(collection(firestore, "items"), itemData);
      const generatedId = docRef.id;
      itemData.id = generatedId;

      // Upload multiple images
      if (images.length > 0) {
        const imageUrls = [];
        for (const image of images) {
          const storageRef = ref(storage, `images/${generatedId}/${image.name}`);
          await uploadBytes(storageRef, image);
          const imageUrl = await getDownloadURL(storageRef);
          imageUrls.push(imageUrl);
        }
        itemData.img = imageUrls;
      }

      await updateDoc(doc(collection(firestore, "items"), generatedId), itemData);

      console.log("Document added with ID: ", generatedId);
      setItemId(generatedId);
      // Reset form fields
      setNombre("");
      setValor("");
      setDescripcion("");
      setTallas({
        xs: 0,
        s: 0,
        m: 0,
        l: 0,
        xl: 0,
      });
      setBrand(""); // Reset the brand selection
      setImages([]);
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold mb-6 text-white-800">Agregar Nuevo Item</h2>
      <form className="space-y-6">
        <div>
          <Input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            className="w-full text-black"
          />
        </div>
        <div>
          <Input
            type="text"
            value={valor}
            onChange={handleValueChange}
            placeholder="Valor (Ej: 1.234,56)"
            className="w-full text-black"
          />
        </div>
        <div>
          <Input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción"
            className="w-full text-black"
          />
        </div>
        <div>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="" disabled>
              Seleccionar Marca
            </option>
            <option value="balmain">Balmain</option>
            <option value="tommy hilfiger">Tommy Hilfiger</option>
            <option value="guess">Guess</option>
            <option value="ropa americana">Ropa Americana</option>
          </select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Object.keys(tallas).map((talla) => (
            <div key={talla} className="flex flex-col items-center">
              <label className="text-sm font-medium text-white-700">
                {talla.toUpperCase()}
              </label>
              <Input
                type="number"
                name={talla}
                value={tallas[talla]}
                onChange={handleTallaChange}
                placeholder="0"
                className="w-full text-black text-center"
              />
            </div>
          ))}
        </div>
        <div>
          <Input
            type="file"
            onChange={handleImageChange}
            multiple
            className="w-full text-black"
          />
        </div>
        <Button
          type="button"
          onClick={handleUpload}
          disabled={loading || !formValid}
          className="w-full bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-blue-300"
        >
          {loading ? "Subiendo..." : "Subir"}
        </Button>
        {loading && (
          <Progress
            size="sm"
            isIndeterminate
            aria-label="Subiendo..."
            className="w-full mt-4"
          />
        )}
        {itemId && (
          <p className="text-green-500 mt-4">Item agregado con ID: {itemId}</p>
        )}
      </form>
    </div>
  );
}

export default AddItem;
