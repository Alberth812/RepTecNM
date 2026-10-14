// Ubicación sugerida: @/lib/components/instituciones/instituciones-table.tsx

"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table";
import type {
 Institucion,
 InstitucionesListResponse,
} from "@/lib/instituciones/types";

interface InstitucionesTableProps {
 query: UseQueryResult<InstitucionesListResponse, Error>;
 hasActiveFilters: boolean;
 nonDeletableIds: Set<string>;
 onEdit: (institucion: Institucion) => void;
 onDelete: (institucion: Institucion) => void;
}

export function InstitucionesTable({
 query,
 hasActiveFilters,
 nonDeletableIds,
 onEdit,
 onDelete,
}: InstitucionesTableProps) {
 return (
 <div className="rounded-md border">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Nombre</TableHead>
 <TableHead>Estado</TableHead>
 <TableHead className="w-[140px] text-right">Acciones</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {query.isLoading && <LoadingRows />}

 {query.isError && (
 <TableRow>
 <TableCell
 colSpan={3}
 className="h-24 text-center text-sm text-destructive"
 >
 No se pudieron cargar las instituciones. Intenta nuevamente.
 </TableCell>
 </TableRow>
 )}

 {query.isSuccess && query.data.data.length === 0 && (
 <TableRow>
 <TableCell
 colSpan={3}
 className="h-24 text-center text-sm text-muted-foreground"
 >
 {hasActiveFilters
 ? "No se encontraron instituciones con los filtros aplicados."
 : "Todavía no hay instituciones registradas."}
 </TableCell>
 </TableRow>
 )}

 {query.isSuccess &&
 query.data.data.map((institucion) => (
 <TableRow key={institucion.id}>
 <TableCell className="font-medium">
 {institucion.nombre}
 </TableCell>
 <TableCell>
 <span
 className={
 institucion.estado === "ACTIVO"
 ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
 : "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
 }
 >
 {institucion.estado === "ACTIVO" ? "Activo" : "Inactivo"}
 </span>
 </TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-2">
 <Button
 variant="ghost"
 size="icon"
 aria-label="Modificar institución"
 onClick={() => onEdit(institucion)}
 >
 <Pencil className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="icon"
 aria-label="Eliminar institución"
 disabled={nonDeletableIds.has(institucion.id)}
 title={
 nonDeletableIds.has(institucion.id)
 ? "Esta institución tiene registros asociados y no puede eliminarse."
 : undefined
 }
 onClick={() => onDelete(institucion)}
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 );
}

function LoadingRows() {
 return (
 <>
 {Array.from({ length: 5 }).map((_, index) => (
 <TableRow key={index}>
 <TableCell>
 <div className="h-4 w-40 animate-pulse rounded bg-muted" />
 </TableCell>
 <TableCell>
 <div className="h-4 w-16 animate-pulse rounded bg-muted" />
 </TableCell>
 <TableCell className="text-right">
 <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" />
 </TableCell>
 </TableRow>
 ))}
 </>
 );
}
