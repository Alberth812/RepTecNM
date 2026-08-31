"use client";

import { type ReactNode } from "react";

import { useRol } from "@/lib/use-rol";

export function SoloNoAdmin({ children }: { children: ReactNode }) {
  const { rol, listo } = useRol();
  if (listo && rol === "admin") return null;
  return <>{children}</>;
}
