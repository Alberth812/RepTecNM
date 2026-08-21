"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useRol } from "@/lib/use-rol";

const RUTAS_MIEMBRO = ["/credencial", "/mensajeria", "/seguimiento", "/repositorio"];

export function GuardiaPublica({ children }: { children: ReactNode }) {
  const { rol, listo } = useRol();
  const pathname = usePathname();
  const router = useRouter();
  const protegida = RUTAS_MIEMBRO.some((r) => pathname.startsWith(r));

  useEffect(() => {
    if (listo && protegida && rol === "visitante") router.replace("/login");
  }, [listo, protegida, rol, router]);

  if (protegida && (!listo || rol === "visitante")) return null;
  return <>{children}</>;
}
