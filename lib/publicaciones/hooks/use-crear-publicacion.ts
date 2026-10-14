// lib/publicaciones/hooks/use-crear-publicacion.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { crearPublicacionRequest } from "@/lib/publicaciones/api/publicaciones-client";

/**
 * Ajusta esta query key al patrón que ya uses para listar
 * "Mis publicaciones" (RF-DOC-008), para que la lista se refresque
 * automáticamente tras crear una publicación nueva.
 */
export const PUBLICACIONES_MIAS_QUERY_KEY = ["publicaciones", "mias"] as const;

export function useCrearPublicacion() {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: (formData: FormData) => crearPublicacionRequest(formData),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: PUBLICACIONES_MIAS_QUERY_KEY });
 },
 });
}
