"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type AvisoCMS = {
  titulo: string;
  contenido: string;
  tipo: "info" | "aviso" | "urgente" | "convocatoria";
};

const TONOS = {
  info: { borde: "border-[#004B87]/40", icono: Info, color: "text-[#004B87]", bg: "bg-blue-50/80 dark:bg-blue-950/40" },
  aviso: { borde: "border-amber-500/60", icono: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50/80 dark:bg-amber-950/40" },
  urgente: { borde: "border-red-500/60", icono: AlertTriangle, color: "text-red-700", bg: "bg-red-50/80 dark:bg-red-950/40" },
  convocatoria: { borde: "border-green-500/50", icono: CheckCircle2, color: "text-green-700", bg: "bg-green-50/80 dark:bg-green-950/40" },
};

export function AvisosFlotantes() {
  const [avisos, setAvisos] = useState<AvisoCMS[]>([]);
  const [cerrados, setCerrados] = useState<string[]>([]);

  useEffect(() => {
    const cargarAvisos = async () => {
      try {
        const res = await fetch("/api/cms/contenido-inicio/publico/");
        if (res.ok) {
          const data = await res.json();
          // Leer qué avisos ya cerró el usuario en este navegador
          const cerradosLocal = JSON.parse(localStorage.getItem("rep-avisos-cerrados") || "[]");
          setCerrados(cerradosLocal);
          
          // Filtrar solo los avisos válidos que no hayan sido cerrados
          const avisosActivos = (data.avisos || []).filter((a: AvisoCMS) => 
            a.titulo && a.contenido && !cerradosLocal.includes(a.titulo)
          );
          setAvisos(avisosActivos);
        }
      } catch (error) {
        console.error("Error cargando avisos del CMS", error);
      }
    };
    // Pequeño delay para no bloquear el render inicial de la página
    const t = setTimeout(cargarAvisos, 500);
    return () => clearTimeout(t);
  }, []);

  const cerrar = (titulo: string) => {
    const nuevosCerrados = [...cerrados, titulo];
    localStorage.setItem("rep-avisos-cerrados", JSON.stringify(nuevosCerrados));
    setCerrados(nuevosCerrados);
    setAvisos((prev) => prev.filter((a) => a.titulo !== titulo));
  };

  if (avisos.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] grid w-[calc(100%-2rem)] max-w-sm gap-3">
      {avisos.map((a, index) => {
        const t = TONOS[a.tipo as keyof typeof TONOS] ?? TONOS.info;
        const Icono = t.icono;
        return (
          <div
            key={index}
            className={`relative rounded-2xl border ${t.borde} ${t.bg} p-4 pr-10 shadow-xl backdrop-blur-md transition-all`}
          >
            <button
              type="button"
              onClick={() => cerrar(a.titulo)}
              aria-label="Cerrar aviso"
              className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex gap-3">
              <Icono className={`mt-0.5 h-5 w-5 shrink-0 ${t.color}`} />
              <div>
                <p className="text-sm font-semibold">{a.titulo}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.contenido}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
