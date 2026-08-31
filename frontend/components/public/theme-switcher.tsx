"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/lib/use-theme";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`rounded-md p-1.5 transition-colors ${
          theme === "light" ? "bg-background shadow-sm" : "hover:bg-background/50"
        }`}
        title="Modo claro"
        aria-label="Modo claro"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`rounded-md p-1.5 transition-colors ${
          theme === "dark" ? "bg-background shadow-sm" : "hover:bg-background/50"
        }`}
        title="Modo oscuro"
        aria-label="Modo oscuro"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
