// lib/publicaciones/schemas/refine-tipo-publicacion-cliente.ts
import { z } from "zod";

import {
  TipoPublicacion,
  type TipoPublicacionType,
} from "@/lib/validation/publicaciones";

/**
 * Replica el criterio de consistencia tipo/tipoOtro de `refineTipoPublicacion`
 * definido en `@/lib/validation/publicaciones` (esa función no está
 * exportada desde ese módulo, por lo que se reproduce aquí, con los mismos
 * mensajes, para validar en el cliente sin esperar el round-trip al
 * servidor). La usan tanto el formulario de creación como el de edición,
 * ya que ambos comparten `publicacionBaseMetadataSchema`.
 *
 * Si en algún momento se exporta `refineTipoPublicacion` desde
 * `@/lib/validation/publicaciones`, se puede borrar este archivo y usar
 * `.superRefine(refineTipoPublicacion)` directamente en ambos esquemas.
 */
export function refineTipoPublicacionCliente(
  data: { tipo: TipoPublicacionType; tipoOtro: string | null | undefined },
  ctx: z.RefinementCtx,
) {
  if (data.tipo === TipoPublicacion.OTRO) {
    if (!data.tipoOtro) {
      ctx.addIssue({
        code: "custom",
        path: ["tipoOtro"],
        message:
          'Debe especificar el tipo de publicación cuando selecciona "Otro".',
      });
      return;
    }

    if (data.tipoOtro.length < 3 || data.tipoOtro.length > 50) {
      ctx.addIssue({
        code: "custom",
        path: ["tipoOtro"],
        message:
          'La especificación de "Otro" debe tener entre 3 y 50 caracteres.',
      });
    }
  }
}
