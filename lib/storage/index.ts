import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";
import path from "node:path";

import { storageConfig, type StorageTarget } from "./config";

function buildClient(endpoint: string, target: StorageTarget): S3Client {
  const creds = storageConfig.buckets[target];
  return new S3Client({
    region: storageConfig.region,
    endpoint,
    forcePathStyle: storageConfig.forcePathStyle,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
    },
  });
}

// Un cliente por bucket y por "vista" (interna vs pública), creados
// perezosamente y cacheados.
const internalClients = new Map<StorageTarget, S3Client>();
const publicClients = new Map<StorageTarget, S3Client>();

function getInternalClient(target: StorageTarget): S3Client {
  let client = internalClients.get(target);
  if (!client) {
    client = buildClient(storageConfig.internalEndpoint, target);
    internalClients.set(target, client);
  }
  return client;
}

function getPublicClient(target: StorageTarget): S3Client {
  let client = publicClients.get(target);
  if (!client) {
    client = buildClient(storageConfig.publicEndpoint, target);
    publicClients.set(target, client);
  }
  return client;
}

/**
 * Genera una URL firmada de solo lectura para un objeto de un bucket
 * específico. Usa S3_PUBLIC_ENDPOINT porque la URL la consume el navegador.
 */
export async function getFileUrl(
  target: StorageTarget,
  objectKey: string,
  expiresInSeconds = 900,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: storageConfig.buckets[target].bucket,
    Key: objectKey,
  });

  return getSignedUrl(getPublicClient(target), command, {
    expiresIn: expiresInSeconds,
  });
}

export interface UploadedFile {
  target: StorageTarget;
  bucket: string;
  objectKey: string;
  originalName: string;
  contentType: string;
  size: number;
}

interface UploadFileOptions {
  target: StorageTarget;
  file: File;
  ownerId: string;
  folder: string;
}

export async function uploadFile({
  target,
  file,
  ownerId,
  folder,
}: UploadFileOptions): Promise<UploadedFile> {
  if (!file || file.size === 0) {
    throw new Error("No se recibió ningún archivo.");
  }

  const extension = getExtension(file);
  // Ya no hace falta prefijar con "afiliados/": el bucket mismo
  // separa el namespace.
  const objectKey = [
    ownerId,
    folder,
    `${crypto.randomUUID()}${extension}`,
  ].join("/");
  const body = Buffer.from(await file.arrayBuffer());

  await getInternalClient(target).send(
    new PutObjectCommand({
      Bucket: storageConfig.buckets[target].bucket,
      Key: objectKey,
      Body: body,
      ContentType: file.type || "application/octet-stream",
      ContentLength: body.length,
    }),
  );

  return {
    target,
    bucket: storageConfig.buckets[target].bucket,
    objectKey,
    originalName: file.name,
    contentType: file.type || "application/octet-stream",
    size: body.length,
  };
}

export async function deleteFile(
  target: StorageTarget,
  objectKey: string,
): Promise<void> {
  await getInternalClient(target).send(
    new DeleteObjectCommand({
      Bucket: storageConfig.buckets[target].bucket,
      Key: objectKey,
    }),
  );
}

function getExtension(file: File): string {
  const extensionFromName = path.extname(file.name).toLowerCase();
  if (extensionFromName) return extensionFromName;
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

export async function getInternalFileUrl(
  target: StorageTarget,
  objectKey: string,
  expiresInSeconds = 900,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: storageConfig.buckets[target].bucket,
    Key: objectKey,
  });

  return getSignedUrl(getInternalClient(target), command, {
    expiresIn: expiresInSeconds,
  });
}
export type { StorageTarget } from './config';
