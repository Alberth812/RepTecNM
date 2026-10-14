// components/afiliado/publicaciones/publicaciones-afiliado-list.tsx
"use client";

import Link from "next/link";
import { AlertTriangle, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { PublicacionCard } from "@/components/afiliado/publicaciones/publicacion-card";
import { PublicacionCardSkeleton } from "@/components/afiliado/publicaciones/publicacion-card-skeleton";
import { PublicacionesEmptyState } from "@/components/afiliado/publicaciones/publicaciones-empty-state";
import { PublicacionesPagination } from "@/components/afiliado/publicaciones/publicaciones-pagination";
import { PublicacionesSearchBar } from "@/components/afiliado/publicaciones/publicaciones-search-bar";
import { useEliminarPublicacion } from "@/lib/publicaciones/hooks/use-eliminar-publicacion";
import { useMisPublicaciones } from "@/lib/publicaciones/hooks/use-mis-publicaciones";
import { ApiRequestError } from "@/lib/api/errors";

const PAGE_SIZE = 20;
const CANTIDAD_SKELETONS = 6;

/**
 * Traduce el `ApiRequestError` del listado a un mensaje apto para mostrar.
 * Se basa en `code`/`status`, nunca en el texto crudo salvo para los casos
 * donde el propio mensaje del servidor ya es apto para el usuario final
 * (errores de validación de parámetros).
 */
function obtenerMensajeErrorListado(error: unknown): string {
 if (error instanceof ApiRequestError) {
 switch (error.code) {
 case "UNAUTHORIZED":
 return "Tu sesión expiró. Vuelve a iniciar sesión para continuar.";
 case "FORBIDDEN":
 return "No tienes permisos para ver estas publicaciones.";
 case "BAD_REQUEST":
 case "VALIDATION_ERROR":
 return error.message;
 default:
 return "Ocurrió un error inesperado al cargar tus publicaciones.";
 }
 }
 return "Ocurrió un error inesperado al cargar tus publicaciones.";
}

function obtenerMensajeErrorEliminar(error: unknown): string {
 if (error instanceof ApiRequestError) {
 switch (error.code) {
 case "UNAUTHORIZED":
 return "Tu sesión expiró. Vuelve a iniciar sesión para continuar.";
 case "FORBIDDEN":
 return "No tienes permisos para eliminar esta publicación.";
 case "CONFLICT":
 return "No se pudo eliminar por un conflicto con datos relacionados.";
 case "CONSTRAINT_VIOLATION":
 return "No se pudo eliminar por una restricción del sistema.";
 default:
 return "No se pudo eliminar la publicación. Inténtalo de nuevo.";
 }
 }
 return "No se pudo eliminar la publicación. Inténtalo de nuevo.";
}

export function PublicacionesAfiliadoList() {
 const [page, setPage] = useState(1);
 const [busquedaActiva, setBusquedaActiva] = useState("");
 const [eliminandoId, setEliminandoId] = useState<string | null>(null);

 const { data, isLoading, isFetching, isError, error, isPlaceholderData } =
 useMisPublicaciones({
 q: busquedaActiva || undefined,
 page,
 pageSize: PAGE_SIZE,
 });

 const eliminarMutation = useEliminarPublicacion();

 const handleBuscar = useCallback((termino: string) => {
 setBusquedaActiva(termino);
 setPage(1);
 }, []);

 const handleLimpiar = useCallback(() => {
 setBusquedaActiva("");
 setPage(1);
 }, []);

 const handleEliminar = useCallback(
 (id: string) => {
 setEliminandoId(id);
 eliminarMutation.mutate(id, {
 onSuccess: () => {
 toast.success("Publicación eliminada correctamente.");
 },
 onError: (mutationError) => {
 toast.error(obtenerMensajeErrorEliminar(mutationError));
 },
 onSettled: () => {
 setEliminandoId(null);
 },
 });
 },
 [eliminarMutation],
 );

 const hayFiltroActivo = busquedaActiva.trim().length > 0;

 if (isError) {
 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between gap-4">
 <PublicacionesSearchBar
 valorActual={busquedaActiva}
 onBuscar={handleBuscar}
 onLimpiar={handleLimpiar}
 />

 <Link
 href="/afiliado/publicaciones/nueva/"
 className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
 >
 <Plus className="h-4 w-4" />
 Crear Nueva
 </Link>
 </div>

 <div className="flex flex-col items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
 <AlertTriangle className="h-8 w-8 text-destructive" />
 <p className="font-medium text-destructive">
 No se pudieron cargar tus publicaciones
 </p>
 <p className="text-sm text-muted-foreground">
 {obtenerMensajeErrorListado(error)}
 </p>
 </div>
 </div>
 );
 }

 const items = data?.items ?? [];

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between gap-4">
 <div className="flex-1">
 <PublicacionesSearchBar
 valorActual={busquedaActiva}
 onBuscar={handleBuscar}
 onLimpiar={handleLimpiar}
 deshabilitado={isFetching}
 />
 </div>

 <Link
 href="/afiliado/publicaciones/nueva/"
 className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
 >
 <Plus className="h-4 w-4" />
 Crear Nueva
 </Link>
 </div>

 {isLoading ? (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {Array.from({ length: CANTIDAD_SKELETONS }).map((_, index) => (
 // eslint-disable-next-line react/no-array-index-key -- lista estática de placeholders
 <PublicacionCardSkeleton key={index} />
 ))}
 </div>
 ) : items.length === 0 ? (
 <PublicacionesEmptyState
 hayFiltro={hayFiltroActivo}
 onLimpiarFiltros={handleLimpiar}
 />
 ) : (
 <div
 className="grid gap-4 transition-opacity duration-150 sm:grid-cols-2 lg:grid-cols-3"
 style={{ opacity: isFetching && isPlaceholderData ? 0.6 : 1 }}
 >
 {items.map((publicacion) => (
 <PublicacionCard
 key={publicacion.id}
 publicacion={publicacion}
 onEliminar={handleEliminar}
 eliminando={eliminandoId === publicacion.id}
 />
 ))}
 </div>
 )}

 {data && (
 <PublicacionesPagination
 page={data.page}
 totalPages={data.totalPages}
 onPageChange={setPage}
 disabled={isFetching}
 />
 )}
 </div>
 );
}
