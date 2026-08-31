"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useRol } from "@/lib/use-rol";

export function GuardiaAdmin({ children }: { children: ReactNode }) {
  const { rol, listo } = useRol();
  const router = useRouter();

  useEffect(() => {
    if (!listo) return;
    if (rol === "visitante") router.replace("/login");
    else if (rol === "afiliado") router.replace("/");
  }, [listo, rol, router]);

  if (!listo || rol !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Verificando sesión…</p>
      </div>
    );
  }
  return <>{children}</>;
}
