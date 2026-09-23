// lib/publicaciones/schemas/crear-publicacion-form-schema.ts
import { z } from "zod";

import {
  pdfFileSchema,
  publicacionBaseMetadataSchema,
} from "@/lib/validation/publicaciones";

import { refineTipoPublicacionCliente } from "@/lib/publicaciones/schemas/refine-tipo-publicacion-cliente";

/**
 * Esquema de validación del formulario "Crear publicación".
 *
 * Reutiliza `publicacionBaseMetadataSchema` y `pdfFileSchema` tal como están
 * definidos para el backend, y agrega dos cosas propias del formulario:
 *
 *  - `documento`: el archivo PDF. No forma parte del JSON `metadata` que
 *    espera la API; se envía aparte dentro del mismo FormData.
 *  - `aceptaDescargo`: aquí se modela como `z.boolean().refine(...)` en vez
 *    de `z.literal(true)` (como hace `createPublicacionSchema` en el
 *    servidor). Esto es a propósito: permite que el checkbox arranque en
 *    `false` sin pelear con el tipo `true` de un literal. La garantía real
 *    de que sea `true` la sigue imponiendo el servidor con
 *    `createPublicacionSchema`; este `.refine` solo da feedback inmediato
 *    en el cliente.
 */
export const crearPublicacionFormSchema = publicacionBaseMetadataSchema
  .extend({
    documento: pdfFileSchema,
    aceptaDescargo: z.boolean().refine((value) => value === true, {
      message:
        "Debe leer y aceptar el descargo de responsabilidad para publicar.",
    }),
  })
  .superRefine(refineTipoPublicacionCliente);

/**
 * Tipo de "entrada": la forma que deben tener los valores que React Hook Form
 * mantiene en cada input (antes de que Zod normalice/transforme nada).
 * Úsalo para `defaultValues` y para tipar el `useForm`.
 */
export type CrearPublicacionFormInput = z.input<
  typeof crearPublicacionFormSchema
>;

/**
 * Tipo de "salida": la forma ya normalizada (DOI en minúsculas, ISBN/ISSN
 * sin guiones, palabras clave normalizadas, etc.) que recibe `onSubmit`
 * cuando la validación pasa.
 */
export type CrearPublicacionFormOutput = z.output<
  typeof crearPublicacionFormSchema
>;
