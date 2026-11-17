"use client";

import { useState } from "react";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { EstadoBadge } from "./estado-badge";
import { useSolicitudesList, type SolicitudEstado } from "@/lib/api/solicitudes";
import { formatFecha, formatNombreCompleto } from "@/lib/format";

const FILTROS: { value: SolicitudEstado | "TODAS"; label: string }[] = [
 { value: "REQUIERE_ATENCION", label: "Requiere atención" },
 { value: "EN_CORRECCION", label: "En corrección" },
 { value: "RECHAZADA", label: "Rechazadas" },
 { value: "APROBADA", label: "Aprobadas" },
 { value: "TODAS", label: "Todas" },
];

const LIMIT = 10;

export function SolicitudesTabla({
 onSeleccionar,
}: {
 onSeleccionar: (afiliadoId: string) => void;
}) {
 const [filtro, setFiltro] = useState<SolicitudEstado | "TODAS">(
 "REQUIERE_ATENCION",
 );
 const [offset, setOffset] = useState(0);

 const { data, isLoading, isPlaceholderData } = useSolicitudesList({
 estado: filtro === "TODAS" ? undefined : filtro,
 limit: LIMIT,
 offset,
 });

 function cambiarFiltro(value: string) {
 setFiltro(value as SolicitudEstado | "TODAS");
 setOffset(0);
 }

 const total = data?.total ?? 0;
 const desde = total === 0 ? 0 : offset + 1;
 const hasta = Math.min(offset + LIMIT, total);

 return (
 <div className="space-y-4">
 <Tabs value={filtro} onValueChange={cambiarFiltro}>
 <TabsList>
 {FILTROS.map((f) => (
 <TabsTrigger key={f.value} value={f.value}>
 {f.label}
 </TabsTrigger>
 ))}
 </TabsList>
 </Tabs>

 <div className="rounded-lg border">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Afiliado</TableHead>
 <TableHead>Correo</TableHead>
 <TableHead>Versión</TableHead>
 <TableHead>Enviado</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead className="text-right">Acción</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {isLoading &&
 Array.from({ length: 5 }).map((_, i) => (
 <TableRow key={i}>
 <TableCell colSpan={6}>
 <Skeleton className="h-6 w-full" />
 </TableCell>
 </TableRow>
 ))}

 {!isLoading && data?.items.length === 0 && (
 <TableRow>
 <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
 <div className="flex flex-col items-center gap-2">
 <Inbox className="h-8 w-8" />
 <span>No hay solicitudes en esta categoría.</span>
 </div>
 </TableCell>
 </TableRow>
 )}

 {data?.items.map((item) => (
 <TableRow
 key={item.solicitudId}
 className="cursor-pointer"
 onClick={() => onSeleccionar(item.afiliadoId)}
 >
 <TableCell className="font-medium">
 {formatNombreCompleto(item)}
 </TableCell>
 <TableCell className="text-muted-foreground">
 {item.correoElectronico ?? "—"}
 </TableCell>
 <TableCell>v{item.version}</TableCell>
 <TableCell className="text-muted-foreground">
 {formatFecha(item.createdAt)}
 </TableCell>
 <TableCell>
 <EstadoBadge estado={item.estado} />
 </TableCell>
 <TableCell className="text-right">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onSeleccionar(item.afiliadoId);
 }}
 >
 Ver detalle
 </Button>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>

 <div className="flex items-center justify-between text-sm text-muted-foreground">
 <span>
 {total > 0 ? `Mostrando ${desde}–${hasta} de ${total}` : "Sin resultados"}
 </span>
 <div className="flex gap-2">
 <Button
 variant="outline"
 size="sm"
 disabled={offset === 0}
 onClick={() => setOffset((o) => Math.max(0, o - LIMIT))}
 >
 <ChevronLeft className="h-4 w-4" />
 Anterior
 </Button>
 <Button
 variant="outline"
 size="sm"
 disabled={isPlaceholderData || hasta >= total}
 onClick={() => setOffset((o) => o + LIMIT)}
 >
 Siguiente
 <ChevronRight className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </div>
 );
}