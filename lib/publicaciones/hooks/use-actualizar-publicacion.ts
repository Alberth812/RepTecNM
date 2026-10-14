// lib/publicaciones/hooks/use-actualizar-publicacion.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { actualizarPublicacionRequest } from "@/lib/publicaciones/api/publicaciones-client";
import { publicacionQueryKey } from "@/lib/publicaciones/hooks/use-publicacion";
import { PUBLICACIONES_MIAS_QUERY_KEY } from "@/lib/publicaciones/hooks/use-crear-publicacion";
import type { UpdatePublicacionInput } from "@/lib/validation/publicaciones";

export function useActualizarPublicacion(id: string) {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: (metadata: UpdatePublicacionInput) =>
 actualizarPublicacionRequest(id, metadata),
 onSuccess: (publicacion) => {
 // Refresca tanto el detalle como cualquier listado que lo incluya.
 queryClient.setQueryData(publicacionQueryKey(id), publicacion);
 queryClient.invalidateQueries({ queryKey: PUBLICACIONES_MIAS_QUERY_KEY });
 },
 });
}
