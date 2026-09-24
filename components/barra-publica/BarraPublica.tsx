"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BarraPublica() {
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/catalogo", label: "Catálogo" },
    { href: "/avisos", label: "Avisos" },
    { href: "/login", label: "Iniciar Sesión" },
  ];

  return (
    <header className="bg-[#004B87] text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#004B87] font-bold text-xl">REP</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">TecNM</h1>
              <p className="text-xs text-blue-200">Red de Egresados de Posgrado</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-200 ${
                  pathname === item.href ? "text-white border-b-2 border-white" : "text-blue-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuAbierto && (
          <nav className="md:hidden py-4 border-t border-blue-800">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-sm font-medium text-blue-100 hover:text-white"
                onClick={() => setMenuAbierto(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
