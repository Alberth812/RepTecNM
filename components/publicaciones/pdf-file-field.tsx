// components/publicaciones/pdf-file-field.tsx
"use client";

import * as React from "react";
import { FileText, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import { cn } from "@/lib/utils";

//
//
export interface PdfFileFieldProps {
 id?: string;
 /** El archivo actual, o `null`/`undefined` si no hay ninguno seleccionado. */
 value: File | null | undefined;
 /** Se invoca con el nuevo `File`, o `undefined` al eliminar. */
 onChange: (file: File | undefined) => void;
 onBlur?: () => void;
 disabled?: boolean;
 className?: string;
 "aria-invalid"?: boolean;
}

/**
 * Input de archivo PDF:
 * - input[type=file] oculto (accesible vía botón) con
 * accept="application/pdf,.pdf".
 * - Seleccionar / reemplazar / eliminar.
 * - Vista previa local con `URL.createObjectURL`, abierta en una pestaña
 * nueva (nunca se sube el archivo por esto: solo lee bytes locales).
 * - El Object URL se revoca cada vez que cambia el archivo y al desmontar.
 * - No valida el tamaño máximo aquí: eso lo hace `pdfFileSchema` vía
 * zodResolver, y el componente padre re-dispara la validación tras cada
 * selección para que el error aparezca de inmediato.
 */
export function PdfFileField({
 id,
 value,
 onChange,
 onBlur,
 disabled,
 className,
 "aria-invalid": ariaInvalid,
}: PdfFileFieldProps) {
 const inputRef = React.useRef<HTMLInputElement>(null);
 const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

 React.useEffect(() => {
 if (!value) {
 setPreviewUrl(null);
 return;
 }

 const url = URL.createObjectURL(value);
 setPreviewUrl(url);

 // Revoca el Object URL anterior tanto al cambiar `value` como al
 // desmontar el componente.
 return () => {
 URL.revokeObjectURL(url);
 };
 }, [value]);

 function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
 const file = event.target.files?.[0];
 onChange(file);
 // Permite volver a seleccionar el mismo archivo más adelante (si no se
 // limpia, el navegador no dispara `onChange` para un archivo idéntico).
 event.target.value = "";
 }

 function handleRemove() {
 onChange(undefined);
 if (inputRef.current) {
 inputRef.current.value = "";
 }
 }

 return (
 <div className={cn("space-y-2", className)}>
 <input
 ref={inputRef}
 id={id}
 type="file"
 accept="application/pdf,.pdf"
 className="sr-only"
 disabled={disabled}
 onChange={handleFileChange}
 onBlur={onBlur}
 aria-invalid={ariaInvalid}
 />

 {!value ? (
 <Button
 type="button"
 variant="outline"
 disabled={disabled}
 onClick={() => inputRef.current?.click()}
 >
 <Upload className="size-4" />
 Seleccionar PDF
 </Button>
 ) : (
 <div className="flex items-center gap-3 rounded-md border border-input p-3">
 <FileText
 className="size-5 shrink-0 text-muted-foreground"
 aria-hidden
 />
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-medium" title={value.name}>
 {value.name}
 </p>
 <p className="text-xs text-muted-foreground">
 {formatBytes(value.size)}
 </p>
 </div>
 <div className="flex shrink-0 items-center gap-1">
 {previewUrl && (
 <Button
 type="button"
 variant="ghost"
 size="sm"
 nativeButton={false}
 render={
 <a
 href={previewUrl}
 target="_blank"
 rel="noopener noreferrer"
 />
 }
 >
 Ver
 </Button>
 )}
 <Button
 type="button"
 variant="outline"
 size="sm"
 disabled={disabled}
 onClick={() => inputRef.current?.click()}
 >
 Reemplazar
 </Button>
 <Button
 type="button"
 variant="ghost"
 size="icon"
 disabled={disabled}
 onClick={handleRemove}
 aria-label="Eliminar archivo PDF"
 >
 <X className="size-4" />
 </Button>
 </div>
 </div>
 )}
 </div>
 );
}
