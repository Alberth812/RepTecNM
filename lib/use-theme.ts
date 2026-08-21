"use client";

import { useCallback, useState } from "react";

export type Theme = "light" | "sepia" | "dark" | "azul" | "verde" | "rosa";

const CLAVE = "rep-tema";
const TEMAS_VALIDOS: Theme[] = ["light", "sepia", "dark", "azul", "verde", "rosa"];
const CLASES = "light sepia dark azul verde rosa";

function leer(): Theme {
  if (typeof window === "undefined") return "light";
  const g = window.localStorage.getItem(CLAVE);
  return TEMAS_VALIDOS.includes(g as Theme) ? (g as Theme) : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(leer);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    window.localStorage.setItem(CLAVE, t);
    const r = document.documentElement;
    r.classList.remove(...CLASES.split(" "));
    r.classList.add(t);
  }, []);

  return { theme, setTheme };
}
