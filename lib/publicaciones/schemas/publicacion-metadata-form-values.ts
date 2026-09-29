// lib/publicaciones/schemas/publicacion-metadata-form-values.ts
import type { z } from "zod";

import type { publicacionBaseMetadataSchema } from "@/lib/validation/publicaciones";

/**
 * Forma (de "entrada", antes de las transformaciones de Zod) de los campos
 * comunes a crear y editar una publicación: todo excepto `documento` y
 * `aceptaDescargo`, que solo existen en el formulario de creación.
 *
 * `CrearPublicacionFormInput` = esto + `{ documento, aceptaDescargo }`.
 * `EditarPublicacionFormInput` = exactamente esto (mismo shape que
 * `updatePublicacionSchema` en el servidor).
 */
export type PublicacionMetadataFormValues = z.input<
  typeof publicacionBaseMetadataSchema
>;
