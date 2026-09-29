// lib/publicaciones/hooks/use-documento-url.ts
"use client";

import { useMutation } from "@tanstack/react-query";

import { obtenerDocumentoUrlRequest } from "@/lib/publicaciones/api/publicaciones-client";

/**
 * Se modela como mutación (no como query) a propósito: la URL firmada
 * expira y no tiene sentido cachearla ni precargarla; se pide justo cuando
 * el usuario hace clic en "Abrir PDF".
 */
export function useDocumentoUrl(id: string) {
  return useMutation({
    mutationFn: () => obtenerDocumentoUrlRequest(id),
  });
}
