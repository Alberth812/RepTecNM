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

  /** Límite de palabras a mostrar como contador. */
  maxWords?: number;

  /** Límite de caracteres a mostrar como contador. */
  maxChars?: number;

  /** Valor actual, usado para calcular los contadores en vivo. */
  currentValue?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      required,
      description,
      error,
      maxWords,
      maxChars,
      currentValue,
      id,
      className,
      name,
      rows = 4,
      ...rest
    },
    ref,
  ) => {
    const inputId = id ?? name;
    const value = currentValue ?? "";

    const wordCount = maxWords !== undefined ? countWords(value) : undefined;

    const charCount = maxChars !== undefined ? value.length : undefined;

    const overWordLimit =
      wordCount !== undefined && maxWords !== undefined && wordCount > maxWords;

    const overCharLimit =
      charCount !== undefined && maxChars !== undefined && charCount > maxChars;

    return (
      <FieldShell
        label={label}
        required={required}
        description={description}
        error={error}
        htmlFor={inputId}
        trailing={
          maxWords !== undefined || maxChars !== undefined ? (
            <div className="flex items-center gap-3 text-xs tabular-nums">
              {maxWords !== undefined && (
                <span
                  className={cn(
                    overWordLimit
                      ? "font-semibold text-red-600"
                      : "text-slate-400",
                  )}
                >
                  {wordCount}/{maxWords} palabras
                </span>
              )}

              {maxWords !== undefined && maxChars !== undefined && (
                <span className="text-slate-300">|</span>
              )}

              {maxChars !== undefined && (
                <span
                  className={cn(
                    overCharLimit
                      ? "font-semibold text-red-600"
                      : "text-slate-400",
                  )}
                >
                  {charCount}/{maxChars} caracteres
                </span>
              )}
            </div>
          ) : undefined
        }
      >
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          rows={rows}
          aria-invalid={!!error}
          className={cn(
            inputBaseClass,
            "resize-y",
            error && inputErrorClass,
            className,
          )}
          {...rest}
        />
      </FieldShell>
    );
  },
);

TextArea.displayName = "TextArea";

export default TextArea;
