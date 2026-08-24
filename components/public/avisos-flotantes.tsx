"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

import { avisosPendientes, cerrarAviso, type Aviso } from "@/lib/avisos";

const TONOS = {
  info: { borde: "border-[#004B87]/40", icono: Info, color: "text-[#004B87]" },
  exito: { borde: "border-green-500/50", icono: CheckCircle2, color: "text-green-600" },
  alerta: { borde: "border-amber-500/60", icono: AlertTriangle, color: "text-amber-600" },
};

export function AvisosFlotantes() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setAvisos(avisosPendientes()), 600);
    return () => clearTimeout(t);
  }, []);

  const cerrar = (id: string) => {
    cerrarAviso(id);
    setAvisos((prev) => prev.filter((a) => a.id !== id));
  };

  if (avisos.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] grid w-[calc(100%-2rem)] max-w-sm gap-3">
      {avisos.map((a) => {
        const t = TONOS[a.tono] ?? TONOS.info;
        const Icono = t.icono;
        return (
          <div
            key={a.id}
            className={`relative rounded-2xl border ${t.borde} bg-background/95 p-4 pr-10 shadow-xl backdrop-blur`}
          >
            <button
              type="button"
              onClick={() => cerrar(a.id)}
              aria-label="Cerrar aviso"
              className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex gap-3">
              <Icono className={`mt-0.5 h-5 w-5 shrink-0 ${t.color}`} />
              <div>
                <p className="text-sm font-semibold">{a.titulo}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.texto}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
