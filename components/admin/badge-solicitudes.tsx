"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export function BadgeSolicitudesPendientes() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/admin/solicitudes");
        if (res.ok) {
          const data = await res.json();
          // Filtramos las que requieren atención (ajusta según el nombre de tu estado)
          const pendientes = data.data?.filter((s: any) => 
            s.estado === "REQUIERE_ATENCION" || s.revisionDecision === null
          ).length ?? 0;
          setCount(pendientes);
        }
      } catch (error) {
        console.error("Error al cargar solicitudes pendientes:", error);
        setCount(0);
      }
    }
    fetchCount();
  }, []);

  // No mostrar nada si es 0 o aún está cargando
  if (count === null || count === 0) return null;

  return (
    <Badge variant="destructive" className="ml-2 h-5 min-w-[1.25rem] px-1.5 text-xs">
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
