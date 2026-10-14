// lib/publicaciones/schemas/editar-publicacion-form-schema.ts
import { z } from "zod";

import { publicacionBaseMetadataSchema } from "@/lib/validation/publicaciones";
import { refineTipoPublicacionCliente } from "@/lib/publicaciones/schemas/refine-tipo-publicacion-cliente";

/**
 * Esquema de validación del formulario "Editar publicación".
 *
 * Es exactamente el mismo esquema que `updatePublicacionSchema` en el
 * servidor (`publicacionBaseMetadataSchema` + la validación tipo/tipoOtro):
 * solo metadatos, sin `aceptaDescargo` y sin `documento`. El PDF no se
 * puede sustituir vía PATCH (el servidor lo rechaza explícitamente), así
 * que este formulario ni siquiera lo incluye como campo.
 */
export const editarPublicacionFormSchema =
 publicacionBaseMetadataSchema.superRefine(refineTipoPublicacionCliente);

export type EditarPublicacionFormInput = z.input<
 typeof editarPublicacionFormSchema
>;
export type EditarPublicacionFormOutput = z.output<
 typeof editarPublicacionFormSchema
>;
