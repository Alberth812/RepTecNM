"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, UserPlus, LogIn } from "lucide-react";

import { AvatarSesion } from "@/components/admin/avatar-sesion";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/public/theme-switcher";
import { useRol } from "@/lib/use-rol";

const RUTAS_CON_SIDEBAR = [
  "/credencial",
  "/catalogo",
  "/repositorio",
  "/mensajeria",
  "/seguimiento",
  "/notificaciones",
  "/ajustes",
];

export function BarraSesion() {
  const { rol, nombre, cambiar } = useRol();
  const pathname = usePathname();
  const conSidebar = RUTAS_CON_SIDEBAR.some((r) => pathname.startsWith(r));

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

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <ThemeSwitcher />

      {rol !== "visitante" && (
        <span className="flex items-center gap-2">
          <AvatarSesion />
          <span className="hidden text-sm font-medium md:block">
            {nombre || (rol === "admin" ? "Administración" : "Afiliado")}
          </span>
        </span>
      )}

      {rol === "visitante" && (
        <div className="flex items-center gap-2">
          <Link href="/registro">
            <Button size="sm" className="bg-amber-400 text-amber-950 hover:bg-amber-300 hidden sm:flex">
              ¿Eres nuevo? Afíliate
            </Button>
            <Button size="icon" variant="outline" className="sm:hidden" aria-label="Afiliarse">
              <UserPlus className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="hidden sm:flex">
              Iniciar sesión
            </Button>
            <Button size="icon" variant="default" className="sm:hidden" aria-label="Iniciar sesión">
              <LogIn className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {rol === "afiliado" && !conSidebar && (
        <Button variant="ghost" size="sm" onClick={salir} className="hidden sm:flex">
          <LogOut className="mr-2 h-4 w-4" /> Salir
        </Button>
      )}

      {rol === "admin" && (
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="hidden sm:block">
            <Button variant="outline" size="sm">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Panel
            </Button>
          </Link>
          {!conSidebar && (
            <Button variant="ghost" size="sm" onClick={salir} className="hidden sm:flex">
              <LogOut className="mr-2 h-4 w-4" /> Salir
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
