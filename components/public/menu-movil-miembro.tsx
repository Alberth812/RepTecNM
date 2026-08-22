"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MENU_ADMIN, MENU_AFILIADO, contarMensajesNoLeidos } from "@/components/public/sidebar-miembro";
import { useRol } from "@/lib/use-rol";

export function MenuMovilMiembro() {
  const { rol, nombre } = useRol();
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [msgNoLeidas, setMsgNoLeidas] = useState(0);

  useEffect(() => {
    if (rol !== "visitante") setMsgNoLeidas(contarMensajesNoLeidos());
  }, [rol, abierto, pathname]);

  if (rol === "visitante") return null;

  const items = rol === "admin" ? MENU_ADMIN : MENU_AFILIADO;
  const nombreReal = nombre || (rol === "admin" ? "Administración RepTecNM" : "María Fernanda López Herrera");

  const salir = () => {
    localStorage.removeItem("rep-rol");
    localStorage.removeItem("rep-usuario");
    localStorage.removeItem("rep-tema");
    window.location.href = "/";
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={() => setAbierto(true)}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Sheet open={abierto} onOpenChange={setAbierto}>
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
                  pathname === it.href
                    ? "bg-[#004B87] text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
    </>
  );
}
