// @/hooks/use-afiliados.ts
"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchAfiliadoDetalle,
  fetchAfiliados,
  quitarSuspensionAfiliado,
  suspenderAfiliado,
  type ListadoAfiliadosParams,
} from "@/lib/api/client/afiliados";

export const afiliadosKeys = {
  all: ["afiliados"] as const,
  lists: () => [...afiliadosKeys.all, "list"] as const,
  list: (params: ListadoAfiliadosParams) =>
    [...afiliadosKeys.lists(), params] as const,
  details: () => [...afiliadosKeys.all, "detail"] as const,
  detail: (userId: string) => [...afiliadosKeys.details(), userId] as const,
};

export function useAfiliadosQuery(params: ListadoAfiliadosParams) {
  return useQuery({
    queryKey: afiliadosKeys.list(params),
    queryFn: () => fetchAfiliados(params),
    placeholderData: keepPreviousData,
  });
}

export function useAfiliadoDetalleQuery(userId: string) {
  return useQuery({
    queryKey: afiliadosKeys.detail(userId),
    queryFn: () => fetchAfiliadoDetalle(userId),
    enabled: Boolean(userId),
  });
}

export function useSuspenderAfiliadoMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (motivo: string) => suspenderAfiliado(userId, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: afiliadosKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: afiliadosKeys.lists() });
    },
  });
}

export function useQuitarSuspensionAfiliadoMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => quitarSuspensionAfiliado(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: afiliadosKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: afiliadosKeys.lists() });
    },
  });
}
