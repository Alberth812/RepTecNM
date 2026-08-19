"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, ZoomIn } from "lucide-react";
import { PHOTO_MIN_HEIGHT, PHOTO_MIN_WIDTH } from "@/lib/registro/validators";

interface ImageCropperProps {
  file: File;
  /** Se llama cuando el usuario cancela; no se modifica el valor del formulario. */
  onCancel: () => void;
  /** Se llama con el archivo ya recortado (JPEG), listo para guardarse en el formulario. */
  onConfirm: (file: File) => void;
}

// Salida a 2x la resolución mínima exigida para dejar margen de calidad.
const OUTPUT_WIDTH = PHOTO_MIN_WIDTH * 2; // 708
const OUTPUT_HEIGHT = PHOTO_MIN_HEIGHT * 2; // 944
//const ASPECT = OUTPUT_WIDTH / OUTPUT_HEIGHT; // 3:4

/** Recortador manual con paneo (arrastrar) y zoom, con relación de aspecto fija 3:4. */
export default function ImageCropper({
  file,
  onCancel,
  onConfirm,
}: ImageCropperProps) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [imageReady, setImageReady] = useState(false);
  const [minScale, setMinScale] = useState(1);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // en px del canvas de salida
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]); 

  // Carga la imagen y calcula el zoom mínimo para "cubrir" el marco de salida.
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth < PHOTO_MIN_WIDTH || img.naturalHeight < PHOTO_MIN_HEIGHT) {
        setError(
          `La imagen es demasiado pequeña (${img.naturalWidth}x${img.naturalHeight}px). ` +
            `Se requieren al menos ${PHOTO_MIN_WIDTH}x${PHOTO_MIN_HEIGHT}px.`
        );
      }
      imageRef.current = img;
      const coverScale = Math.max(
        OUTPUT_WIDTH / img.naturalWidth,
        OUTPUT_HEIGHT / img.naturalHeight
      );
      setMinScale(coverScale);
      setScale(coverScale);
      setOffset({ x: 0, y: 0 });
      setImageReady(true);
    };
    img.onerror = () => setError("No se pudo cargar la imagen. Intenta con otro archivo.");
    img.src = objectUrl;
  }, [objectUrl]);*/

  useEffect(() => {
    let cancelled = false;
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      if (cancelled) return;
      if (
        img.naturalWidth < PHOTO_MIN_WIDTH ||
        img.naturalHeight < PHOTO_MIN_HEIGHT
      ) {
        setError(
          `La imagen es demasiado pequeña (${img.naturalWidth}x${img.naturalHeight}px). ` +
            `Se requieren al menos ${PHOTO_MIN_WIDTH}x${PHOTO_MIN_HEIGHT}px.`,
        );
      }
      imageRef.current = img;
      const coverScale = Math.max(
        OUTPUT_WIDTH / img.naturalWidth,
        OUTPUT_HEIGHT / img.naturalHeight,
      );
      setMinScale(coverScale);
      setScale(coverScale);
      setOffset({ x: 0, y: 0 });
      setImageReady(true);
    };

    img.onerror = () => {
      if (cancelled) return;
      setError("No se pudo cargar la imagen. Intenta con otro archivo.");
    };

    img.src = url;

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  //------

  const clampOffset = useCallback(
    (x: number, y: number, currentScale: number) => {
      const img = imageRef.current;
      if (!img) return { x: 0, y: 0 };
      const drawW = img.naturalWidth * currentScale;
      const drawH = img.naturalHeight * currentScale;
      const maxX = Math.max(0, (drawW - OUTPUT_WIDTH) / 2);
      const maxY = Math.max(0, (drawH - OUTPUT_HEIGHT) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, x)),
        y: Math.min(maxY, Math.max(-maxY, y)),
      };
    },
    [],
  );

  const draw = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
    ctx.fillStyle = "#EDEDED";
    ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const dx = (OUTPUT_WIDTH - drawW) / 2 + offset.x;
    const dy = (OUTPUT_HEIGHT - drawH) / 2 + offset.y;
    ctx.drawImage(img, dx, dy, drawW, drawH);
  }, [scale, offset]);

  useEffect(() => {
    if (imageReady) draw();
  }, [imageReady, draw]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageReady) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleFactor = OUTPUT_WIDTH / rect.width;
    const dxScreen = (e.clientX - dragStart.current.x) * scaleFactor;
    const dyScreen = (e.clientY - dragStart.current.y) * scaleFactor;
    const next = clampOffset(
      dragStart.current.offsetX + dxScreen,
      dragStart.current.offsetY + dyScreen,
      scale,
    );
    setOffset(next);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  const handleZoomChange = (value: number) => {
    setScale(value);
    setOffset((prev) => clampOffset(prev.x, prev.y, value));
  };

  const handleReset = () => {
    setScale(minScale);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirm = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("No se pudo generar la imagen recortada. Intenta de nuevo.");
          return;
        }
        const baseName = file.name.replace(/\.[^/.]+$/, "") || "fotografia";
        const cropped = new File([blob], `${baseName}-recorte.jpg`, {
          type: "image/jpeg",
        });
        onConfirm(cropped);
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <h3 className="text-base font-semibold text-slate-900">
          Recorta tu fotografía
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Arrastra para mover y usa el control de zoom para ajustar el encuadre
          (relación 3:4).
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="mx-auto mt-4 aspect-3/4 w-56 touch-none select-none overflow-hidden rounded-xl border border-slate-200 shadow-inner"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <canvas ref={previewCanvasRef} className="h-full w-full" />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ZoomIn
            className="h-4 w-4 shrink-0 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="range"
            aria-label="Zoom"
            min={minScale}
            max={minScale * 3}
            step={minScale / 100}
            value={scale}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            disabled={!imageReady}
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
            disabled={!imageReady}
            className="rounded-lg bg-[#004B87] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#003A68] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Usar esta foto
          </button>
        </div>
      </div>
    </div>
  );
}
