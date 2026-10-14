const EXTENSION_MIME_FALLBACK: Record<string, string> = {
 jpg: "image/jpeg",
 jpeg: "image/jpeg",
 png: "image/png",
 pdf: "application/pdf",
};

function guessMimeFromFilename(filename: string): string | undefined {
 const ext = filename.split(".").pop()?.toLowerCase();
 return ext ? EXTENSION_MIME_FALLBACK[ext] : undefined;
}

/**
 * Descarga un archivo desde una URL (p. ej. una URL firmada de S3/Garage)
 * y lo convierte en un `File`, para poder precargarlo en un campo de
 * react-hook-form que espera `File | null`.
 *
 * Si el `Content-Type` que devuelve el bucket viene vacío o genérico
 * (`application/octet-stream`), se intenta inferir el MIME real a partir
 * de la extensión del nombre original, para no chocar con el whitelist de
 * MIME types del schema de zod.
 *
 * Lanza si la descarga falla (URL expirada, red, CORS, etc.); quien llama
 * decide cómo degradar la experiencia.
 */
export async function urlToFile(url: string, filename: string): Promise<File> {
 const response = await fetch(url);

 if (!response.ok) {
 throw new Error(`No se pudo descargar el archivo (HTTP ${response.status}).`);
 }

 const blob = await response.blob();
 const isGenericType = !blob.type || blob.type === "application/octet-stream";
 const type = isGenericType ? guessMimeFromFilename(filename) ?? blob.type : blob.type;

 return new File([blob], filename, { type });
}