"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck, CalendarCheck, FileText, LayoutDashboard, LogOut, MessageSquareText, UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/public/theme-switcher";
import { useRol } from "@/lib/use-rol";

export function BarraSesion() {
  const { rol, cambiar } = useRol();
  const router = useRouter();

  const salir = () => {
    cambiar("visitante");
    router.push("/");
  };

  return (
    <div className="flex items-center gap-2">
      <ThemeSwitcher />

      <select
        className="rounded-lg border bg-background px-2 py-1.5 text-xs text-muted-foreground"
        value={rol}
        title="Demostración: en producción el rol lo define la sesión (RF-AUTH)"
        onChange={(e) => {
          const r = e.target.value as Rol;
          cambiar(r);
          router.push(r === "admin" ? "/dashboard" : "/");
        }}
      >
        <option value="visitante">Visitante</option>
        <option value="afiliado">Afiliado activo</option>
        <option value="admin">Administración</option>
      </select>

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <UserRound className="mr-2 h-4 w-4" /> Mi espacio
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>María Fernanda López Herrera · ACTIVO</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/credencial")}>
                <BadgeCheck className="mr-2 h-4 w-4" /> Credencial digital
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/repositorio")}>
                <FileText className="mr-2 h-4 w-4" /> Mis publicaciones
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/mensajeria")}>
                <MessageSquareText className="mr-2 h-4 w-4" /> Mensajería
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/seguimiento")}>
                <CalendarCheck className="mr-2 h-4 w-4" /> Seguimiento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
