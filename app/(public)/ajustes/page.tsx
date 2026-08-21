"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { CambiarContrasena } from "@/components/public/cambiar-contrasena";
import { SelectorTema } from "@/components/public/selector-tema";

const FONDOS = [
  { nombre: "Sin fondo", valor: "" },
  { nombre: "Azul institucional", valor: "linear-gradient(160deg, rgba(0,75,135,0.10), rgba(0,112,192,0.18))" },
  { nombre: "Sepia suave", valor: "linear-gradient(160deg, rgba(180,140,80,0.10), rgba(120,80,40,0.18))" },
  { nombre: "Pizarra", valor: "linear-gradient(160deg, rgba(15,23,42,0.35), rgba(30,41,59,0.5))" },
];

export default function AjustesPage() {
  const [fondo, setFondo] = useState("");

  useEffect(() => setFondo(localStorage.getItem("rep-fondo-chat") ?? ""), []);

  const guardarFondo = (v: string) => {
    localStorage.setItem("rep-fondo-chat", v);
    setFondo(v);
    toast.success("Fondo del chat actualizado.");
  };

  const subirImagen = (f: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      toast.error("Usa JPG, PNG o WebP.");
      return;
    }
    if (f.size > 1500000) {
      toast.error("Imagen demasiado pesada (máx. 1.5 MB).");
      return;
    }
    const r = new FileReader();
    r.onload = () => guardarFondo(`url("${String(r.result)}")`);
    r.readAsDataURL(f);
  };

  return (
    <div className="mx-auto grid max-w-2xl gap-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="mt-2 text-muted-foreground">Preferencias personales de tu cuenta.</p>
      </div>

      <div className="grid gap-4 rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">Tema de la plataforma</h2>
        <p className="text-sm text-muted-foreground">
          Elige el esquema de color global; se aplica en toda la aplicación y se recuerda en este dispositivo.
        </p>
        <SelectorTema />
      </div>

      <div className="grid gap-4 rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">Fondo del chat de mensajería</h2>
        <p className="text-sm text-muted-foreground">
          Elige un fondo para el área de mensajes; se aplica en tu navegador.
        </p>
        <div className="flex flex-wrap gap-2">
          {FONDOS.map((f) => (
            <button
              key={f.nombre}
              type="button"
              onClick={() => guardarFondo(f.valor)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                fondo === f.valor
                  ? "border-[#004B87] bg-[#004B87] text-white"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.nombre}
            </button>
          ))}
          <label className="cursor-pointer rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
            Subir imagen
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) subirImagen(f); }}
            />
          </label>
        </div>
        <div
          className="h-24 rounded-xl border bg-background"
          style={{ backgroundImage: fondo || undefined, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      </div>

      <CambiarContrasena />
    </div>
  );
}
