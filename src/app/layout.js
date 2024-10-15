import "./globals.css";
import { UserProvider } from './UserContext';
import { CartProvider } from "./CartContext";
import Navigationbar from "@/components/navbar";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata = {
  title: "TrapHouse Clothing",
  description: "Tienda de ropa",
};

export default function RootLayout({ children }) {
  return (
    <UserProvider >
      <CartProvider>
        <html lang="en">
          <body>
            <Navigationbar/>
            <WhatsAppButton />
            <br></br>
            {children}
            <br></br>
          </body>
        </html>
      </CartProvider>
    </UserProvider >
  );
}
