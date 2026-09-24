// lib/api/publicaciones-client.ts
import type { MisPublicacionesPaginatedResponse } from "@/lib/validation/publicaciones";

import { parseApiError } from "@/lib/api/errors";

export interface ListarMisPublicacionesParams {
  q?: string;
  page: number;
  pageSize: number;
}

/**
 * GET /api/afiliado/publicaciones
 *
 * NOTA: se asume que `jsonResponse()` en el backend devuelve el objeto de
 * resultado directamente como cuerpo JSON (sin envolver en `{ data: ... }`).
 * Si tu implementación de `jsonResponse` sí envuelve la respuesta, ajusta
 * el `return` de esta función en consecuencia.
 */
export async function fetchMisPublicaciones(
  params: ListarMisPublicacionesParams,
  signal?: AbortSignal,
): Promise<MisPublicacionesPaginatedResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("pageSize", String(params.pageSize));

  if (params.q) {
    searchParams.set("q", params.q);
  }

  const response = await fetch(
    `/api/afiliado/publicaciones?${searchParams.toString()}`,
    {
      method: "GET",
      signal,
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as MisPublicacionesPaginatedResponse;
}

export interface EliminarPublicacionResponse {
  id: string;
  eliminada: boolean;
}

/** DELETE /api/publicaciones/:id */
export async function deletePublicacion(
  id: string,
): Promise<EliminarPublicacionResponse> {
  const response = await fetch(`/api/publicaciones/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as EliminarPublicacionResponse;
}
