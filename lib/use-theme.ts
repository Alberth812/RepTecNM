"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const CLAVE = "rep-tema";

function leer(): Theme {
  const g = window.localStorage.getItem(CLAVE);
  return g === "dark" ? "dark" : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(leer());
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    window.localStorage.setItem(CLAVE, t);
    const r = document.documentElement;
    r.classList.remove("light", "sepia", "dark", "azul", "verde", "rosa");
    r.classList.add(t);
  }, []);

  return { theme, setTheme };
}
