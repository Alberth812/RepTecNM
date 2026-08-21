"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";

import { AvatarSesion } from "@/components/admin/avatar-sesion";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/public/theme-switcher";
import { useRol } from "@/lib/use-rol";

const RUTAS_CON_SIDEBAR = ["/credencial", "/catalogo", "/repositorio", "/mensajeria", "/seguimiento", "/notificaciones", "/ajustes"];

export function BarraSesion() {
  const { rol, nombre, cambiar } = useRol();
  const pathname = usePathname();
  const conSidebar = RUTAS_CON_SIDEBAR.some((r) => pathname.startsWith(r));

  const salir = () => {
    cambiar("visitante");
    window.location.href = "/";
  };

  return (
    <div className="flex items-center gap-3">
      {rol !== "visitante" && (
        <span className="flex items-center gap-2">
          <AvatarSesion />
          <span className="hidden text-sm font-medium lg:block">
            {nombre || (rol === "admin" ? "Administración RepTecNM" : "María Fernanda López Herrera")}
          </span>
        </span>
      )}

      <ThemeSwitcher />

      {rol === "visitante" && (
        <>
          <Link href="/registro">
            <Button className="bg-amber-400 text-amber-950 hover:bg-amber-300">¿Eres nuevo? Afíliate</Button>
          </Link>
          <Link href="/login">
            <Button>Iniciar sesión</Button>
          </Link>
        </>
      )}

      {rol === "afiliado" && !conSidebar && (
        <Button variant="ghost" size="sm" onClick={salir}>
          <LogOut className="mr-2 h-4 w-4" /> Salir
        </Button>
      )}

      {rol === "admin" && (
        <>
          <Link href="/dashboard">
            <Button variant="outline">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Volver al panel
            </Button>
          </Link>
          {!conSidebar && (
            <Button variant="ghost" size="sm" onClick={salir}>
              <LogOut className="mr-2 h-4 w-4" /> Salir
            </Button>
          )}
        </>
      )}
    </div>
  );
}
