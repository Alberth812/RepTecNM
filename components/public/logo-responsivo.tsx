"use client";
import Link from "next/link";
import { useRol } from "@/lib/use-rol";

/**
 * Componente de logo responsivo para REP-TecNM
 * Usa <img> estándar para evitar configuraciones complejas de next/image
 * para activos estáticos en la carpeta public/.
 */
export function LogoResponsivo() {
  const { rol } = useRol();
  const destino = rol === "admin" ? "/dashboard" : rol === "afiliado" ? "/credencial" : "/";

  return (
    <Link href={destino} className="flex items-center">
      {/* Logo profesional REP-TecNM - Imagen completa sin bordes ni marcos */}
      <img
        src="/logo.png"
        alt="REP-TecNM - Red de Egresados de Posgrado del Tecnológico Nacional de México"
        className="h-8 w-auto object-contain"
      />
    </Link>
  );
}
