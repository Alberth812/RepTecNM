import sharp from "sharp";

import { PHOTO_MAX_HEIGHT, PHOTO_MAX_WIDTH } from "./validators";

export type ImageDimensionChecker = (file: File) => Promise<{
 width: number;
 height: number;
}>;

export const checkImageDimensionsServer: ImageDimensionChecker = async (
 file,
) => {
 const buffer = Buffer.from(await file.arrayBuffer());

 const metadata = await sharp(buffer).metadata();

 if (!["jpeg", "png"].includes(metadata.format ?? "")) {
 throw new Error(
 "El contenido no corresponde a una imagen JPEG o PNG válida.",
 );
 }

 if (!metadata.width || !metadata.height) {
 throw new Error("No se pudieron determinar las dimensiones de la imagen.");
 }

 let { width, height } = metadata;

 /**
 * La orientación EXIF puede hacer que una imagen físicamente almacenada
 * como W×H se presente como H×W.
 *
 * Para una fotografía de perfil, normalizamos conceptualmente las
 * dimensiones para que la validación coincida con la orientación visual.
 */
 if (metadata.orientation && [5, 6, 7, 8].includes(metadata.orientation)) {
 [width, height] = [height, width];
 }

 if (width > PHOTO_MAX_WIDTH || height > PHOTO_MAX_HEIGHT) {
 throw new Error(
 `La imagen supera la resolución máxima permitida de ${PHOTO_MAX_WIDTH}x${PHOTO_MAX_HEIGHT}px.`,
 );
 }

 return {
 width,
 height,
 };
};
