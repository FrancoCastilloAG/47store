"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { firestore } from './firebase'; // Importa la instancia correcta de Firestore
import { useUser } from './UserContext'; // Importa el contexto de usuario

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser utilizado dentro de un CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user } = useUser(); // Obtén el usuario del contexto
    const [cart, setCart] = useState([]); // Estado local del carrito

    useEffect(() => {
        const fetchCartItems = async () => {
            if (!user) return;
            try {
                const cartItems = await getCartItems();
                setCart(cartItems);
            } catch (error) {
                console.error('Error al obtener elementos del carrito:', error);
            }
        };
        fetchCartItems();
    }, [user]);

    const addCartItem = async (itemId, selectedTallas, itemImage) => {
        if (!user) return console.error('Usuario no autenticado');

        const userId = user.uid;

        try {
            const cartDocRef = doc(firestore, 'carts', userId);
            const cartDocSnap = await getDoc(cartDocRef);

            let updatedCart = [];

            if (cartDocSnap.exists()) {
                updatedCart = cartDocSnap.data().items || [];
            }

            const existingItemIndex = updatedCart.findIndex(item => item.id === itemId);

            if (existingItemIndex !== -1) {
                const existingItem = updatedCart[existingItemIndex];
                Object.keys(selectedTallas).forEach(talla => {
                    if (selectedTallas[talla] > 0) {
                        existingItem.tallas[talla] = (existingItem.tallas[talla] || 0) + selectedTallas[talla];
                    }
                });
            } else {
                updatedCart.push({ id: itemId, tallas: selectedTallas ,itemImage :itemImage });
            }

            await setDoc(cartDocRef, { items: updatedCart });

            setCart(updatedCart);
            console.log('Item agregado al carrito correctamente');
        } catch (error) {
            console.error('Error al agregar item al carrito:', error);
        }
    };

    const removeCartItem = async (itemId) => {
        if (!user) return console.error('Usuario no autenticado');

        const userId = user.uid;

        try {
            const cartDocRef = doc(firestore, 'carts', userId);
            const cartDocSnap = await getDoc(cartDocRef);

            if (cartDocSnap.exists()) {
                let cartItems = cartDocSnap.data().items || [];
                cartItems = cartItems.filter(item => item.id !== itemId);
                await setDoc(cartDocRef, { items: cartItems }, { merge: true });
                setCart(cartItems);
                console.log('Item eliminado del carrito correctamente');
            } else {
                console.error('El carrito del usuario no existe');
            }
        } catch (error) {
            console.error('Error al eliminar item del carrito:', error);
        }
    };

    const clearCart = async () => {
        if (!user) return console.error('Usuario no autenticado');

        const userId = user.uid;

        try {
            const cartDocRef = doc(firestore, 'carts', userId);
            await deleteDoc(cartDocRef);
            setCart([]);
            console.log('Carrito vaciado correctamente');
        } catch (error) {
            console.error('Error al vaciar el carrito:', error);
        }
    };

    const getTotalItemCount = () => {
        return cart.reduce((total, item) => {
            return total + Object.values(item.tallas || {}).reduce((sum, cantidad) => sum + cantidad, 0);
        }, 0);
    };

    const getCartItems = async () => {
        if (!user) return [];

        const userId = user.uid;

        try {
            const cartDocRef = doc(firestore, 'carts', userId);
            const cartDocSnap = await getDoc(cartDocRef);

            if (cartDocSnap.exists()) {
                return cartDocSnap.data().items || [];
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error al obtener los elementos del carrito:', error);
            return [];
        }
    };

    return (
        <CartContext.Provider value={{ cart, addCartItem, removeCartItem, clearCart, getTotalItemCount }}>
            {children}
        </CartContext.Provider>
    );
};
