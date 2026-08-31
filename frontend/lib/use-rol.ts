"use client";

import { useEffect, useState } from "react";

export type Rol = "visitante" | "afiliado" | "admin";

interface UserData {
  rol: Rol;
  nombre: string;
  email: string;
}

export function useRol() {
  const [rol, setRol] = useState<Rol>("visitante");
  const [nombre, setNombre] = useState<string>("");
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const res = await fetch("/api/auth/me/", {
          credentials: "include", // Envía las cookies de sesión
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setRol(data.rol);
          setNombre(data.nombre);
        } else {
          setRol("visitante");
          setNombre("");
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
        setRol("visitante");
      } finally {
        setListo(true);
      }
    };

    verificarSesion();
  }, []);

  const cambiar = (nuevoRol: Rol) => {
    setRol(nuevoRol);
  };

  return { rol, nombre, cambiar, listo };
}
