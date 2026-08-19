"use client";

import { cn } from "@/lib/registro/cn";
import FieldShell from "./FieldShell";

interface RadioGroupProps {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  name: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  columns?: 1 | 2;
}

/** Grupo de opciones de selección única (equivalente a `type: "radio"` del esquema). */
export default function RadioGroup({
  label,
  required,
  description,
  error,
  name,
  options,
  value,
  onChange,
  columns = 2,
}: RadioGroupProps) {
  return (
    <FieldShell label={label} required={required} description={description} error={error}>
      <div className={cn("grid gap-2", columns === 2 ? "sm:grid-cols-2" : "grid-cols-1")}>
        {options.map((option) => {
          const checked = value === option;
          return (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition",
                checked
                  ? "border-[#004B87] bg-[#004B87]/5 text-slate-900"
                  : "border-slate-300 text-slate-700 hover:border-slate-400"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
                className="h-4 w-4 shrink-0 accent-[#004B87]"
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </FieldShell>
  );
}
