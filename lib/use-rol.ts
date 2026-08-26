"use client";

import { useEffect, useState } from "react";

export type Rol = "visitante" | "afiliado" | "admin";

export function useRol() {
  const [rol, setRol] = useState<Rol>("visitante");
  const [nombre, setNombre] = useState("");
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const g = localStorage.getItem("rep-rol") as Rol | null;
    if (g) setRol(g);
    setNombre(localStorage.getItem("rep-usuario") ?? "");
    setListo(true);
  }, []);

  const cambiar = (r: Rol, n?: string) => {
    localStorage.setItem("rep-rol", r);
    setRol(r);
    if (n) {
      localStorage.setItem("rep-usuario", n);
      setNombre(n);
    }
  };

  return { rol, nombre, cambiar, listo };
}
