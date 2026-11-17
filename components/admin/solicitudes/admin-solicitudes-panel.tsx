// components/admin/solicitudes/admin-solicitudes-panel.tsx
"use client";

import { useState } from "react";
import {
 Sheet,
 SheetContent,
 SheetHeader,
 SheetTitle,
} from "@/components/ui/sheet";
import { SolicitudesTabla } from "./solicitudes-tabla";
import { SolicitudDetalle } from "./solicitud-detalle";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

export function AdminSolicitudesPanel() {
 const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState<
 string | null
 >(null);

 return (
 <>
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight">
 Solicitudes de afiliación
 </h1>
 <p className="text-muted-foreground">
 Revisa, aprueba o solicita correcciones a las solicitudes de los
 afiliados.
 </p>
 </div>

 <SolicitudesTabla onSeleccionar={setAfiliadoSeleccionado} />

 {/* <Sheet
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
 </Sheet> */}

 <Dialog
 open={afiliadoSeleccionado !== null}
 onOpenChange={(open) => !open && setAfiliadoSeleccionado(null)}
 >
 <DialogContent
 className="
 w-[90vw]!
 max-w-[90vw]!
 h-[90vh]!
 max-h-[90vh]!
 flex
 flex-col
 gap-0
 overflow-hidden
 p-0
 "
 >
 <DialogHeader className="sr-only">
 <DialogTitle>Detalle de la solicitud</DialogTitle>
 </DialogHeader>

 {afiliadoSeleccionado && (
 <div className="min-h-0 flex-1 overflow-y-auto p-6">
 <SolicitudDetalle afiliadoId={afiliadoSeleccionado} />
 </div>
 )}
 </DialogContent>
 </Dialog>
 </div>
 <p>Regresar a <Link href={"/inicio"}>inicio</Link></p>
 </>
 );
}
