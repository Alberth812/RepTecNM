// components/admin/solicitudes/acciones-solicitud.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageSquareWarning, XCircle } from "lucide-react";
import { DecisionDialog } from "./decision-dialog";
import type { RevisionDecision } from "@/lib/api/solicitudes";

export function AccionesSolicitud({ solicitudId }: { solicitudId: string }) {
 const [accion, setAccion] = useState<RevisionDecision | null>(null);

 return (
 <>
 <div className="flex flex-col gap-2 border-t bg-background p-4 sm:flex-row sm:justify-end">
 <Button
 variant="outline"
 className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
 onClick={() => setAccion("RECHAZADO")}
 >
 <XCircle className="h-4 w-4" />
 Rechazar
 </Button>
 <Button variant="outline" onClick={() => setAccion("REQUIERE_CORRECCION")}>
 <MessageSquareWarning className="h-4 w-4" />
 Requerir correcciones
 </Button>
 <Button onClick={() => setAccion("APROBADO")}>
 <CheckCircle2 className="h-4 w-4" />
 Aprobar afiliado
 </Button>
 </div>

 {accion && (
 <DecisionDialog
 solicitudId={solicitudId}
 accion={accion}
 onClose={() => setAccion(null)}
 />
 )}
 </>
 );
}