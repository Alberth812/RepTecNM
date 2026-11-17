"use client";

import { useRol } from "@/lib/use-rol";

export function AvisoDemo() {
  const { rol } = useRol();
  if (rol === "admin") return null;
  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
      Entorno de demostración: vista como afiliado ACTIVO. En producción requiere autenticación (RF-MSG-001).
    </div>
  );
}
