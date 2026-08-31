import { RegistroFormOutput } from "./schema";

/**
 * Serializa los valores del formulario a un `FormData` listo para enviarse a
 * `POST /api/registro`. Se usa `FormData` (no JSON) porque el formulario
 * incluye archivos (fotografía y comprobante de membresía).
 *
 * Convención: los campos que no son archivo viajan juntos como un único
 * campo `payload` (JSON), y los archivos viajan como entradas de archivo
 * aparte. Esto evita tener que aplanar arreglos/objetos anidados (como
 * `proyectos_relevantes` o `palabras_clave`) en múltiples claves de FormData.
 */

export function buildRegistroFormData(values: RegistroFormOutput): FormData {
  const { fotografia, comprobante_membresia, ...rest } = values;
  const formData = new FormData();
  formData.append("payload", JSON.stringify(rest));
  if (fotografia) formData.append("fotografia", fotografia);
  if (comprobante_membresia)
    formData.append("comprobante_membresia", comprobante_membresia);
  return formData;
}

/**
 * Reconstruye un objeto plano (sin validar todavía) a partir del `FormData`
 * recibido en el API route. Debe pasarse por `registroSchema.parseAsync`
 * (o `.safeParseAsync`) antes de confiar en el resultado.
 */
export function parseRegistroFormData(
  formData: FormData,
): Record<string, unknown> {
  const payloadRaw = formData.get("payload");
  const rest = typeof payloadRaw === "string" ? JSON.parse(payloadRaw) : {};
  const fotografia = formData.get("fotografia");
  const comprobanteMembresia = formData.get("comprobante_membresia");

  return {
    ...rest,
    fotografia:
      fotografia instanceof File && fotografia.size > 0 ? fotografia : null,
    comprobante_membresia:
      comprobanteMembresia instanceof File && comprobanteMembresia.size > 0
        ? comprobanteMembresia
        : null,
  };
}
