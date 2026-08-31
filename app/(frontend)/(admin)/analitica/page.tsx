"use client";

import { EstadisticasPublicas } from "@/components/public/estadisticas-publicas";

export default function AnaliticaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analítica de la red</h1>
        <p className="text-sm text-muted-foreground">
          Información agregada de la comunidad para análisis y reportes de la directiva (RF-DASH-007).
        </p>
      </div>
      <EstadisticasPublicas />
    </div>
  );
}
