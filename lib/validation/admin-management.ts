// lib/validation/admin-management.ts
//
// Schemas nuevos para el listado y para activar/desactivar administradores.
// Puedes mover este contenido a tu lib/validation/schemas.ts existente si
// prefieres tener todo en un solo archivo; aquí se deja aparte para no
// tocar el archivo que ya tienes.

import { z } from "zod";
import { ADMIN_SUBTYPES } from "@/lib/constants";

/**
 * Query params de GET /api/admin/list.
 *
 * - search: coincidencia parcial (ILIKE) sobre nombreCompleto y email.
 * - subtype / isActive: filtros opcionales e independientes.
 * - sortBy / sortOrder: whitelist explícita (no se aceptan columnas
 *   arbitrarias del query string).
 * - page / pageSize: paginación.
 */
export const adminListQuerySchema = z.object({
  search: z.string().trim().min(1).max(200).optional(),
  subtype: z
    .enum([ADMIN_SUBTYPES.GENERAL, ADMIN_SUBTYPES.CONTENIDO])
    .optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  sortBy: z.enum(["nombreCompleto", "email"]).default("nombreCompleto"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(50).default(25),
});

export type AdminListQuery = z.infer<typeof adminListQuerySchema>;

/**
 * Body de POST /api/admin/activate y POST /api/admin/deactivate.
 *
 * Únicamente se recibe el userId del administrador objetivo. `isRoot`
 * nunca se acepta desde el cliente en ningún endpoint.
 */
export const toggleAdminStatusSchema = z.object({
  userId: z.string().trim().min(1, "userId es requerido"),
});

export type ToggleAdminStatusInput = z.infer<typeof toggleAdminStatusSchema>;
