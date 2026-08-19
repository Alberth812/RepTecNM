import { put } from "@vercel/blob";

/**
 * Sube un archivo y devuelve su URL pública. Implementado con Vercel Blob
 * por ser la opción más directa junto a Neon en un despliegue en Vercel,
 * pero está aislado en esta función para poder sustituirlo por S3, Google
 * Cloud Storage, etc. sin tocar el resto del endpoint.
 *
 * CAVEAT sobre `comprobante_membresia`: Vercel Blob expone los objetos en
 * URLs públicas (aunque no listables/no adivinables). Si el comprobante de
 * pago debe ser estrictamente privado, usa un bucket privado con URLs
 * firmadas (p. ej. S3 + `getSignedUrl`) en vez de esta función.
 */
export async function uploadFile(file: File, folder: "fotografias" | "comprobantes"): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const key = `${folder}/${crypto.randomUUID()}-${safeName}`;

  const blob = await put(key, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return blob.url;
}
