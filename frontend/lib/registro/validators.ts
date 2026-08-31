import { z } from "zod";

// Constantes de tamaño y tipos
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_COMPROBANTE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const PHOTO_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const COMPROBANTE_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

// Constantes de dimensiones de foto
export const PHOTO_MIN_WIDTH = 400;
export const PHOTO_MIN_HEIGHT = 400;
export const PHOTO_MAX_WIDTH = 2000;
export const PHOTO_MAX_HEIGHT = 2000;
export const PHOTO_ASPECT_RATIO = 1; // 1:1
export const PHOTO_ASPECT_TOLERANCE = 0.1;

// Regex
export const ORCID_REGEX = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/;
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

// Funciones de utilidad
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
