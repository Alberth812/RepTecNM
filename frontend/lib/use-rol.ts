"use client";
import { useEffect, useState, useCallback } from "react";

export type Rol = "visitante" | "afiliado" | "admin";

export function useRol() {
  const [rol, setRol] = useState<Rol>("visitante");
  const [nombre, setNombre] = useState<string>("");
  const [listo, setListo] = useState(false);

  const verificarSesion = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me/", {
        credentials: "include",
        cache: "no-store", // Importante: evita que el navegador cacheé la respuesta de sesión
      });

      if (res.ok) {
        const data = await res.json();
        const nuevoRol = data.rol as Rol;
        setRol(nuevoRol);
        setNombre(data.nombre);
        localStorage.setItem("rep-rol", nuevoRol);
        localStorage.setItem("rep-usuario", data.nombre);
      } else {
        setRol("visitante");
        setNombre("");
        localStorage.removeItem("rep-rol");
        localStorage.removeItem("rep-usuario");
      }
    } catch (error) {
      console.error("Error verificando sesión:", error);
      setRol("visitante");
      setNombre("");
    } finally {
      setListo(true);
    }
  }, []);

  useEffect(() => {
    verificarSesion();

    // Escuchar cambios de sesión en OTRAS pestañas (solo si se cierra sesión)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "rep-rol" && e.newValue === null) {
        setRol("visitante");
        setNombre("");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [verificarSesion]);

  const cerrarSesion = async () => {
    try {
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];

      await fetch("/api/auth/logout/", {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRFToken": csrfToken || "" },
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      // Notificar a otras pestañas que se cerró sesión
      localStorage.removeItem("rep-rol");
      localStorage.removeItem("rep-usuario");
      setRol("visitante");
      setNombre("");
      window.location.href = "/";
    }
  };

  return { rol, nombre, listo, cerrarSesion };
}
