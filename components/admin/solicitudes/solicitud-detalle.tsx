// components/admin/solicitudes/solicitud-detalle.tsx
"use client";

import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSolicitudDetalle } from "@/lib/api/solicitudes";
import { formatFecha } from "@/lib/format";
import { MembershipStatusBadge } from "./estado-badge";
import { SolicitudVersionView } from "./solicitud-version-view";
import { AccionesSolicitud } from "./acciones-solicitud";

export function SolicitudDetalle({ afiliadoId }: { afiliadoId: string }) {
 const { data, isLoading, isError, error } = useSolicitudDetalle(afiliadoId);

 if (isLoading) {
 return (
 <div className="space-y-4 p-6">
 <Skeleton className="h-8 w-2/3" />
 <Skeleton className="h-40 w-full" />
 <Skeleton className="h-40 w-full" />
 </div>
 );
 }

 if (isError || !data) {
 return (
 <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center text-muted-foreground">
 <AlertCircle className="h-8 w-8" />
 <p>
 {error instanceof Error ? error.message : "No se pudo cargar la solicitud."}
 </p>
 </div>
 );
 }

 const [actual, anterior] = data.versiones;
 const nombreCompleto = [
 actual.datos.nombres,
 actual.datos.apellido_paterno,
 actual.datos.apellido_materno,
 ]
 .filter(Boolean)
 .join(" ");

 const puedeResolver =
 actual.revisionDecision === null &&
 data.afiliado.membershipStatus === "PENDIENTE_APROBACION";

 return (
 <div className="flex h-full flex-col">
 <div className="space-y-2 border-b p-6">
 <div className="flex flex-wrap items-center gap-2">
 <h2 className="text-lg font-semibold">{nombreCompleto || "Sin nombre"}</h2>
 <MembershipStatusBadge status={data.afiliado.membershipStatus} />
 </div>
 <p className="text-sm text-muted-foreground">
 {actual.datos.correo_electronico} · Última actualización{" "}
 {formatFecha(actual.createdAt)}
 </p>
 </div>

 <div className="flex-1 overflow-y-auto p-6">
 <Tabs defaultValue="actual">
 <TabsList>
 <TabsTrigger value="actual">Actual (v{actual.version})</TabsTrigger>
 {anterior && (
 <TabsTrigger value="anterior">Anterior (v{anterior.version})</TabsTrigger>
 )}
 </TabsList>
 <TabsContent value="actual" className="mt-4">
 <SolicitudVersionView version={actual} />
 </TabsContent>
 {anterior && (
 <TabsContent value="anterior" className="mt-4">
 <SolicitudVersionView version={anterior} />
 </TabsContent>
 )}
 </Tabs>
 </div>

 {puedeResolver && <AccionesSolicitud solicitudId={actual.id} />}
 </div>
 );
}