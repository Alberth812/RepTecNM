"use client";

import { useRef } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/registro/cn";
import { formatBytes } from "@/lib/registro/validators";
import FieldShell from "./FieldShell";

interface FileUploadProps {
 label: string;
 required?: boolean;
 description?: string;
 error?: string;
 value: File | null;
 onChange: (file: File | null) => void;
 accept: string;
 acceptedLabel: string;
 maxSizeBytes: number;
}

export default function FileUpload({
 label,
 required,
 description,
 error,
 value,
 onChange,
 accept,
 acceptedLabel,
 maxSizeBytes,
}: FileUploadProps) {
 const inputRef = useRef<HTMLInputElement>(null);

 return (
 <FieldShell label={label} required={required} description={description} error={error}>
 <input
 ref={inputRef}
 type="file"
 accept={accept}
 className="hidden"
 onChange={(e) => onChange(e.target.files?.[0] ?? null)}
 />
 {value ? (
 <div
 className={cn(
 "flex items-center justify-between rounded-lg border px-3 py-2.5",
 error ? "border-red-400 bg-red-50/40" : "border-slate-300 bg-slate-50"
 )}
 >
 <div className="flex min-w-0 items-center gap-2.5">
 <FileText className="h-5 w-5 shrink-0 text-[#004B87]" />
 <div className="min-w-0">
 <p className="truncate text-sm font-medium text-slate-800">{value.name}</p>
 <p className="text-xs text-slate-500">{formatBytes(value.size)}</p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => {
 onChange(null);
 if (inputRef.current) inputRef.current.value = "";
 }}
 className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
 aria-label="Quitar archivo"
 >
 <X className="h-4 w-4" />
 </button>
 </div>
 ) : (
 <button
 type="button"
 onClick={() => inputRef.current?.click()}
 className={cn(
 "flex w-full flex-col items-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition hover:border-[#004B87] hover:bg-[#004B87]/5",
 error ? "border-red-300" : "border-slate-300"
 )}
 >
 <UploadCloud className="h-6 w-6 text-slate-400" />
 <span className="text-sm font-medium text-[#004B87]">Seleccionar archivo</span>
 <span className="text-xs text-slate-400">
 {acceptedLabel} · máx. {formatBytes(maxSizeBytes)}
 </span>
 </button>
 )}
 </FieldShell>
 );
}
