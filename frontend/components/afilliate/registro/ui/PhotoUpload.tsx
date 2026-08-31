"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { UserRound } from "lucide-react";
import {
  MAX_PHOTO_SIZE_BYTES,
  PHOTO_MIME_TYPES,
  formatBytes} from "@/lib/registro/validators";
import FieldShell from "./FieldShell";
import ImageCropper from "./ImageCropper";

interface PhotoUploadProps {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  value: File | null;
  onChange: (file: File | null) => void;
}

/** Sube y recorta la fotografía de perfil (JPG/PNG, máx. 5MB, recorte 3:4). */
export default function PhotoUpload({
  label,
  required,
  description,
  error,
  value,
  onChange}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selectError, setSelectError] = useState<string | null>(null);
  /* const previewUrl = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]); */

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    if (
      !PHOTO_MIME_TYPES.includes(file.type as (typeof PHOTO_MIME_TYPES)[number])
    ) {
      setSelectError("Formato inválido. Solo se aceptan JPG o PNG.");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setSelectError(
        `El archivo no debe superar ${formatBytes(MAX_PHOTO_SIZE_BYTES)}.`,
      );
      return;
    }
    setSelectError(null);
    setPendingFile(file);
  };

  return (
    <FieldShell
      label={label}
      required={required}
      description={description}
      error={error ?? selectError ?? undefined}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
      />
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-18 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-300 bg-slate-100">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Vista previa de la fotografía"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound className="h-8 w-8 text-slate-300" />
          )}
        </div>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#004B87] hover:text-[#004B87]"
          >
            {value ? "Cambiar fotografía" : "Subir fotografía"}
          </button>
          <p className="text-xs text-slate-400">
            JPG o PNG · máx. 5MB · retrato, rostro visible
          </p>
        </div>
      </div>

      {pendingFile && (
        <ImageCropper
          key={`${pendingFile.name}-${pendingFile.size}-${pendingFile.lastModified}`}
          file={pendingFile}
          onCancel={() => {
            setPendingFile(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          onConfirm={(cropped) => {
            onChange(cropped);
            setPendingFile(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      )}
    </FieldShell>
  );
}
