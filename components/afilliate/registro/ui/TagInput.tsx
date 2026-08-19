"use client";

import { KeyboardEvent, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/registro/cn";
import FieldShell from "./FieldShell";
import { inputBaseClass, inputErrorClass } from "./styles";

interface TagInputProps {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  value: string[];
  onChange: (next: string[]) => void;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
}

/** Captura de palabras clave (tags) como texto libre, una por una. */
export default function TagInput({
  label,
  required,
  description,
  error,
  value,
  onChange,
  min = 1,
  max = 10,
  minLength = 5,
  maxLength = 50,
}: TagInputProps) {
  const [draft, setDraft] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const addTag = () => {
    const tag = draft.trim();
    if (!tag) return;
    if (tag.length < minLength || tag.length > maxLength) {
      setLocalError(`Cada palabra clave debe tener entre ${minLength} y ${maxLength} caracteres.`);
      return;
    }
    if (value.length >= max) {
      setLocalError(`Puedes agregar máximo ${max} palabras clave.`);
      return;
    }
    if (value.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      setLocalError("Esa palabra clave ya fue agregada.");
      return;
    }
    setLocalError(null);
    onChange([...value, tag]);
    setDraft("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <FieldShell
      label={label}
      required={required}
      description={description}
      error={error ?? localError ?? undefined}
      trailing={
        <span className="text-xs tabular-nums text-slate-400">
          {value.length}/{max}
        </span>
      }
    >
      <div className={cn(inputBaseClass, "flex flex-wrap gap-1.5 py-2", (error || localError) && inputErrorClass)}>
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-[#004B87]/10 px-2 py-1 text-xs font-medium text-[#004B87]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Quitar ${tag}`}
              className="rounded-full hover:bg-[#004B87]/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {value.length < max && (
          <input
            type="text"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setLocalError(null);
            }}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={value.length === 0 ? "Escribe una palabra clave y presiona Enter" : "Agregar otra…"}
            className="min-w-[10rem] flex-1 border-none bg-transparent p-1 text-sm outline-none placeholder:text-slate-400"
          />
        )}
      </div>
      <p className="text-xs text-slate-400">
        Mínimo {min}, máximo {max}. Entre {minLength} y {maxLength} caracteres cada una.
      </p>
    </FieldShell>
  );
}
