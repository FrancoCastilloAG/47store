"use client";
import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
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

export default function Example() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, handleLogout } = useUser();
  const { getTotalItemCount } = useCart();

  const menuItems = ["perfil", "productos", "carrito", "contacto", "logout"];

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      isBordered
      className="navbar-custom"
    >
      <NavbarContent className="flex items-center justify-between w-full">
        {/* Toggle button for mobile menu */}
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />

        {/* Logo and Navigation Menu */}
        <div className="flex items-center flex-grow justify-center sm:justify-between">
          <div className="flex-shrink-0">
            {/* Logo */}
          </div>

          {/* Menu Items for Large Screens */}
          <div className="hidden sm:flex items-center space-x-4">
            {menuItems.slice(0, -1).map((item, index) => (
              <NavbarItem key={index}>
                <Link
                  href={`/${item}`}
                  aria-current={item === "productos" ? "page" : undefined}
                >
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
                  <Link href="/deleteitem">Eliminar Item</Link>
                </NavbarItem>
              </>
            )}
          </div>
        </div>

        {/* Icons and User Profile */}
        <div className="flex items-center gap-4">
          <NavbarItem>
            <Link href="/carrito" className="relative">
              <FaShoppingCart size={24} className="text-cyan-400" />
              {getTotalItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-1">
                  {getTotalItemCount()}
                </span>
              )}
            </Link>
          </NavbarItem>
          <NavbarContent as="div" justify="end">
            {user ? (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    color="secondary"
                    name={user.displayName}
                    size="sm"
                    src={user.photoURL}
                  />
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Profile Actions"
                  variant="flat"
                  className="dropdown-menu-custom"
                >
                  <DropdownItem key="profile" className="dropdown-item-custom">
                    <p className="font-semibold">Sesión Iniciada</p>
                    <p className="font-semibold">{user.email}</p>
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
      <NavbarMenu
        className={`sm:hidden ${isMenuOpen ? "block" : "hidden"} w-full`}
      >
        {menuItems.map((item, index) => (
          <NavbarMenuItem
            key={`${item}-${index}`}
            className={`navbar-menu-item-custom ${
              item === "logout" ? "navbar-menu-item-logout" : ""
            }`}
          >
            <Link className="w-full" href={`/${item}`} size="lg">
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Link>
          </NavbarMenuItem>
        ))}
        {user?.role === "admin" && (
          <>
            <NavbarMenuItem className="navbar-menu-item-custom">
              <Link href="/additem" className="w-full" size="lg">
                Agregar Item
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem className="navbar-menu-item-custom">
              <Link href="/deleteitem" className="w-full" size="lg">
                Eliminar Item
              </Link>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </Navbar>
  );
}
