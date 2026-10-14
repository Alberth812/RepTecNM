// Ubicación sugerida: @/lib/instituciones/hooks/use-instituciones.ts

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
 ApiRequestError,
 createInstitucionRequest,
 deleteInstitucionRequest,
 fetchInstituciones,
 type ListInstitucionesParams,
 updateInstitucionRequest,
} from "@/lib/api/instituciones-client";
import type {
 CreateInstitucionInput,
 UpdateInstitucionInput,
} from "@/lib/validation/instituciones";

export const institucionesKeys = {
 all: ["instituciones"] as const,
 list: (params: ListInstitucionesParams) =>
 [...institucionesKeys.all, "list", params] as const,
};

export function useInstitucionesQuery(params: ListInstitucionesParams) {
 return useQuery({
 queryKey: institucionesKeys.list(params),
 queryFn: () => fetchInstituciones(params),
 // Evita el parpadeo de loading al cambiar de página/filtro:
 // mientras llega la nueva data se sigue mostrando la anterior.
 placeholderData: (previousData) => previousData,
 });
}

export function useCreateInstitucionMutation() {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: (input: CreateInstitucionInput) =>
 createInstitucionRequest(input),
 onSuccess: () => {
 toast.success("Institución creada correctamente.");
 queryClient.invalidateQueries({ queryKey: institucionesKeys.all });
 },
 onError: (error: unknown) => {
 toast.error(
 error instanceof ApiRequestError
 ? error.message
 : "No se pudo crear la institución.",
 );
 },
 });
}

export function useUpdateInstitucionMutation() {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: ({
 id,
 input,
 }: {
 id: string;
 input: UpdateInstitucionInput;
 }) => updateInstitucionRequest(id, input),
 onSuccess: () => {
 toast.success("Institución actualizada correctamente.");
 queryClient.invalidateQueries({ queryKey: institucionesKeys.all });
 },
 onError: (error: unknown) => {
 toast.error(
 error instanceof ApiRequestError
 ? error.message
 : "No se pudo actualizar la institución.",
 );
 },
 });
}

export function useDeleteInstitucionMutation() {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: (id: string) => deleteInstitucionRequest(id),
 onSuccess: () => {
 toast.success("Institución eliminada correctamente.");
 queryClient.invalidateQueries({ queryKey: institucionesKeys.all });
 },
 // El manejo de error (en particular el 409) se deja al componente que
 // llama a `mutate`, porque necesita marcar esa institución como
 // no eliminable en la UI, no solo mostrar un toast.
 });
}
