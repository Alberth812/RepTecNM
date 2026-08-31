"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme, type Theme } from "@/lib/use-theme";

const TEMAS: { id: Theme; nombre: string; icon: typeof Sun }[] = [
  { id: "light", nombre: "Claro", icon: Sun },
  { id: "dark", nombre: "Oscuro", icon: Moon },
];

export function SelectorTema() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex flex-wrap gap-2">
      {TEMAS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTheme(t.id)}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            theme === t.id
              ? "border-[#004B87] bg-[#004B87] text-white shadow-sm"
              : "border-border bg-background text-muted-foreground hover:bg-muted"
          }`}
        >
          <t.icon className="h-3.5 w-3.5" /> {t.nombre}
        </button>
      ))}
    </div>
  );
}
