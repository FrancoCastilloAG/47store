// components/WhatsAppButton.js
import React from 'react';
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
    return (
        <a
            href="https://wa.me/+56989013937" // Reemplaza con tu número de WhatsApp
            target="_blank"
            rel="noopener noreferrer"
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                backgroundColor: '#25D366',
                color: 'white',
                borderRadius: '50%',
                padding: '15px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                textAlign: 'center',
                zIndex: 1000,
                animation: 'float 3s ease-in-out infinite',
                fontSize: '24px' // Puedes ajustar el tamaño del icono aquí
            }}
        >
            <FaWhatsapp />
        </a>
    );
};

export default WhatsAppButton;
