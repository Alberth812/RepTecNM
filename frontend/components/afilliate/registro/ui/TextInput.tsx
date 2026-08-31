"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/registro/cn";
import FieldShell from "./FieldShell";
import { inputBaseClass, inputErrorClass } from "./styles";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, required, description, error, id, className, name, ...rest }, ref) => {
    const inputId = id ?? name;
    return (
      <FieldShell label={label} required={required} description={description} error={error} htmlFor={inputId}>
        <input
          ref={ref}
          id={inputId}
          name={name}
          aria-invalid={!!error}
          className={cn(inputBaseClass, error && inputErrorClass, className)}
          {...rest}
        />
      </FieldShell>
    );
  }
);
TextInput.displayName = "TextInput";

export default TextInput;
