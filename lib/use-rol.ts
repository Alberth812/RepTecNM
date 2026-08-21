"use client";

import { useEffect, useState } from "react";

export type Rol = "visitante" | "afiliado" | "admin";

export function useRol() {
  const [rol, setRol] = useState<Rol>("visitante");

  useEffect(() => {
    const g = localStorage.getItem("rep-rol") as Rol | null;
    if (g) setRol(g);
  }, []);

  const cambiar = (r: Rol) => {
    localStorage.setItem("rep-rol", r);
    setRol(r);
  };

  return { rol, cambiar };
}
