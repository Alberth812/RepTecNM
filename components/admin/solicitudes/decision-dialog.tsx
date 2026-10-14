// components/admin/solicitudes/decision-dialog.tsx
"use client";

import { useState } from "react";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useResolverSolicitud, type RevisionDecision } from "@/lib/api/solicitudes";

const CONFIG: Record<
 RevisionDecision,
 {
 titulo: string;
 descripcion: string;
 boton: string;
 variant: "default" | "destructive";
 }
> = {
 APROBADO: {
 titulo: "Aprobar afiliado",
 descripcion:
 "El afiliado pasará a estado ACTIVO y estos datos quedarán como su información definitiva.",
 boton: "Aprobar",
 variant: "default",
 },
 REQUIERE_CORRECCION: {
 titulo: "Requerir correcciones",
 descripcion:
 "El afiliado podrá volver a enviar su solicitud. Indica qué debe corregir.",
 boton: "Solicitar correcciones",
 variant: "default",
 },
 RECHAZADO: {
 titulo: "Rechazar afiliado",
 descripcion: "El afiliado ya no podrá enviar ni modificar su solicitud.",
 boton: "Rechazar",
 variant: "destructive",
 },
};

export function DecisionDialog({
 solicitudId,
 accion,
 onClose,
}: {
 solicitudId: string;
 accion: RevisionDecision;
 onClose: () => void;
}) {
 const [observaciones, setObservaciones] = useState("");
 const resolver = useResolverSolicitud();

 const config = CONFIG[accion];
 const observacionesRequeridas = accion === "REQUIERE_CORRECCION";
 const puedeEnviar = !observacionesRequeridas || observaciones.trim().length > 0;

 function handleSubmit() {
 resolver.mutate(
 {
 solicitudId,
 decision: accion,
 observaciones: observaciones.trim() || null,
 },
 { onSuccess: onClose },
 );
 }

 return (
 <Dialog open onOpenChange={(open) => !open && onClose()}>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>{config.titulo}</DialogTitle>
 <DialogDescription>{config.descripcion}</DialogDescription>
 </DialogHeader>

 <div className="space-y-2">
 <Label htmlFor="observaciones">
 Observaciones{" "}
 {observacionesRequeridas ? (
 <span className="text-destructive">*</span>
 ) : (
 <span className="text-muted-foreground">(opcional)</span>
 )}
 </Label>
 <Textarea
 id="observaciones"
 value={observaciones}
 onChange={(e) => setObservaciones(e.target.value)}
 placeholder={
 observacionesRequeridas
 ? "Explica qué debe corregir el afiliado…"
 : "Notas internas (opcional)…"
 }
 rows={4}
 />
 </div>

 {resolver.isError && (
 <p className="text-sm text-destructive">
 {resolver.error instanceof Error
 ? resolver.error.message
 : "Ocurrió un error."}
 </p>
 )}

 <DialogFooter>
 <Button variant="outline" onClick={onClose} disabled={resolver.isPending}>
 Cancelar
 </Button>
 <Button
 variant={config.variant}
 onClick={handleSubmit}
 disabled={!puedeEnviar || resolver.isPending}
 >
 {resolver.isPending ? "Guardando…" : config.boton}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 );
}