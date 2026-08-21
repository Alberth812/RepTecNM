"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/public/theme-switcher";
import { useRol } from "@/lib/use-rol";

export function BarraSesion() {
  const { rol, nombre, cambiar } = useRol();

  const salir = () => {
    cambiar("visitante");
    window.location.href = "/";
  };

  return (
    <div className="flex items-center gap-2">
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

      {rol === "afiliado" && (
        <>
          <span className="hidden max-w-40 truncate text-sm text-muted-foreground md:block">
            {nombre || "Afiliado activo"}
          </span>
          <Button variant="ghost" size="sm" onClick={salir}>
            <LogOut className="mr-2 h-4 w-4" /> Salir
          </Button>
        </>
      )}

      {rol === "admin" && (
        <>
          <Link href="/dashboard">
            <Button variant="outline">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Volver al panel
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={salir}>
            <LogOut className="mr-2 h-4 w-4" /> Salir
          </Button>
        </>
      )}
    </div>
  );
}
