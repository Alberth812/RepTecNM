"use client";

import { useCallback, useState } from "react";

export type Theme = "light" | "sepia" | "dark";

const CLAVE = "rep-tema";

function leer(): Theme {
  if (typeof window === "undefined") return "light";
  const g = window.localStorage.getItem(CLAVE);
  return g === "sepia" || g === "dark" ? g : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(leer);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    window.localStorage.setItem(CLAVE, t);
    const r = document.documentElement;
    r.classList.remove("light", "sepia", "dark");
    r.classList.add(t);
  }, []);

  return { theme, setTheme };
}
