import "./globals.css";
import { UserProvider } from './UserContext';
import { CartProvider } from "./CartContext";
import Navigationbar from "@/components/navbar";

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
            <br></br>
            {children}
            <br></br>
          </body>
        </html>
      </CartProvider>
    </UserProvider >
  );
}
