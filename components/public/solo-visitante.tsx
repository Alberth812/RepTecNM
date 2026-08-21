"use client";

import { type ReactNode } from "react";

import { useRol } from "@/lib/use-rol";

export function SoloVisitante({ children }: { children: ReactNode }) {
  const { rol, listo } = useRol();
  if (listo && rol !== "visitante") return null;
  return <>{children}</>;
}
