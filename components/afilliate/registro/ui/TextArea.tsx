"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/registro/cn";
import { countWords } from "@/lib/registro/validators";
import FieldShell from "./FieldShell";
import { inputBaseClass, inputErrorClass } from "./styles";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  /** Límite de palabras a mostrar como contador (no impone un maxLength de caracteres). */
  maxWords?: number;
  /** Valor actual, usado únicamente para calcular el contador de palabras en vivo. */
  currentValue?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, required, description, error, maxWords, currentValue, id, className, name, rows = 4, ...rest }, ref) => {
    const inputId = id ?? name;
    const wordCount = maxWords !== undefined ? countWords(currentValue ?? "") : undefined;
    const overLimit = wordCount !== undefined && maxWords !== undefined && wordCount > maxWords;

    return (
      <FieldShell
        label={label}
        required={required}
        description={description}
        error={error}
        htmlFor={inputId}
        trailing={
          maxWords !== undefined ? (
            <span className={cn("text-xs tabular-nums", overLimit ? "font-semibold text-red-600" : "text-slate-400")}>
              {wordCount}/{maxWords} palabras
            </span>
          ) : undefined
        }
      >
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          rows={rows}
          aria-invalid={!!error}
          className={cn(inputBaseClass, "resize-y", error && inputErrorClass, className)}
          {...rest}
        />
      </FieldShell>
    );
  }
);
TextArea.displayName = "TextArea";

export default TextArea;
