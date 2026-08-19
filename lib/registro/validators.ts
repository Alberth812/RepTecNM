// Utilidades de validación compartidas entre el esquema de Zod (cliente y servidor)
// y los componentes de UI (p. ej. contadores de palabras en vivo).

/** Cuenta palabras separadas por espacios en blanco, ignorando espacios repetidos. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

/** Teléfono mexicano: exactamente 10 dígitos, sin espacios, guiones ni paréntesis. */
export const PHONE_REGEX = /^\d{10}$/;

/** ORCID iD: 0000-0000-0000-000X (el último carácter puede ser dígito o X). */
export const ORCID_REGEX = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

export const PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const;
export const COMPROBANTE_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const;

export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_COMPROBANTE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const PHOTO_MIN_WIDTH = 354;
export const PHOTO_MIN_HEIGHT = 472;
export const PHOTO_ASPECT_RATIO = 3 / 4;

/**
 * Lee las dimensiones de un archivo de imagen en el navegador.
 * Solo funciona en un entorno con `Image`/`URL.createObjectURL` (cliente).
 */
export function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
