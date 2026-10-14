import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
 return new Promise((resolve, reject) => {
 const img = new Image();
 img.onload = () => resolve(img);
 img.onerror = () => reject(new Error("No se pudo cargar la imagen."));
 img.src = src;
 });
}

/**
 * Recorta `imageSrc` según el área en píxeles que entrega react-easy-crop
 * (`onCropComplete`) y devuelve el resultado como un `File` JPEG.
 *
 * La relación de aspecto ya viene fija en 3:4 por el prop `aspect` del
 * Cropper, así que no hace falta recalcularla aquí. Si el recorte excede
 * `maxOutputWidth` se reduce proporcionalmente para no generar archivos
 * innecesariamente pesados.
 */
export async function getCroppedImageFile(
 imageSrc: string,
 crop: Area,
 originalFilename: string,
 maxOutputWidth = 1200,
): Promise<File> {
 const image = await loadImage(imageSrc);

 const scale = crop.width > maxOutputWidth ? maxOutputWidth / crop.width : 1;
 const outputWidth = Math.round(crop.width * scale);
 const outputHeight = Math.round(crop.height * scale);

 const canvas = document.createElement("canvas");
 canvas.width = outputWidth;
 canvas.height = outputHeight;

 const ctx = canvas.getContext("2d");
 if (!ctx) {
 throw new Error("No se pudo crear el contexto de canvas.");
 }

 ctx.drawImage(
 image,
 crop.x,
 crop.y,
 crop.width,
 crop.height,
 0,
 0,
 outputWidth,
 outputHeight,
 );

 const blob = await new Promise<Blob | null>((resolve) =>
 canvas.toBlob(resolve, "image/jpeg", 0.92),
 );

 if (!blob) {
 throw new Error("No se pudo generar la imagen recortada.");
 }

 const baseName = originalFilename.replace(/\.[^/.]+$/, "") || "fotografia";
 return new File([blob], `${baseName}-recorte.jpg`, { type: "image/jpeg" });
}
