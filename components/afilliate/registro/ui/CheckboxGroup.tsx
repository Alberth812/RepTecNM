"use client";

import { cn } from "@/lib/registro/cn";
import FieldShell from "./FieldShell";

interface CheckboxGroupProps {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  columns?: 1 | 2;
}

/** Grupo de opciones de selección múltiple (equivalente a `type: "checkbox"` del esquema). */
export default function CheckboxGroup({
  label,
  required,
  description,
  error,
  options,
  value,
  onChange,
  columns = 2,
}: CheckboxGroupProps) {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <FieldShell label={label} required={required} description={description} error={error}>
      <div className={cn("grid gap-2", columns === 2 ? "sm:grid-cols-2" : "grid-cols-1")}>
        {options.map((option) => {
          const checked = value.includes(option);
          return (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition",
                checked
                  ? "border-[#004B87] bg-[#004B87]/5 text-slate-900"
                  : "border-slate-300 text-slate-700 hover:border-slate-400"
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(option)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#004B87]"
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </FieldShell>
  );
}
