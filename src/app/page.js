"use client"; // Asegúrate de agregar esta línea para que funcione el redireccionamiento del cliente
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a otra página al acceder a la raíz
    router.push('/balmain'); // Cambia '/otraPagina' por la ruta a la que quieras redirigir
  }, [router]);

  return null; // No necesitamos renderizar nada aquí
};

export default HomePage;