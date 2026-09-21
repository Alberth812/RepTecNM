// @/lib/publicaciones/pdf.ts
import { payloadTooLarge } from "@/lib/api/http";
import { ApiError } from "@/lib/errors";
import {
  hasPdfMagicBytes,
  MAX_PDF_SIZE_BYTES,
  PDF_MAGIC_BYTES,
  pdfFileSchema,
} from "@/lib/validation/publicaciones";

/**
 * Valida completamente el PDF recibido en el multipart (RF-DOC-001):
 *  - Es un `File` real (no un string).
 *  - No está vacío y no excede 5 MB (tamaño REAL del blob, no el declarado).
 *  - Extensión `.pdf` y MIME `application/pdf`.
 *  - Firma `%PDF-` en los primeros bytes (magic bytes).
 *
 * Solo lee los primeros bytes del archivo; no lo carga completo en memoria.
 */
export async function validarArchivoPdf(
  value: FormDataEntryValue | null,
): Promise<File> {
  if (!(value instanceof File)) {
    throw ApiError.badRequest(
      'Debe adjuntar el documento PDF en el campo "documento".',
    );
  }

  if (value.size > MAX_PDF_SIZE_BYTES) {
    throw payloadTooLarge(
      "El documento PDF no puede exceder el límite de 5 MB.",
    );
  }

  const parsed = pdfFileSchema.safeParse(value);
  if (!parsed.success) {
    throw ApiError.badRequest(
      parsed.error.issues.map((issue) => issue.message).join(" "),
    );
  }

  const header = await value.slice(0, PDF_MAGIC_BYTES.length).arrayBuffer();
  if (!hasPdfMagicBytes(header)) {
    throw ApiError.badRequest(
      "El contenido del archivo no corresponde a un PDF válido.",
    );
  }

  return value;
}

/**
 * Nombre "seguro" para persistir en `archivo.original_name`: sin rutas,
 * sin caracteres de control ni caracteres problemáticos, longitud acotada
 * y extensión `.pdf` normalizada.
 */
export function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "";

  const cleaned = base
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f<>:"|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.pdf$/i, "")
    .slice(0, 200)
    .trim();

  return `${cleaned || "documento"}.pdf`;
}
