"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { RotateCcw, ZoomIn } from "lucide-react";
import { PHOTO_MIN_HEIGHT, PHOTO_MIN_WIDTH } from "@/lib/registro/validators";
import { getCroppedImageFile } from "@/lib/registro/cropImage";

interface ImageCropperProps {
 file: File;
 /** Se llama cuando el usuario cancela; no se modifica el valor del formulario. */
 onCancel: () => void;
 /** Se llama con el archivo ya recortado (JPEG), listo para guardarse en el formulario. */
 onConfirm: (file: File) => void;
}

const ASPECT = 3 / 4;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

/** Recortador con relación de aspecto fija 3:4 (arrastre y pellizco en móvil). */
export default function ImageCropper({
 file,
 onCancel,
 onConfirm,
}: ImageCropperProps) {
 const [imageUrl] = useState(() => URL.createObjectURL(file));
 const [crop, setCrop] = useState({ x: 0, y: 0 });
 const [zoom, setZoom] = useState(1);
 const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
 const [isProcessing, setIsProcessing] = useState(false);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 return () => URL.revokeObjectURL(imageUrl);
 }, [imageUrl]);

 const handleCropComplete = useCallback(
 (_croppedArea: Area, croppedAreaPixelsValue: Area) => {
 setCroppedAreaPixels(croppedAreaPixelsValue);
 },
 [],
 );

 const handleMediaLoaded = useCallback(
 (mediaSize: { naturalWidth: number; naturalHeight: number }) => {
 if (
 mediaSize.naturalWidth < PHOTO_MIN_WIDTH ||
 mediaSize.naturalHeight < PHOTO_MIN_HEIGHT
 ) {
 setError(
 `La imagen es demasiado pequeña (${mediaSize.naturalWidth}x${mediaSize.naturalHeight}px). ` +
 `Se requieren al menos ${PHOTO_MIN_WIDTH}x${PHOTO_MIN_HEIGHT}px.`,
 );
 }
 },
 [],
 );

 const handleReset = () => {
 setCrop({ x: 0, y: 0 });
 setZoom(1);
 };

 const handleConfirm = async () => {
 if (!croppedAreaPixels) return;
 setIsProcessing(true);
 setError(null);
 try {
 const cropped = await getCroppedImageFile(
 imageUrl,
 croppedAreaPixels,
 file.name,
 );
 onConfirm(cropped);
 } catch {
 setError(
 "No se pudo generar la imagen recortada. Intenta con otro archivo.",
 );
 } finally {
 setIsProcessing(false);
 }
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
 <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
 <h3 className="text-base font-semibold text-slate-900">
 Recorta tu fotografía
 </h3>
 <p className="mt-1 text-sm text-slate-500">
 Arrastra o pellizca para ajustar el encuadre (relación 3:4).
 </p>

 {error && (
 <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
 {error}
 </p>
 )}

 <div className="relative mx-auto mt-4 h-72 w-56 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
 <Cropper
 image={imageUrl}
 crop={crop}
 zoom={zoom}
 aspect={ASPECT}
 minZoom={MIN_ZOOM}
 maxZoom={MAX_ZOOM}
 restrictPosition
 onCropChange={setCrop}
 onZoomChange={setZoom}
 onCropComplete={handleCropComplete}
 onMediaLoaded={handleMediaLoaded}
 />
 </div>

 <div className="mt-4 flex items-center gap-3">
 <ZoomIn
 className="h-4 w-4 shrink-0 text-slate-400"
 aria-hidden="true"
 />
 <input
 type="range"
 aria-label="Zoom"
 min={MIN_ZOOM}
 max={MAX_ZOOM}
 step={0.01}
 value={zoom}
 onChange={(e) => setZoom(Number(e.target.value))}
 className="h-1.5 w-full appearance-none rounded-full bg-slate-200 accent-[#004B87]"
 />
 <button
 type="button"
 onClick={handleReset}
 className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
 aria-label="Restablecer encuadre"
 >
 <RotateCcw className="h-4 w-4" />
 </button>
 </div>

 <div className="mt-5 flex justify-end gap-2">
 <button
 type="button"
 onClick={onCancel}
 className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
 >
 Cancelar
 </button>
 <button
 type="button"
 onClick={handleConfirm}
 disabled={!croppedAreaPixels || isProcessing}
 className="rounded-lg bg-[#004B87] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#003A68] disabled:cursor-not-allowed disabled:opacity-50"
 >
 {isProcessing ? "Procesando…" : "Usar esta foto"}
 </button>
 </div>
 </div>
 </div>
 );
}
