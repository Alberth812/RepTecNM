// hooks/use-eliminar-publicacion.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deletePublicacion } from "@/lib/api/publicaciones-client";
import { publicacionesKeys } from "@/lib/queries/publicaciones-keys";

/**
 * Elimina una publicación (hard delete) y, al confirmarse en el servidor,
 * invalida todas las listas de "Mis publicaciones" para que reflejen el
 * cambio sin importar en qué página/búsqueda se encuentre el usuario.
 */
export function useEliminarPublicacion() {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: (id: string) => deletePublicacion(id),
 onSuccess: () => {
 void queryClient.invalidateQueries({ queryKey: publicacionesKeys.all });
 },
 });
}
