"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "sepia";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("rep-theme") as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "sepia");
    root.classList.add(theme);
    localStorage.setItem("rep-theme", theme);
  }, [theme]);

  return { theme, setTheme };
}
