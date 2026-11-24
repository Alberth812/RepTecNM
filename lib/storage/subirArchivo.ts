// @/storage/subirArchivos.ts

import { db } from "@/lib/db/client";
import { archivos } from "@/lib/db/schema/archivo";

import { uploadFile, type UploadedFile } from "./index";

interface SubirArchivoEjemploOptions {
  ownerId: string;
  folder: "membresia" | "fotografia";
}

export async function subirArchivoEjemplo({
  ownerId,
  folder,
}: SubirArchivoEjemploOptions) {
  // Descargar la imagen desde internet.
  const response = await fetch(
    "https://static.vecteezy.com/system/resources/thumbnails/051/498/301/small_2x/social-media-chat-online-blank-profile-picture-head-and-body-icon-people-standing-icon-free-vector.jpg",
  );

  if (!response.ok) {
    throw new Error(`Error al descargar la imagen: ${response.status}`);
  }

  // Obtener el contenido de la imagen.
  const arrayBuffer = await response.arrayBuffer();

  // Obtener el tipo MIME.
  const contentType = response.headers.get("content-type") || "image/jpg";

  // Obtener el nombre del archivo desde la URL.
  const originalName = "imagen_perfil.png";

  // Convertir a File.
  const file = new File([arrayBuffer], originalName, { type: contentType });

  // Subir a S3.
  const archivoSubido: UploadedFile = await uploadFile({
    target: "afiliados",
    file,
    ownerId,
    folder,
  });

  // Registrar en la base de datos.
  const [archivoObjeto] = await db
    .insert(archivos)
    .values({
      bucket: archivoSubido.bucket,
      objectKey: archivoSubido.objectKey,
      originalName: archivoSubido.originalName,
      contentType: archivoSubido.contentType,
      size: archivoSubido.size,
    })
    .returning();

  return [archivoSubido, archivoObjeto] as const;
}
