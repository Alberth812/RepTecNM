// hooks/use-mis-publicaciones.ts
"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ListarMisPublicacionesParams } from "@/lib/api/publicaciones-client";
import { fetchMisPublicaciones } from "@/lib/api/publicaciones-client";
import { publicacionesKeys } from "@/lib/queries/publicaciones-keys";

/**
 * Lista paginada de "Mis publicaciones". Usa `placeholderData: keepPreviousData`
 * para que, al cambiar de página o buscar, se siga mostrando la página anterior
 * (con opacidad reducida en la UI) en vez de un parpadeo a estado de carga.
 */
export function useMisPublicaciones(params: ListarMisPublicacionesParams) {
 return useQuery({
 queryKey: publicacionesKeys.list(params),
 queryFn: ({ signal }) => fetchMisPublicaciones(params, signal),
 placeholderData: keepPreviousData,
 });
}
