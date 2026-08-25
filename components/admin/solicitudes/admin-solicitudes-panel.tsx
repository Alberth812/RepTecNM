// components/admin/solicitudes/admin-solicitudes-panel.tsx
"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SolicitudesTabla } from "./solicitudes-tabla";
import { SolicitudDetalle } from "./solicitud-detalle";

export function AdminSolicitudesPanel() {
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState<string | null>(
    null,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Solicitudes de afiliación
        </h1>
        <p className="text-muted-foreground">
          Revisa, aprueba o solicita correcciones a las solicitudes de los afiliados.
        </p>
      </div>

      <SolicitudesTabla onSeleccionar={setAfiliadoSeleccionado} />

      <Sheet
        open={afiliadoSeleccionado !== null}
        onOpenChange={(open) => !open && setAfiliadoSeleccionado(null)}
      >
        <SheetContent side="right" className="w-full gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <SheetHeader className="sr-only">
            <SheetTitle>Detalle de la solicitud</SheetTitle>
          </SheetHeader>
          {afiliadoSeleccionado && (
            <SolicitudDetalle afiliadoId={afiliadoSeleccionado} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}