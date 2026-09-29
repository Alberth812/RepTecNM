// @/lib/validations/publicaciones-busqueda.ts
import { z } from "zod";

import {
  doiSchema,
  estadoPublicacionEnum,
  isbn13Schema,
  issnSchema,
  MIN_ANIO_PUBLICACION,
  singleKeywordSchema,
  tipoPublicacionEnum,
} from "@/lib/validation/publicaciones";

/* ==========================================================================
   QUERY PARAMS — GET /api/publicaciones (RF-DOC-004)
   ========================================================================== */

/** Recorta y colapsa espacios internos. */
function textoLibreSchema(max: number, etiqueta: string) {
  return z
    .string()
    .transform((value) => value.trim().replace(/\s+/g, " "))
    .pipe(
      z
        .string()
        .min(1, `${etiqueta} no puede estar vacío.`)
        .max(max, `${etiqueta} no puede exceder ${max} caracteres.`),
    );
}

/** Año de 4 dígitos entre 1950 y el año en curso (evaluado en cada request). */
const anioSchema = z
  .string()
  .regex(/^\d{4}$/, "El año debe ser un entero de 4 dígitos (ej. 2024).")
  .transform(Number)
  .pipe(
    z
      .number()
      .min(
        MIN_ANIO_PUBLICACION,
        `El año mínimo permitido es ${MIN_ANIO_PUBLICACION}.`,
      )
      .refine(
        (year) => year <= new Date().getFullYear(),
        "El año no puede ser mayor al año en curso.",
      ),
  );

export const DEFAULT_BUSQUEDA_PAGE_SIZE = 25;
export const MAX_BUSQUEDA_PAGE_SIZE = 150;

export const buscarPublicacionesQuerySchema = z
  .object({
    q: textoLibreSchema(200, "El parámetro q").optional(),

    // Filtros
    tipo: tipoPublicacionEnum.optional(),
    anio: anioSchema.optional(),
    anioDesde: anioSchema.optional(),
    anioHasta: anioSchema.optional(),
    autor: textoLibreSchema(150, "El parámetro autor").optional(),
    // Se normaliza igual que al guardar (trim, minúsculas, espacios simples).
    keyword: singleKeywordSchema.optional(),
    // Se normalizan igual que al guardar; un formato inválido produce 400.
    isbn: isbn13Schema.optional(),
    issn: issnSchema.optional(),
    doi: doiSchema.optional(),

    // Paginación
    page: z.coerce
      .number({ error: "El parámetro page debe ser un número." })
      .int("El parámetro page debe ser un número entero.")
      .min(1, "El parámetro page debe ser mayor o igual a 1.")
      .default(1),
    pageSize: z.coerce
      .number({
        error: "El parámetro pageSize debe ser un número.",
      })
      .int("El parámetro pageSize debe ser un número entero.")
      .min(1, "El parámetro pageSize debe ser mayor o igual a 1.")
      .max(
        MAX_BUSQUEDA_PAGE_SIZE,
        `El parámetro pageSize no puede exceder ${MAX_BUSQUEDA_PAGE_SIZE} elementos.`,
      )
      .default(DEFAULT_BUSQUEDA_PAGE_SIZE),
  })
  .superRefine((data, ctx) => {
    // `anio` no puede combinarse con `anioDesde` / `anioHasta`.
    if (
      data.anio !== undefined &&
      (data.anioDesde !== undefined || data.anioHasta !== undefined)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["anio"],
        message:
          "El parámetro anio no puede combinarse con anioDesde ni anioHasta.",
      });
    }

    // En un intervalo, anioDesde <= anioHasta.
    if (
      data.anioDesde !== undefined &&
      data.anioHasta !== undefined &&
      data.anioDesde > data.anioHasta
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["anioDesde"],
        message: "anioDesde no puede ser mayor que anioHasta.",
      });
    }
  });

export type BuscarPublicacionesQuery = z.infer<
  typeof buscarPublicacionesQuerySchema
>;

/* ==========================================================================
   RESPUESTA — GET /api/publicaciones
   (sin documentoArchivoId ni URLs firmadas)
   ========================================================================== */

export const publicacionBusquedaItemSchema = z.object({
  id: z.string().uuid(),
  afiliadoId: z.string(),
  titulo: z.string(),
  descripcion: z.string(),
  tipo: tipoPublicacionEnum,
  tipoOtro: z.string().nullable(),
  anioPublicacion: z.number().int(),
  revistaCongreso: z.string().nullable(),
  editorial: z.string().nullable(),
  doi: z.string().nullable(),
  isbn: z.string().nullable(),
  issn: z.string().nullable(),
  estado: estadoPublicacionEnum,
  createdAt: z.string().datetime().or(z.date()),
  autores: z.array(
    z.object({
      nombres: z.string(),
      apellidos: z.string(),
      orden: z.number().int(),
    }),
  ),
  palabrasClave: z.array(z.string()),
  archivo: z.object({
    originalName: z.string(),
    size: z.number(),
  }),
});

export type PublicacionBusquedaItem = z.infer<
  typeof publicacionBusquedaItemSchema
>;

export const busquedaPublicacionesResponseSchema = z.object({
  items: z.array(publicacionBusquedaItemSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type BusquedaPublicacionesResponse = z.infer<
  typeof busquedaPublicacionesResponseSchema
>;
