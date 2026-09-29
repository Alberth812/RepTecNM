import type { UseQueryResult } from "@tanstack/react-query";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type {
  BuscarPublicacionesQuery,
  BusquedaPublicacionesResponse,
} from "@/lib/validation/publicaciones-busqueda";
import { fetchPublicaciones } from "@/lib/api/publicaciones-client-otro";
import { shouldRetryApiQuery } from "@/lib/api/query-retry";

export const publicacionesQueryKeys = {
  all: ["publicaciones"] as const,
  lista: (query: BuscarPublicacionesQuery) =>
    [...publicacionesQueryKeys.all, "lista", query] as const,
};

/**
 * Búsqueda paginada de publicaciones. Usa `placeholderData: keepPreviousData`
 * para mantener visibles los resultados anteriores mientras se resuelve un
 * cambio de página o de filtros, evitando parpadeos de layout.
 */
export function usePublicacionesQuery(
  query: BuscarPublicacionesQuery,
): UseQueryResult<BusquedaPublicacionesResponse, Error> {
  return useQuery<BusquedaPublicacionesResponse, Error>({
    queryKey: publicacionesQueryKeys.lista(query),
    queryFn: ({ signal }) => fetchPublicaciones(query, signal),
    placeholderData: keepPreviousData,
    retry: shouldRetryApiQuery,
  });
}
