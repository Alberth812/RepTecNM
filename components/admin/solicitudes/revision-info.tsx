// components/admin/solicitudes/revision-info.tsx
import { AlertTriangle } from "lucide-react";
import { RevisionDecisionBadge } from "./estado-badge";
import { formatFecha } from "@/lib/format";
import type { SolicitudVersion } from "@/lib/api/solicitudes";

export function RevisionInfo({ version }: { version: SolicitudVersion }) {
 if (version.revisionDecision === null) {
 return (
 <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
 <AlertTriangle className="h-4 w-4 shrink-0" />
 Esta versión aún no ha sido revisada por un administrador.
 </div>
 );
 }

 return (
 <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
 <div className="flex flex-wrap items-center justify-between gap-2">
 <RevisionDecisionBadge decision={version.revisionDecision} />
 <span className="text-xs text-muted-foreground">
 {version.revisadoEn && formatFecha(version.revisadoEn)}
 {version.revisadoPor && ` · ${version.revisadoPor.nombreCompleto}`}
 </span>
 </div>
 {version.revisionObservaciones && (
 <p className="text-sm">{version.revisionObservaciones}</p>
 )}
 </div>
 );
}