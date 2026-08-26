import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";
import path from "node:path";

import { storageConfig } from "./config";

const commonClientOptions = {
  region: storageConfig.region,
  credentials: {
    accessKeyId: storageConfig.accessKeyId,
    secretAccessKey: storageConfig.secretAccessKey,
  },
  forcePathStyle: storageConfig.forcePathStyle,
};

/**
 * Cliente utilizado exclusivamente para operaciones internas
 * del servidor contra Garage/S3.
 *
 * Ejemplos:
 * - PUT
 * - DELETE
 */
const s3Internal = new S3Client({
  ...commonClientOptions,
  endpoint: storageConfig.internalEndpoint,
});

/**
 * Cliente utilizado para generar URLs que serán consumidas
 * por el navegador.
 *
 * IMPORTANTE:
 * El endpoint de este cliente debe ser accesible por el navegador,
 * porque forma parte de la URL presignada.
 */
const s3Public = new S3Client({
  ...commonClientOptions,
  endpoint: storageConfig.publicEndpoint,
});

/**
 * Genera una URL firmada de solo lectura para un objeto.
 *
 * La URL generada utiliza S3_PUBLIC_ENDPOINT, no
 * S3_INTERNAL_ENDPOINT.
 */
export async function getFileUrl(
  objectKey: string,
  expiresInSeconds = 900, // 15 minutos
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: storageConfig.bucket,
    Key: objectKey,
  });

  return getSignedUrl(s3Public, command, {
    expiresIn: expiresInSeconds,
  });
}

export interface UploadedFile {
  bucket: string;
  objectKey: string;
  originalName: string;
  contentType: string;
  size: number;
}

interface UploadFileOptions {
  file: File;
  ownerId: string;
  folder: "fotografia" | "membresia";
}

export async function uploadFile({
  file,
  ownerId,
  folder,
}: UploadFileOptions): Promise<UploadedFile> {
  if (!file || file.size === 0) {
    throw new Error("No se recibió ningún archivo.");
  }

  const extension = getExtension(file);

  const objectKey = [
    "afiliados",
    ownerId,
    folder,
    `${crypto.randomUUID()}${extension}`,
  ].join("/");

  const body = Buffer.from(await file.arrayBuffer());

  await s3Internal.send(
    new PutObjectCommand({
      Bucket: storageConfig.bucket,
      Key: objectKey,
      Body: body,
      ContentType: file.type || "application/octet-stream",
      ContentLength: body.length,
    }),
  );

  return {
    bucket: storageConfig.bucket,
    objectKey,
    originalName: file.name,
    contentType: file.type || "application/octet-stream",
    size: body.length,
  };
}

export async function deleteFile(objectKey: string): Promise<void> {
  await s3Internal.send(
    new DeleteObjectCommand({
      Bucket: storageConfig.bucket,
      Key: objectKey,
    }),
  );
}

function getExtension(file: File): string {
  const extensionFromName = path.extname(file.name).toLowerCase();

  if (extensionFromName) {
    return extensionFromName;
  }

  switch (file.type) {
    case "image/jpeg":
      return ".jpg";

    case "image/png":
      return ".png";

    case "image/webp":
      return ".webp";

    case "application/pdf":
      return ".pdf";

    default:
      return "";
  }
}
