import { AprobacionesPanel } from "@/components/admin/aprobaciones-panel";

export default function AprobacionesPage() {
 return (
 <div className="flex flex-col gap-4">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight">Bandeja de Aprobaciones</h1>
 <p className="text-sm text-muted-foreground">
 Solicitudes en estado PENDIENTE_APROBACION (RF-ADMIN-001).
 </p>
 </div>
 <AprobacionesPanel />
 </div>
 );
}