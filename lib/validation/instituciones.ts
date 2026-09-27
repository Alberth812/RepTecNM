// Ubicación sugerida: @/lib/validation/instituciones.ts

import { z } from "zod";

import { institucionEstadoEnum } from "@/lib/db/schema/instituciones";

// Reutilizamos los valores del enum de Drizzle como fuente de verdad,
// para no duplicar la lista de estados en dos lugares distintos.
const estadoValues = institucionEstadoEnum.enumValues;

export const institucionEstadoSchema = z.enum(estadoValues);

const nombreSchema = z
  .string()
  .trim()
  .min(10, "El nombre debe tener al menos 10 caracteres.")
  .max(50, "El nombre no puede superar los 50 caracteres.");

/**
 * Query params del listado (?page=&pageSize=&nombre=&estado=)
 */
export const listInstitucionesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  nombre: z.string().trim().min(1).max(50).optional(),
  estado: institucionEstadoSchema.optional(),
});

export type ListInstitucionesQuery = z.infer<
  typeof listInstitucionesQuerySchema
>;

/**
 * Body para crear una institución. Solo se acepta `nombre`;
 * `estado` y `lastChangedToInactivoAt` los decide el servidor.
 */
export const createInstitucionSchema = z.object({
  nombre: nombreSchema,
});

export type CreateInstitucionInput = z.infer<typeof createInstitucionSchema>;

/**
 * Body para modificar una institución. El cliente envía el estado deseado,
 * pero el cálculo de `lastChangedToInactivoAt` ocurre siempre en el servidor.
 */
export const updateInstitucionSchema = z.object({
  nombre: nombreSchema,
  estado: institucionEstadoSchema,
});

export type UpdateInstitucionInput = z.infer<typeof updateInstitucionSchema>;

/**
 * Validación del parámetro dinámico `id` en las rutas /api/instituciones/[id]
 */
export const institucionIdParamSchema = z.object({
  id: z.string().uuid("El identificador de la institución no es válido."),
});
