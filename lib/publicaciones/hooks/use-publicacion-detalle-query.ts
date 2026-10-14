import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { fetchPublicacionDetalle } from "@/lib/api/publicaciones-client-otro";
import { shouldRetryApiQuery } from "@/lib/api/query-retry";
import type { PublicacionDetalleResponse } from "@/lib/validation/publicaciones";

//

export const publicacionDetalleQueryKey = (id: string) =>
 ["publicaciones", "detalle", id] as const;

/** Carga el detalle completo de una publicación (metadatos, sin URL firmada del PDF). */
export function usePublicacionDetalleQuery(
 id: string,
): UseQueryResult<PublicacionDetalleResponse, unknown> {
 return useQuery({
 queryKey: publicacionDetalleQueryKey(id),
 queryFn: ({ signal }) => fetchPublicacionDetalle(id, signal),
 enabled: id.length > 0,
 retry: shouldRetryApiQuery,
 });
}
