"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, UserPlus, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MENU_ADMIN, MENU_AFILIADO, contarMensajesNoLeidos } from "@/components/public/sidebar-miembro";
import { useRol } from "@/lib/use-rol";

export function MenuMovilMiembro() {
  const { rol, nombre, cambiar } = useRol();
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [msgNoLeidas, setMsgNoLeidas] = useState(0);
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    if (rol !== "visitante") setMsgNoLeidas(contarMensajesNoLeidos());
    
    setCurrentHash(window.location.hash);
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [rol, abierto, pathname]);

  const salir = async () => {
    try {
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
      await fetch("/api/auth/logout/", {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRFToken": csrfToken || "" },
      });
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
    cambiar("visitante");
    localStorage.removeItem("rep-rol");
    localStorage.removeItem("rep-usuario");
    localStorage.removeItem("rep-tema");
    window.location.href = "/";
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes('#') && pathname === '/') {
      e.preventDefault();
      setAbierto(false);
      
      const hash = href.split('#')[1];
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
          window.history.pushState(null, '', href);
          setCurrentHash('#' + hash);
        }
      }, 350);
    } else {
      setAbierto(false);
    }
  };

  const triggerClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-9 w-9 lg:hidden border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground";

  if (rol === "visitante") {
    const itemsVisitante = [
      { href: "/", label: "Inicio" },
      { href: "/#nosotros", label: "Nosotros" },
      { href: "/blog", label: "Blog" },
      { href: "/#contacto", label: "Contacto" },
    ];

    return (
      <Sheet open={abierto} onOpenChange={setAbierto}>
        <SheetTrigger className={triggerClasses} aria-label="Abrir menú">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 overflow-y-auto p-4">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú Principal</SheetTitle>
          </SheetHeader>
          <p className="mb-4 text-sm font-semibold text-muted-foreground">Navegación</p>
          <nav className="grid gap-1">
            {itemsVisitante.map((item) => {
              const isSamePage = pathname === item.href.split('#')[0];
              const targetHash = item.href.includes('#') ? '#' + item.href.split('#')[1] : '';
              const isActive = isSamePage && (targetHash ? currentHash === targetHash : currentHash === '');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-[#004B87] text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 grid gap-2 border-t pt-4">
            <Link href="/registro" onClick={() => setAbierto(false)}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <UserPlus className="h-4 w-4" /> ¿Eres nuevo? Afíliate
              </Button>
            </Link>
            <Link href="/login" onClick={() => setAbierto(false)}>
              <Button className="w-full justify-start gap-2">
                <LogIn className="h-4 w-4" /> Iniciar sesión
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const items = rol === "admin" ? MENU_ADMIN : MENU_AFILIADO;
  const nombreReal = nombre || (rol === "admin" ? "Administración RepTecNM" : "Afiliado");

  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetTrigger className={triggerClasses} aria-label="Abrir menú">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir menú</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto p-4">
        <SheetHeader className="sr-only">
          <SheetTitle>Menú</SheetTitle>
        </SheetHeader>
        <p className="mb-1 truncate text-sm font-semibold">{nombreReal}</p>
        <p className="mb-4 text-xs text-muted-foreground">
          {rol === "admin" ? "Administración" : "Afiliado activo"}
        </p>
        <nav className="grid gap-1">
          {items.map((it) => (
            <Link
              key={it.href + it.label}
              href={it.href}
              onClick={() => setAbierto(false)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === it.href ? "bg-[#004B87] text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <it.icon className="h-4 w-4 shrink-0" /> {it.label}
              {it.label === "Mensajería" && msgNoLeidas > 0 && (
                <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {msgNoLeidas}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={salir}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </SheetContent>
    </Sheet>
  );
}
