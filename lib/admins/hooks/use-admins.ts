// hooks/use-admins.ts

"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { z } from "zod";
import type { createAdminSchema } from "@/lib/validation/schemas";
import {
  activateAdmin,
  AdminApiError,
  createAdmin,
  deactivateAdmin,
  fetchAdmins,
} from "../admins";
import type { AdminListParams } from "../types";

export const adminsQueryKeys = {
  all: ["admins"] as const,
  list: (params: AdminListParams) =>
    [...adminsQueryKeys.all, "list", params] as const,
};

export function useAdminsQuery(params: AdminListParams) {
  return useQuery({
    queryKey: adminsQueryKeys.list(params),
    queryFn: () => fetchAdmins(params),
    placeholderData: keepPreviousData,
  });
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof AdminApiError ? error.message : fallback;
}

export function useCreateAdminMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: z.infer<typeof createAdminSchema>) =>
      createAdmin(input),
    onSuccess: () => {
      toast.success("Administrador creado correctamente.");
      void queryClient.invalidateQueries({ queryKey: adminsQueryKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo crear el administrador."));
    },
  });
}

export function useToggleAdminStatusMutation(
  action: "activate" | "deactivate",
) {
  const queryClient = useQueryClient();
  const mutationFn = action === "activate" ? activateAdmin : deactivateAdmin;

  return useMutation({
    mutationFn: (userId: string) => mutationFn(userId),
    onSuccess: () => {
      toast.success(
        action === "activate"
          ? "Administrador activado correctamente."
          : "Administrador desactivado correctamente.",
      );
      void queryClient.invalidateQueries({ queryKey: adminsQueryKeys.all });
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(
          error,
          "No se pudo actualizar el estado del administrador.",
        ),
      );
    },
  });
}
