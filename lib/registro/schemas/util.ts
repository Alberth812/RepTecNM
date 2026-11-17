import { z } from "zod";
import {
 COMPROBANTE_MIME_TYPES,
 MAX_COMPROBANTE_SIZE_BYTES,
 MAX_PHOTO_SIZE_BYTES,
 ORCID_REGEX,
 PHONE_REGEX,
 PHOTO_ASPECT_RATIO,
 PHOTO_ASPECT_TOLERANCE,
 PHOTO_MAX_HEIGHT,
 PHOTO_MAX_WIDTH,
 PHOTO_MIME_TYPES,
 PHOTO_MIN_HEIGHT,
 PHOTO_MIN_WIDTH,
 formatBytes,
} from "../validators";

/** Texto simple obligatorio, con longitud máxima razonable para nombres/lugares. */
export const requiredText = (label: string, max = 120) =>
 z
 .string()
 .trim()
 .min(1, `${label} es obligatorio.`)
 .max(max, `${label} no debe exceder ${max} caracteres.`);

export const phoneSchema = (label: string) =>
 z
 .string()
 .trim()
 .regex(
 PHONE_REGEX,
 `${label} debe tener 10 dígitos, sin espacios ni guiones.`,
 );

export const optionalPhoneSchema = z
 .string()
 .trim()
 .regex(
 PHONE_REGEX,
 "El teléfono debe tener 10 dígitos, sin espacios ni guiones.",
 )
 .optional()
 .or(z.literal(""));

export const maxWordsText = (
 label: string,
 maxWords: number,
 required: boolean,
 maxChars = 500,
) => {
 const base = z.string().trim();

 const withMaxWords = base.refine(
 (val) => {
 if (val === "") return true;
 const words = val.split(/\s+/).filter(Boolean);
 return words.length <= maxWords;
 },
 { message: `${label} no debe exceder ${maxWords} palabras.` },
 );

 const withMaxChars = withMaxWords.refine((val) => val.length <= maxChars, {
 message: `${label} no debe exceder ${maxChars} caracteres.`,
 });

 return required
 ? withMaxChars.refine((val) => val.length > 0, {
 message: `${label} es obligatorio.`,
 })
 : withMaxChars;
};

export type ImageDimensionChecker = (
 file: File,
) => Promise<{ width: number; height: number }>;

/**
 * La fotografía es obligatoria: JPG/PNG, máx. 5 MB, y (cuando se provee un
 * `checkImageDimensions`, típicamente en el navegador tras el recorte) al
 * menos 354x472px con relación de aspecto 3:4.
 *
 * NOTA para el backend: en el servidor no se valida la relación de aspecto ni
 * la resolución por defecto (evitamos depender de librerías de imagen como
 * `sharp` en este stub). El recortador del cliente ya garantiza una salida de
 * 3:4 a resolución suficiente; para blindar el servidor en producción, pase
 * un `checkImageDimensions` respaldado por `sharp`/`image-size`.
 */
export function fotografiaSchema(checkImageDimensions?: ImageDimensionChecker) {
 return z
 .custom<File | null>((val) => val === null || val instanceof File, {
 message: "La fotografía es obligatoria.",
 })
 .superRefine(async (file, ctx) => {
 if (!file) {
 ctx.addIssue({
 code: "custom",
 message: "La fotografía es obligatoria.",
 });
 return;
 }
 if (
 !PHOTO_MIME_TYPES.includes(
 file.type as (typeof PHOTO_MIME_TYPES)[number],
 )
 ) {
 ctx.addIssue({
 code: "custom",
 message: "Formato inválido. Solo se aceptan JPG o PNG.",
 });
 }

 if (file.size > MAX_PHOTO_SIZE_BYTES) {
 ctx.addIssue({
 code: "custom",
 message: `La fotografía no debe superar ${formatBytes(
 MAX_PHOTO_SIZE_BYTES,
 )}.`,
 });
 }
 if (checkImageDimensions && file.size <= MAX_PHOTO_SIZE_BYTES) {
 try {
 const { width, height } = await checkImageDimensions(file);
 if (width < PHOTO_MIN_WIDTH || height < PHOTO_MIN_HEIGHT) {
 ctx.addIssue({
 code: "custom",
 message: `La imagen debe medir al menos ${PHOTO_MIN_WIDTH}x${PHOTO_MIN_HEIGHT}px.`,
 });
 } else if (width > PHOTO_MAX_WIDTH || height > PHOTO_MAX_HEIGHT) {
 ctx.addIssue({
 code: "custom",
 message: `La imagen no debe superar ${PHOTO_MAX_WIDTH}x${PHOTO_MAX_HEIGHT}px.`,
 });
 } else {
 const ratio = width / height;

 if (Math.abs(ratio - PHOTO_ASPECT_RATIO) > PHOTO_ASPECT_TOLERANCE) {
 ctx.addIssue({
 code: "custom",
 message:
 "La imagen debe tener una relación de aspecto 3:4. Vuelve a recortarla.",
 });
 }
 }
 } catch {
 ctx.addIssue({
 code: "custom",
 message: "No se pudo procesar la imagen. Intenta con otro archivo.",
 });
 }
 }
 })
 .transform((file) => file as File);
}

export function comprobanteSchema() {
 return z
 .custom<File | null>((val) => val === null || val instanceof File, {
 message: "Archivo inválido.",
 })
 .superRefine((file, ctx) => {
 if (!file) {
 ctx.addIssue({
 code: "custom",
 message: "El comprobante de membresía es obligatorio.",
 });
 return;
 }

 if (
 !COMPROBANTE_MIME_TYPES.includes(
 file.type as (typeof COMPROBANTE_MIME_TYPES)[number],
 )
 ) {
 ctx.addIssue({
 code: "custom",
 message: "Formato inválido. Se acepta PDF, JPG o PNG.",
 });
 }

 if (file.size > MAX_COMPROBANTE_SIZE_BYTES) {
 ctx.addIssue({
 code: "custom",
 message: `El archivo no debe superar ${formatBytes(
 MAX_COMPROBANTE_SIZE_BYTES,
 )}.`,
 });
 }
 })
 .transform((file) => file as File);
}

export const proyectoRelevanteSchema = z.object({
 nombre: requiredText("El nombre del proyecto", 150),
 descripcion: requiredText("La descripción del proyecto", 1000),
 rol: requiredText("El rol desempeñado", 100),
 anio: z
 .number({
 error: "El año es obligatorio.", // O un objeto de mapeo de errores si aplica
 })
 .int("El año debe ser un número entero.")
 .min(1980, "El año no parece válido.")
 .max(new Date().getFullYear(), "El año no puede ser en el futuro."),
});

export function requiredSelect<const T extends readonly [string, ...string[]]>(
 options: T,
 message: string,
) {
 return z.union([z.literal(""), z.enum(options)]).transform((value, ctx) => {
 if (value === "") {
 ctx.addIssue({
 code: "custom",
 message,
 });
 return z.NEVER;
 }

 return value;
 });
}
