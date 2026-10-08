import { z } from "zod";

import type { BuscarPublicacionesQuery } from "@/lib/validation/publicaciones-busqueda";
import {
  MIN_ANIO_PUBLICACION,
  doiSchema,
  isbn13Schema,
  issnSchema,
  singleKeywordSchema,
  tipoPublicacionEnum,
} from "@/lib/validation/publicaciones";

/**
 * Este esquema valida el FORMULARIO de búsqueda en el frontend (campos de
 * texto crudos, todos opcionales: un campo vacío significa "no aplicar ese
 * filtro"). Reutiliza directamente los esquemas/reglas ya definidos en
 * `@/lib/validation/publicaciones` (ISBN, ISSN, DOI, palabra clave) para no
 * duplicar normalización ni reglas de validación. `anioSchema` no está
 * exportado desde `publicaciones-busqueda.ts`, así que aquí se replica su
 * misma regla (año de 4 dígitos entre `MIN_ANIO_PUBLICACION` y el año en
 * curso) para dar feedback inmediato antes de llamar a la API.
 */

/**
 * Valor "sentinela" para la opción "Todos los tipos" del `<Select>` de
 * shadcn/ui, que no admite `value=""` en sus items.
 */
export const FILTRO_TIPO_TODOS = "__todos__";

const CURRENT_YEAR = new Date().getFullYear();

/** Recorta espacios; una cadena vacía o solo espacios se vuelve `undefined`. */
function normalizarOpcional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function textoOpcional(max: number, etiqueta: string) {
  return z
    .string()
    .optional()
    .transform(normalizarOpcional)
    .refine((value) => value === undefined || value.length <= max, {
      message: `${etiqueta} no puede exceder ${max} caracteres.`,
    });
}

const anioValidoSchema = z
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
      .max(
        CURRENT_YEAR,
        `El año no puede ser mayor al año en curso (${CURRENT_YEAR}).`,
      ),
  );

const anioOpcional = z
  .string()
  .optional()
  .transform(normalizarOpcional)
  .pipe(z.union([z.undefined(), anioValidoSchema]));

const tipoOpcional = z
  .string()
  .optional()
  .transform((value) =>
    value === undefined || value === FILTRO_TIPO_TODOS ? undefined : value,
  )
  .pipe(z.union([z.undefined(), tipoPublicacionEnum]));

const keywordOpcional = z
  .string()
  .optional()
  .transform(normalizarOpcional)
  .pipe(z.union([z.undefined(), singleKeywordSchema]));

// ISBN/ISSN/DOI reutilizan los validadores del backend (`isbn13Schema`,
// `issnSchema`, `doiSchema`), pero NO los esquemas `optional*` del backend:
// esos aceptan `null` como entrada, y un <input> controlado de React nunca
// debe recibir `value={null}` (rompe el tipado de `InputHTMLAttributes` y,
// en tiempo de ejecución, un input pasa de no controlado a controlado). Se
// sigue el mismo patrón que `anioOpcional`/`keywordOpcional`: input siempre
// `string | undefined`.
const isbnOpcional = z
  .string()
  .optional()
  .transform(normalizarOpcional)
  .pipe(z.union([z.undefined(), isbn13Schema]));

const issnOpcional = z
  .string()
  .optional()
  .transform(normalizarOpcional)
  .pipe(z.union([z.undefined(), issnSchema]));

const doiOpcional = z
  .string()
  .optional()
  .transform(normalizarOpcional)
  .pipe(z.union([z.undefined(), doiSchema]));

export const publicacionesFiltrosFormSchema = z
  .object({
    q: textoOpcional(200, "La búsqueda"),
    tipo: tipoOpcional,
    anio: anioOpcional,
    anioDesde: anioOpcional,
    anioHasta: anioOpcional,
    autor: textoOpcional(150, "El autor"),
    keyword: keywordOpcional,
    isbn: isbnOpcional,
    issn: issnOpcional,
    doi: doiOpcional,
  })
  .superRefine((data, ctx) => {
    if (
      data.anio !== undefined &&
      (data.anioDesde !== undefined || data.anioHasta !== undefined)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["anio"],
        message: "No puedes combinar un año exacto con un rango (desde/hasta).",
      });
    }

    if (
      data.anioDesde !== undefined &&
      data.anioHasta !== undefined &&
      data.anioDesde > data.anioHasta
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["anioHasta"],
        message: "El año 'hasta' no puede ser menor que el año 'desde'.",
      });
    }
  });

export type PublicacionesFiltrosFormInput = z.input<
  typeof publicacionesFiltrosFormSchema
>;
export type PublicacionesFiltrosFormOutput = z.output<
  typeof publicacionesFiltrosFormSchema
>;

export const FILTROS_FORM_DEFAULT_VALUES: PublicacionesFiltrosFormInput = {
  q: "",
  tipo: FILTRO_TIPO_TODOS,
  anio: "",
  anioDesde: "",
  anioHasta: "",
  autor: "",
  keyword: "",
  isbn: "",
  issn: "",
  doi: "",
};

/** Controla qué grupo de campos de año se muestra en el formulario. */
export type AnioModoFiltro = "todos" | "exacto" | "rango";

/** Traduce la salida ya validada del formulario a los parámetros de búsqueda de la API. */
export function mapFiltrosFormAQuery(
  filtros: PublicacionesFiltrosFormOutput,
): Omit<BuscarPublicacionesQuery, "page" | "pageSize"> {
  return {
    q: filtros.q,
    tipo: filtros.tipo,
    anio: filtros.anio,
    anioDesde: filtros.anioDesde,
    anioHasta: filtros.anioHasta,
    autor: filtros.autor,
    keyword: filtros.keyword,
    isbn: filtros.isbn,
    issn: filtros.issn,
    doi: filtros.doi,
  };
}
