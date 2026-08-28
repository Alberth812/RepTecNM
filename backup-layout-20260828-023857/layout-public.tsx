"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const RUTAS_CON_MENU = [
  "/catalogo",
  "/credencial",
  "/repositorio",
  "/mensajeria",
  "/seguimiento",
  "/dashboard",
  "/cms",
  "/publicar-blog",
  "/afiliados",
  "/aprobaciones",
  "/configuracion",
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [rol, setRol] = useState<"visitante" | "afiliado" | "admin">("visitante");
  const [nombre, setNombre] = useState("");
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const r = localStorage.getItem("rep-rol") as typeof rol;
    const n = localStorage.getItem("rep-usuario");
    if (r && n) {
      setRol(r);
      setNombre(n);
    }
  }, []);

  const salir = () => {
    localStorage.removeItem("rep-rol");
    localStorage.removeItem("rep-usuario");
    setRol("visitante");
    setNombre("");
    window.location.href = "/";
  };

  const conMenu = rol !== "visitante" && RUTAS_CON_MENU.some((r) => pathname.startsWith(r));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center rounded-xl bg-white px-3 py-2 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <img src="/log.png" alt="REP-TecNM" className="h-8 w-auto" />
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-slate-900 hover:text-[#004B87] transition-colors">
              Inicio
            </Link>
            <Link href="/#nosotros" className="text-sm font-medium text-slate-900 hover:text-[#004B87] transition-colors">
              Nosotros
            </Link>
            <Link href="/#que-hacemos" className="text-sm font-medium text-slate-900 hover:text-[#004B87] transition-colors">
              Servicios
            </Link>
            <Link href="/#afiliacion" className="text-sm font-medium text-slate-900 hover:text-[#004B87] transition-colors">
              Afiliación
            </Link>
            <Link href="/#contacto" className="text-sm font-medium text-slate-900 hover:text-[#004B87] transition-colors">
              Contacto
            </Link>
            <Link href="/blog" className="text-sm font-medium text-slate-900 hover:text-[#004B87] transition-colors">
              Blog
            </Link>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <Link href="/catalogo" aria-label="Buscar en el catálogo">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </Link>

            {/* Botones de sesión */}
            {rol === "visitante" && (
              <>
                <Link href="/registro">
                  <Button className="bg-amber-500 text-white hover:bg-amber-600 font-semibold">
                    ¿Eres nuevo? Afíliate
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="hidden sm:inline-flex">
                    Iniciar sesión
                  </Button>
                </Link>
              </>
            )}

            {rol === "afiliado" && (
              <>
                <span className="hidden max-w-24 truncate text-sm font-medium md:block">
                  {nombre || "Afiliado"}
                </span>
                <Button variant="ghost" size="icon" onClick={salir}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}

            {rol === "admin" && (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Panel
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={salir}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Menú móvil */}
            <Sheet open={abierto} onOpenChange={setAbierto}>
              <SheetTrigger className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100 transition-colors">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>Menú</SheetTitle>
                </SheetHeader>
                <nav className="grid gap-2 mt-4">
                  <Link href="/" onClick={() => setAbierto(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-900">Inicio</Link>
                  <Link href="/#nosotros" onClick={() => setAbierto(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-900">Nosotros</Link>
                  <Link href="/#que-hacemos" onClick={() => setAbierto(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-900">Servicios</Link>
                  <Link href="/#afiliacion" onClick={() => setAbierto(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-900">Afiliación</Link>
                  <Link href="/#contacto" onClick={() => setAbierto(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-900">Contacto</Link>
                  <Link href="/blog" onClick={() => setAbierto(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-900">Blog</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main>
        {children}
      </main>
    </div>
  );
}
