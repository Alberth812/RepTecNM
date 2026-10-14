// components/admin/solicitudes/estado-badge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RevisionDecision, SolicitudEstado } from "@/lib/api/solicitudes";

const ESTADO_CONFIG: Record<
 SolicitudEstado,
 { label: string; className: string }
> = {
 REQUIERE_ATENCION: {
 label: "Requiere atención",
 className:
 "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300",
 },
 EN_CORRECCION: {
 label: "En corrección",
 className:
 "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
 },
 RECHAZADA: {
 label: "Rechazada",
 className:
 "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-950 dark:text-red-300",
 },
 APROBADA: {
 label: "Aprobada",
 className:
 "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
 },
};

export function EstadoBadge({ estado }: { estado: SolicitudEstado }) {
 const config = ESTADO_CONFIG[estado];
 return (
 <Badge variant="secondary" className={cn("font-medium", config.className)}>
 {config.label}
 </Badge>
 );
}

const DECISION_CONFIG: Record<
 RevisionDecision,
 { label: string; className: string }
> = {
 APROBADO: {
 label: "Aprobado",
 className:
 "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
 },
 REQUIERE_CORRECCION: {
 label: "Se requirieron correcciones",
 className:
 "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
 },
 RECHAZADO: {
 label: "Rechazado",
 className:
 "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-950 dark:text-red-300",
 },
};

export function RevisionDecisionBadge({
 decision,
}: {
 decision: RevisionDecision;
}) {
 const config = DECISION_CONFIG[decision];
 return (
 <Badge variant="secondary" className={cn("font-medium", config.className)}>
 {config.label}
 </Badge>
 );
}

export function MembershipStatusBadge({ status }: { status: string }) {
 const className =
 status === "ACTIVO"
 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
 : ["RECHAZADO", "SUSPENDIDO", "BAJA", "INACTIVO"].includes(status)
 ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
 : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";

 return (
 <Badge variant="secondary" className={cn("font-normal", className)}>
 {status.replaceAll("_", " ")}
 </Badge>
 );
}