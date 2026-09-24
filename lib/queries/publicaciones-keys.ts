// lib/queries/publicaciones-keys.ts
import type { ListarMisPublicacionesParams } from "@/lib/api/publicaciones-client";

/**
 * Factoría de query keys para "Mis publicaciones". Centralizarla evita
 * strings mágicos repetidos entre el hook de listado y las invalidaciones
 * que se disparan tras eliminar.
 */
export const publicacionesKeys = {
  all: ["afiliado", "publicaciones"] as const,
  lists: () => [...publicacionesKeys.all, "list"] as const,
  list: (params: ListarMisPublicacionesParams) =>
    [...publicacionesKeys.lists(), params] as const,
};
