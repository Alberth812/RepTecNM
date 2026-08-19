"use client";

import { Glasses, Moon, Sun } from "lucide-react";

import { useTheme, type Theme } from "@/lib/use-theme";

const OPCIONES: { id: Theme; icon: typeof Sun; titulo: string }[] = [
  { id: "light", icon: Sun, titulo: "Modo claro" },
  { id: "sepia", icon: Glasses, titulo: "Descanso visual" },
  { id: "dark", icon: Moon, titulo: "Modo oscuro" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center rounded-lg border bg-muted p-1">
      {OPCIONES.map((o) => (
        <button
          key={o.id}
          onClick={() => setTheme(o.id)}
          className={`rounded-md p-1.5 transition-colors ${
            theme === o.id ? "bg-background shadow-sm" : "hover:bg-background/50"
          }`}
          title={o.titulo}
          aria-label={o.titulo}
        >
          <o.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
