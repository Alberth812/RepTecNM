"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "sepia" | "dark" | "azul" | "verde" | "rosa";

const CLAVE = "rep-tema";
const TEMAS_VALIDOS: Theme[] = ["light", "sepia", "dark", "azul", "verde", "rosa"];
const CLASES = "light sepia dark azul verde rosa";

function leer(): Theme {
  const g = window.localStorage.getItem(CLAVE);
  return TEMAS_VALIDOS.includes(g as Theme) ? (g as Theme) : "light";
}

export function useTheme() {
  // Siempre arranca en "light" para que servidor y cliente pinten igual;
  // el script del <body> ya aplico el tema guardado antes del primer paint.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(leer());
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    window.localStorage.setItem(CLAVE, t);
    const r = document.documentElement;
    r.classList.remove(...CLASES.split(" "));
    r.classList.add(t);
  }, []);

  return { theme, setTheme };
}
