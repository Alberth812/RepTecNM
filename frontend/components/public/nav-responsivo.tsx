"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NavResponsivo() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo y navegación desktop */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">REP-TecNM</span>
          </Link>
          
          {/* Nav Desktop - Oculto en móvil */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-primary">
              Inicio
            </Link>
            <Link href="/#nosotros" className="transition-colors hover:text-primary">
              Nosotros
            </Link>
            <Link href="/catalogo" className="transition-colors hover:text-primary">
              Catálogo
            </Link>
            <Link href="/blog" className="transition-colors hover:text-primary">
              Blog
            </Link>
          </nav>
        </div>

        {/* Acciones - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Search className="h-4 w-4" />
          </Button>
          <Link href="/registro">
            <Button variant="outline" size="sm" className="text-xs">
              ¿Eres nuevo? Afíliate
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="text-xs">
              Iniciar sesión
            </Button>
          </Link>
        </div>

        {/* Menú móvil - Hamburguesa */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Search className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-3 space-y-3">
          <Link 
            href="/" 
            className="block text-sm font-medium py-2"
            onClick={() => setMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link 
            href="/#nosotros" 
            className="block text-sm font-medium py-2"
            onClick={() => setMenuOpen(false)}
          >
            Nosotros
          </Link>
          <Link 
            href="/catalogo" 
            className="block text-sm font-medium py-2"
            onClick={() => setMenuOpen(false)}
          >
            Catálogo
          </Link>
          <Link 
            href="/blog" 
            className="block text-sm font-medium py-2"
            onClick={() => setMenuOpen(false)}
          >
            Blog
          </Link>
          <div className="pt-3 border-t space-y-2">
            <Link href="/registro" onClick={() => setMenuOpen(false)}>
              <Button variant="outline" className="w-full text-sm">
                ¿Eres nuevo? Afíliate
              </Button>
            </Link>
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <Button className="w-full text-sm">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
