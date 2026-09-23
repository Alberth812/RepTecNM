// components/publicaciones/input-tags.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * API de `InputTags`:
 *  - `value`: arreglo controlado de palabras clave (strings ya "crudas",
 *    la normalización final y definitiva la hace `palabrasClaveArraySchema`
 *    en el submit vía zodResolver).
 *  - `onChange(next)`: se invoca con el arreglo completo cada vez que se
 *    agrega o quita una palabra clave.
 *  - `onBlur`: opcional, para integrarse con `field.onBlur` de Controller.
 *  - `max`: tope de palabras clave (por defecto 15, igual que el esquema).
 *  - Enter agrega la palabra clave del input actual; Backspace con el
 *    input vacío borra la última; cada palabra clave se muestra como
 *    `Badge` con botón de eliminar.
 */
export interface InputTagsProps {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
}

/**
 * Normalización "de vista previa": mismo criterio (trim + minúsculas +
 * colapso de espacios) que la transformación de `singleKeywordSchema` en
 * `@/lib/validation/publicaciones`. Esto es solo para evitar duplicados
 * obvios mientras el usuario escribe; la validación autoritativa (incluida
 * la detección de duplicados tras normalizar) la hace Zod en el submit.
 */
function normalizeKeywordPreview(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

export function InputTags({
  id,
  value,
  onChange,
  onBlur,
  max = 15,
  placeholder,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: InputTagsProps) {
  const [draft, setDraft] = React.useState("");
  const atLimit = value.length >= max;

  function commitDraft() {
    const normalized = normalizeKeywordPreview(draft);
    setDraft("");

    if (!normalized) return;
    if (value.includes(normalized)) return;
    if (atLimit) return;

    onChange([...value, normalized]);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitDraft();
      return;
    }

    if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function handleRemove(tag: string) {
    onChange(value.filter((keyword) => keyword !== tag));
  }

  return (
    <div
      className={cn(
        "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pr-1 font-normal">
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => handleRemove(tag)}
              className="rounded-full p-0.5 hover:bg-muted-foreground/20"
              aria-label={`Eliminar palabra clave "${tag}"`}
            >
              <X className="size-3" />
            </button>
          )}
        </Badge>
      ))}

      <input
        id={id}
        type="text"
        value={draft}
        disabled={disabled || atLimit}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          commitDraft();
          onBlur?.();
        }}
        placeholder={value.length === 0 ? placeholder : undefined}
        aria-invalid={ariaInvalid}
        className="min-w-24 flex-1 border-0 bg-transparent p-0.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  );
}
