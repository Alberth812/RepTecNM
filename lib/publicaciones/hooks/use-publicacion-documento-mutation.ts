import { useMutation } from "@tanstack/react-query";

import { fetchPublicacionDocumento } from "@/lib/api/publicaciones-client-otro";

/**
 * Solicita bajo demanda la URL firmada del PDF de una publicación. Debe
 * dispararse únicamente ante un click explícito (nunca al montar la vista de
 * detalle). `isPending` permite deshabilitar el botón y evitar solicitudes
 * simultáneas mientras se resuelve.
 */
export function usePublicacionDocumentoMutation() {
 return useMutation({
 mutationFn: (publicacionId: string) =>
 fetchPublicacionDocumento(publicacionId),
 });
}
