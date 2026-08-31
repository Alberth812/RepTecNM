import { PropsWithChildren, ReactNode } from "react";

interface FieldShellProps {
  label: ReactNode;
  required?: boolean;
  description?: ReactNode;
  error?: string;
  htmlFor?: string;
  trailing?: ReactNode;
}

/** Envuelve un control de formulario con etiqueta, descripción y mensaje de error consistentes. */
export default function FieldShell({
  label,
  required,
  description,
  error,
  htmlFor,
  trailing,
  children}: PropsWithChildren<FieldShellProps>) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
          {label}
          {required && (
            <span className="ml-0.5 text-[#004B87]" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {trailing}
      </div>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      {children}
      {error && (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
