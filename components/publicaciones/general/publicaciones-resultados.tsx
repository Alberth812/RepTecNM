"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { AlertCircleIcon, FileSearchIcon, RotateCcwIcon } from "lucide-react";

import type { BusquedaPublicacionesResponse } from "@/lib/validation/publicaciones-busqueda";
import { PublicacionCard } from "@/components/publicaciones/general/publicacion-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
 Empty,
 EmptyContent,
 EmptyDescription,
 EmptyHeader,
 EmptyMedia,
 EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorDetails, getApiErrorMessage } from "@/lib/api/errors-otro";
import { cn } from "@/lib/utils";

interface PublicacionesResultadosProps {
 query: UseQueryResult<BusquedaPublicacionesResponse>;
 onLimpiarFiltros: () => void;
}

function ResultadosSkeleton() {
 return (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {Array.from({ length: 6 }).map((_, index) => (
 <div key={index} className="space-y-3 rounded-xl border p-4">
 <Skeleton className="h-5 w-20" />
 <Skeleton className="h-6 w-3/4" />
 <Skeleton className="h-4 w-full" />
 <Skeleton className="h-4 w-2/3" />
 </div>
 ))}
 </div>
 );
}

export function PublicacionesResultados({
 query,
 onLimpiarFiltros,
}: PublicacionesResultadosProps) {
 // Primera carga: sin datos previos que mostrar.
 if (query.isPending) {
 return <ResultadosSkeleton />;
 }

 // Error HTTP real: se muestra el contrato de error, no un error técnico crudo.
 if (query.isError) {
 const detalles = getApiErrorDetails(query.error);
 return (
 <Alert variant="destructive">
 <AlertCircleIcon className="size-4" />
 <AlertTitle>No se pudieron cargar las publicaciones</AlertTitle>
 <AlertDescription className="flex flex-col gap-3">
 <span>{getApiErrorMessage(query.error)}</span>
 {detalles.length > 0 && (
 <ul className="list-disc space-y-1 pl-4">
 {detalles.map((detalle, index) => (
 <li key={index}>{detalle}</li>
 ))}
 </ul>
 )}
 <Button
 variant="outline"
 size="sm"
 className="w-fit"
 onClick={() => query.refetch()}
 >
 <RotateCcwIcon className="size-4" aria-hidden="true" />
 Reintentar
 </Button>
 </AlertDescription>
 </Alert>
 );
 }

 const resultado = query.data;

 // Lista vacía: no es un error, es un estado válido con 0 resultados.
 if (resultado.items.length === 0) {
 return (
 <Empty>
 <EmptyHeader>
 <EmptyMedia variant="icon">
 <FileSearchIcon />
 </EmptyMedia>
 <EmptyTitle>No se encontraron publicaciones</EmptyTitle>
 <EmptyDescription>
 Ajusta la búsqueda o los filtros aplicados, o límpialos para ver
 todas las publicaciones disponibles.
 </EmptyDescription>
 </EmptyHeader>
 <EmptyContent>
 <Button variant="outline" onClick={onLimpiarFiltros}>
 Limpiar filtros
 </Button>
 </EmptyContent>
 </Empty>
 );
 }

 return (
 <div
 className={cn(
 "grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3",
 query.isFetching && "opacity-60",
 )}
 aria-busy={query.isFetching}
 >
 {resultado.items.map((item) => (
 <PublicacionCard key={item.id} publicacion={item} />
 ))}
 </div>
 );
}
