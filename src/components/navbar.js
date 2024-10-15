"use client";
import React, { useState } from "react";
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/react";
import { FaShoppingCart } from "react-icons/fa";
import { useUser } from "../app/UserContext.js";
import { useCart } from "../app/CartContext.js";
import Image from "next/image.js";
import Logo from "../images/TrapHouse.png"

export default function Navigationbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, handleLogout } = useUser();
  const { getTotalItemCount } = useCart();

  const menuItems = ["productos"];

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        {/* Toggle button for mobile menu */}
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />

        {/* Logo */}
        <div className="flex items-center flex-grow justify-center sm:justify-start">
          <div className="flex-shrink-0">
            <Image
              src={Logo}
              alt="Logo"
              className="max-h-30 max-w-40" // Ajustar la altura máxima y ancho
            />
          </div>
        </div>

        {/* Menu Items for Large Screens */}
        <div className="hidden sm:flex space-x-4 justify-end flex-grow">
          {menuItems.map((item, index) => (
            <NavbarItem key={index}>
              <Link href={`/${item}`} className="text-black">
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Link>
            </NavbarItem>
          ))}
          {user?.role === "admin" && (
            <>
              <NavbarItem>
                <Link href="/additem">Agregar Item</Link>
              </NavbarItem>
              <NavbarItem>
                <Link href="/deleteitem">Editar Item</Link>
              </NavbarItem>
              <NavbarItem>
                <Link href="/ventas">Ventas</Link>
              </NavbarItem>
            </>
          )}
        </div>

        {/* Icons and User Profile */}
        <div className="flex items-center gap-4 justify-end">
          <NavbarItem>
            <Link href="/carrito" className="relative">
              <FaShoppingCart size={24} className="text-black" />
              {getTotalItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-1">
                  {getTotalItemCount()}
                </span>
              )}
            </Link>
          </NavbarItem>
          <NavbarContent as="div">
            {user ? (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar as="button" name={user.displayName} size="sm" src={user.photoURL} />
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Profile Actions"
                  variant="flat"
                  className="dropdown-menu-custom"
                >
                  <DropdownItem key="profile" className="dropdown-item-custom" href="/perfil">
                    <p className="font-semibold">Sesión Iniciada</p>
                    <p className="font-semibold">{user.email}</p>
                  </DropdownItem>
                  <DropdownItem key="Carrito" className="dropdown-item-logout" href="/carrito">
                    Cart
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    className="dropdown-item-logout"
                    onClick={handleLogout}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <NavbarItem>
                <Link href="/login">Iniciar Sesión</Link>
              </NavbarItem>
            )}
          </NavbarContent>
        </div>
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className={`sm:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link className="w-full text-black" href={`/${item}`} size="lg">
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Link>
          </NavbarMenuItem>
        ))}
        {user?.role === "admin" && (
          <>
            <NavbarMenuItem>
              <Link href="/additem" className="w-full" size="lg">
                Agregar Item
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem className="navbar-menu-item-custom">
              <Link href="/deleteitem" className="w-full" size="lg">
                Eliminar Item
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem className="navbar-menu-item-custom">
              <Link href="/ventas" className="w-full" size="lg">
                Ventas
              </Link>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </Navbar>

  );
}
