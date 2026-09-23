// lib/publicaciones/hooks/use-publicacion.ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { obtenerPublicacionRequest } from "@/lib/publicaciones/api/publicaciones-client";

export function publicacionQueryKey(id: string) {
  return ["publicaciones", "detalle", id] as const;
}

/**
 * GET /api/publicaciones/:id — para precargar el formulario de edición.
 * `enabled: Boolean(id)` evita disparar la consulta si el id todavía no
 * está disponible (por ejemplo, mientras se resuelve un parámetro de ruta).
 */
export function usePublicacion(id: string | undefined) {
  return useQuery({
    queryKey: publicacionQueryKey(id ?? ""),
    queryFn: ({ signal }) => obtenerPublicacionRequest(id as string, signal),
    enabled: Boolean(id),
  });
}
