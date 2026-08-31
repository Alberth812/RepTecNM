"use client";

import Link from "next/link";
import { useRol } from "@/lib/use-rol";

export function LogoResponsivo() {
  const { rol } = useRol();

  // Determinar destino según el rol
  const destino = () => {
    if (rol === "admin") return "/dashboard";
    if (rol === "afiliado") return "/credencial";
    return "/"; // Visitante va al landing
  };

  return (
    <Link href={destino()} className="flex items-center gap-3 shrink-0">
      {/* Logo oficial completo (isotipo + texto REP-TecNM) */}
      <img
        src="/logo.png"
        alt="REP-TecNM"
        className="h-8 w-auto object-contain"
      />
      {/* Subtítulo descriptivo (solo texto, no duplica el logo) */}
      <span className="hidden border-l border-border pl-3 text-sm font-normal text-muted-foreground xl:block">
        Red de Egresados de Posgrado del TecNM
      </span>
    </Link>
  );
}
