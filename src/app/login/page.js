"use client";
import React, { useEffect } from 'react'; // Importa useEffect
import { auth, provider, signInWithPopup, firestore } from '../firebase'; // Asegúrate de que firestore esté importado
import { useUser } from '../UserContext'; // Importa el contexto de usuario
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FaGoogle } from 'react-icons/fa'; // Importa el ícono de Google
import { useRouter } from 'next/navigation'; // Importa useRouter para redirección

const Login = () => {
  const { updateUser, user } = useUser(); // Obtén updateUser y user del contexto
  const router = useRouter(); // Inicializa useRouter

  useEffect(() => {
    // Verifica si el usuario ya está autenticado
    if (user) {
      // Redirige al usuario a la página de productos si está logueado
      router.push('/productos');
    }
  }, [user, router]);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Referencia al documento del usuario en Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // El usuario no existe, así que lo creamos
        await setDoc(userDocRef, {
          uid: user.uid,
          photoURL: user.photoURL,
          displayName: user.displayName,
          email: user.email,
          role: "user", // Asigna un rol predeterminado o ajusta según sea necesario
        });

        // Crear un documento de carrito para el usuario en la colección "carts"
        const cartRef = doc(firestore, "carts", user.uid);
        await setDoc(cartRef, {
          userId: user.uid,
          items: [], // Inicializa el carrito con un array vacío de items
        });

        // Crear un documento en la colección "purchases" para el usuario
        const purchasesRef = doc(firestore, "purchases", user.uid);
        await setDoc(purchasesRef, {
          userId: user.uid,
          purchases: [], // Inicializa la lista de compras con un array vacío
        });
      } else {
        // Si el usuario ya existe, podemos obtener el rol
        const userData = userDoc.data();
        // Aquí puedes hacer algo con el rol, como actualizar el estado del contexto
      }

      // Actualiza el estado del usuario en el contexto
      updateUser({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        role: userDoc.exists() ? userDoc.data().role : "user", // Guarda el rol del usuario
        photoURL: user.photoURL,
      });

      // Redirige a la página de productos después de iniciar sesión
      router.push('/productos');

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-6">
{/*         <Image src={logo} alt="Company Logo" className="h-30 w-auto" /> */}
      </div>
      <div className="p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Inicio de Sesión</h1>
        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        ><FaGoogle className="text-white h-6 w-6 mr-2" />
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
};

export default Login;
