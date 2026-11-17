"use client";

import { cn } from "@/lib/registro/cn";
import FieldShell from "./FieldShell";
import { inputBaseClass, inputErrorClass } from "./styles";

interface SelectInputProps {
 label: string;
 required?: boolean;
 description?: string;
 error?: string;
 name: string;
 options: readonly string[];
 value: string;
 onChange: (value: string) => void;
 placeholder?: string;
}

export default function SelectInput({
 label,
 required,
 description,
 error,
 name,
 options,
 value,
 onChange,
 placeholder = "Selecciona una opción",
}: SelectInputProps) {
 return (
 <FieldShell label={label} required={required} description={description} error={error} htmlFor={name}>
 <select
 id={name}
 name={name}
 value={value}
 onChange={(e) => onChange(e.target.value)}
 aria-invalid={!!error}
 className={cn(inputBaseClass, "pr-8", error && inputErrorClass)}
 >
 <option value="" disabled>
 {placeholder}
 </option>
 {options.map((option) => (
 <option key={option} value={option}>
 {option}
 </option>
 ))}
 </select>
 </FieldShell>
 );
}
