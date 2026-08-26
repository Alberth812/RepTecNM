import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import crypto from "node:crypto";
import path from "node:path";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable de entorno: ${name}`);
  }

  return value;
}

const endpoint = getRequiredEnv("S3_ENDPOINT");
const region = getRequiredEnv("S3_REGION");
const accessKeyId = getRequiredEnv("S3_ACCESS_KEY_ID");
const secretAccessKey = getRequiredEnv("S3_SECRET_ACCESS_KEY");
const bucket = getRequiredEnv("S3_BUCKET");

export const s3 = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },

  // Muy útil con servicios S3 compatibles como Garage.
  forcePathStyle: true,
});

/**
 * Genera una URL firmada de solo lectura para un objeto de Garage.
 * Se usa para mostrar/descargar archivos privados (fotografía, comprobante)
 * en el panel de administración, sin hacer el bucket público.
 */
export async function getFileUrl(
  objectKey: string,
  expiresInSeconds = 900, // 15 minutos
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: objectKey });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
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

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: file.type || "application/octet-stream",
      ContentLength: body.length,
    }),
  );

  return {
    bucket,
    objectKey,
    originalName: file.name,
    contentType: file.type || "application/octet-stream",
    size: body.length,
  };
}

export async function deleteFile(objectKey: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
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
