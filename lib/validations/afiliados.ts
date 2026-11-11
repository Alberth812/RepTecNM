// @/lib/validations/afiliados.ts
import { z } from "zod";
import { ESTADOS_MEXICO } from "@/lib/constants/mexico-estados";

/**
 * Los únicos estados de membresía que puede ver/filtrar este listado
 * administrativo. "NO_INICIADA" (y cualquier otro valor del enum de Drizzle
 * que exista a futuro) queda deliberadamente fuera.
 */
export const MEMBERSHIP_STATUS_FILTRABLE = [
  "ACTIVO",
  "INACTIVO",
  "SUSPENDIDO",
] as const;
export type MembershipStatusFiltrable =
  (typeof MEMBERSHIP_STATUS_FILTRABLE)[number];

export const SORT_BY_VALUES = ["nombres", "apellidos", "folio"] as const;
export type SortByAfiliados = (typeof SORT_BY_VALUES)[number];

export const SORT_ORDER_VALUES = ["asc", "desc"] as const;
export type SortOrderAfiliados = (typeof SORT_ORDER_VALUES)[number];

export const listadoAfiliadosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().min(1).max(200).optional(),
  estadoResidencia: z.enum(ESTADOS_MEXICO).optional(),
  ciudadResidencia: z.string().trim().min(3).max(50).optional(),
  membershipStatus: z.enum(MEMBERSHIP_STATUS_FILTRABLE).optional(),
  sortBy: z.enum(SORT_BY_VALUES).default("nombres"),
  sortOrder: z.enum(SORT_ORDER_VALUES).default("asc"),
});
export type ListadoAfiliadosQuery = z.infer<typeof listadoAfiliadosQuerySchema>;

export const suspenderAfiliadoBodySchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(10, "El motivo debe tener al menos 10 caracteres.")
    .max(500, "El motivo no puede exceder 500 caracteres."),
});
export type SuspenderAfiliadoBody = z.infer<typeof suspenderAfiliadoBodySchema>;

export const userIdParamSchema = z.object({
  userId: z
    .string()
    .trim()
    .min(1, "El identificador del afiliado es requerido."),
});
