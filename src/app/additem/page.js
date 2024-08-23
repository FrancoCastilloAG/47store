"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { storage, firestore } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Input, Progress } from "@nextui-org/react";

function AddItem() {
  const [nombre, setNombre] = useState("");
  const [valor, setValor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tallas, setTallas] = useState({
    xs: "",
    s: "",
    m: "",
    l: "",
    xl: "",
  });
  const [image, setImage] = useState(null);
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

  // Función para formatear el valor de entrada como peso chileno
  const formatCurrency = (amount) => {
    const number = parseFloat(amount.replace(/\./g, "").replace(",", "."));
    if (isNaN(number)) return "";
    return number.toLocaleString("es-CL");
  };

  // Función para manejar el cambio en el campo de valor
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

  // Validar el formulario
  useEffect(() => {
    const allFieldsFilled =
      nombre &&
      valor &&
      descripcion &&
      Object.values(tallas).every((talla) => talla);
    setFormValid(allFieldsFilled);
  }, [nombre, valor, descripcion, tallas]);

  const handleUpload = async () => {
    if (!formValid) return; // No hacer nada si el formulario no es válido

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
        valor_formateado: `$${formatCurrency(valor)}`,
      };

      const docRef = await addDoc(collection(firestore, "items"), itemData);
      const generatedId = docRef.id;
      itemData.id = generatedId;

      if (image) {
        const storageRef = ref(storage, `images/${generatedId}`);
        await uploadBytes(storageRef, image);
        const imageUrl = await getDownloadURL(storageRef);
        itemData.img = imageUrl;
      }

      await updateDoc(
        doc(collection(firestore, "items"), generatedId),
        itemData
      );

      console.log("Documento agregado con ID: ", generatedId);
      setItemId(generatedId);
      setNombre("");
      setValor("");
      setDescripcion("");
      setTallas({
        xs: "",
        s: "",
        m: "",
        l: "",
        xl: "",
      });
      setImage(null);
    } catch (error) {
      console.error("Error al agregar documento: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Agregar Nuevo Item</h2>
      <form className="space-y-4">
        <div>
          <Input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <Input
            type="text"
            value={valor}
            onChange={handleValueChange}
            placeholder="Valor (Ej: 1.234,56)"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <Input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Object.keys(tallas).map((talla) => (
            <div key={talla} className="flex flex-col items-center">
              <label className="text-sm font-medium text-gray-700">{talla.toUpperCase()}</label>
              <Input
                type="number"
                name={talla}
                value={tallas[talla]}
                onChange={handleTallaChange}
                placeholder={talla.toUpperCase()}
                className="w-full p-1 border border-gray-300 rounded text-center text-sm"
              />
            </div>
          ))}
        </div>
        <div>
          <Input
            type="file"
            onChange={handleImageChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !formValid} // Deshabilitar el botón si está cargando o el formulario no es válido
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-blue-300"
        >
          {loading ? "Subiendo..." : "Subir"}
        </button>
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
