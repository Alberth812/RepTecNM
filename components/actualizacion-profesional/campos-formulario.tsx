"use client";

// @/components/formularios/campos-formulario.tsx
// Campos reutilizables para react-hook-form + shadcn/ui.
// Son genéricos sobre `control`, así `name` queda tipado (incluidas rutas de arreglos).
import { type ReactNode, useId } from "react";
import {
 type Control,
 Controller,
 type FieldValues,
 type Path,
} from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Envoltorio: etiqueta + ayuda + error */
/* -------------------------------------------------------------------------- */

type CampoProps = {
 id: string;
 label: string;
 required?: boolean;
 description?: string;
 error?: string;
 /** Usa <fieldset>/<legend> (grupos de radio o checkbox). */
 grupo?: boolean;
 className?: string;
 children: ReactNode;
};

const describedBy = (id: string, description?: string, error?: string) =>
 [description && `${id}-desc`, error && `${id}-error`]
 .filter(Boolean)
 .join(" ") || undefined;

export function Campo({
 id,
 label,
 required,
 description,
 error,
 grupo,
 className,
 children,
}: CampoProps) {
 const etiqueta = (
 <>
 {label}
 {required && (
 <span aria-hidden="true" className="text-destructive">
 {" "}
 *
 </span>
 )}
 </>
 );
 const ayuda = description ? (
 <p id={`${id}-desc`} className="text-muted-foreground text-sm">
 {description}
 </p>
 ) : null;
 const mensaje = error ? (
 <p id={`${id}-error`} role="alert" className="text-destructive text-sm">
 {error}
 </p>
 ) : null;

 if (grupo) {
 return (
 <fieldset
 className={cn("space-y-2", className)}
 aria-describedby={describedBy(id, description, error)}
 >
 <legend className="text-sm leading-snug font-medium">{etiqueta}</legend>
 {ayuda}
 {children}
 {mensaje}
 </fieldset>
 );
 }
 return (
 <div className={cn("space-y-2", className)}>
 <Label htmlFor={id} className="leading-snug">
 {etiqueta}
 </Label>
 {ayuda}
 {children}
 {mensaje}
 </div>
 );
}

type CampoBase<T extends FieldValues> = {
 control: Control<T>;
 name: Path<T>;
 label: string;
 description?: string;
 required?: boolean;
 className?: string;
};

/* -------------------------------------------------------------------------- */
/* Texto (input / textarea) */
/* -------------------------------------------------------------------------- */

export function CampoTexto<T extends FieldValues>({
 control,
 name,
 label,
 description,
 required,
 className,
 multiline,
 maxLength,
 rows = 4,
 placeholder,
}: CampoBase<T> & {
 multiline?: boolean;
 maxLength?: number;
 rows?: number;
 placeholder?: string;
}) {
 const id = useId();
 return (
 <Controller
 control={control}
 name={name}
 render={({ field, fieldState }) => {
 const error = fieldState.error?.message;
 const valor = (field.value as string | null | undefined) ?? "";
 const comunes = {
 id,
 name: field.name,
 value: valor,
 onBlur: field.onBlur,
 disabled: field.disabled,
 maxLength,
 placeholder,
 "aria-invalid": !!error,
 "aria-describedby": describedBy(id, description, error),
 };
 return (
 <Campo
 id={id}
 label={label}
 required={required}
 description={description}
 error={error}
 className={className}
 >
 {multiline ? (
 <>
 <Textarea
 {...comunes}
 ref={field.ref}
 rows={rows}
 onChange={field.onChange}
 />
 {maxLength && (
 <p className="text-muted-foreground text-right text-xs">
 {valor.length}/{maxLength}
 </p>
 )}
 </>
 ) : (
 <Input {...comunes} ref={field.ref} onChange={field.onChange} />
 )}
 </Campo>
 );
 }}
 />
 );
}

/* -------------------------------------------------------------------------- */
/* Número entero (vacío → undefined) */
/* -------------------------------------------------------------------------- */

export function CampoNumero<T extends FieldValues>({
 control,
 name,
 label,
 description,
 required,
 className,
 min,
 max,
 placeholder,
}: CampoBase<T> & { min?: number; max?: number; placeholder?: string }) {
 const id = useId();
 return (
 <Controller
 control={control}
 name={name}
 render={({ field, fieldState }) => {
 const error = fieldState.error?.message;
 const valor = field.value as number | null | undefined;
 return (
 <Campo
 id={id}
 label={label}
 required={required}
 description={description}
 error={error}
 className={className}
 >
 <Input
 id={id}
 name={field.name}
 ref={field.ref}
 type="number"
 inputMode="numeric"
 step={1}
 min={min}
 max={max}
 placeholder={placeholder}
 disabled={field.disabled}
 value={valor ?? ""}
 onBlur={field.onBlur}
 onChange={(e) =>
 field.onChange(
 e.target.value === "" ? undefined : Number(e.target.value),
 )
 }
 aria-invalid={!!error}
 aria-describedby={describedBy(id, description, error)}
 />
 </Campo>
 );
 }}
 />
 );
}

/* -------------------------------------------------------------------------- */
/* Mes (1–12) con <select> nativo: accesible y cómodo en móvil */
/* -------------------------------------------------------------------------- */

const MESES = [
 "Enero",
 "Febrero",
 "Marzo",
 "Abril",
 "Mayo",
 "Junio",
 "Julio",
 "Agosto",
 "Septiembre",
 "Octubre",
 "Noviembre",
 "Diciembre",
] as const;

export function CampoMes<T extends FieldValues>({
 control,
 name,
 label,
 description,
 required,
 className,
}: CampoBase<T>) {
 const id = useId();
 return (
 <Controller
 control={control}
 name={name}
 render={({ field, fieldState }) => {
 const error = fieldState.error?.message;
 const valor = field.value as number | null | undefined;
 return (
 <Campo
 id={id}
 label={label}
 required={required}
 description={description}
 error={error}
 className={className}
 >
 <select
 id={id}
 name={field.name}
 ref={field.ref}
 disabled={field.disabled}
 value={valor ?? ""}
 onBlur={field.onBlur}
 onChange={(e) =>
 field.onChange(
 e.target.value === "" ? undefined : Number(e.target.value),
 )
 }
 aria-invalid={!!error}
 aria-describedby={describedBy(id, description, error)}
 className={cn(
 "border-input bg-background h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs",
 "focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]",
 "aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
 )}
 >
 <option value="">Selecciona…</option>
 {MESES.map((mes, i) => (
 <option key={mes} value={i + 1}>
 {mes}
 </option>
 ))}
 </select>
 </Campo>
 );
 }}
 />
 );
}

/* -------------------------------------------------------------------------- */
/* Sí / No (boolean; sin responder = undefined) */
/* -------------------------------------------------------------------------- */

export function CampoSiNo<T extends FieldValues>({
 control,
 name,
 label,
 description,
 required,
 className,
 onCambio,
}: CampoBase<T> & { onCambio?: (valor: boolean) => void }) {
 const id = useId();
 return (
 <Controller
 control={control}
 name={name}
 render={({ field, fieldState }) => {
 const error = fieldState.error?.message;
 const valor = field.value as boolean | null | undefined;
 return (
 <Campo
 id={id}
 grupo
 label={label}
 required={required}
 description={description}
 error={error}
 className={className}
 >
 <RadioGroup
 name={field.name}
 value={valor == null ? "" : valor ? "si" : "no"}
 onValueChange={(v) => {
 field.onChange(v === "si");
 onCambio?.(v === "si");
 }}
 onBlur={field.onBlur}
 disabled={field.disabled}
 aria-orientation="horizontal"
 aria-invalid={!!error}
 className="flex gap-6"
 >
 <div className="flex items-center gap-2">
 <RadioGroupItem id={`${id}-si`} value="si" />
 <Label htmlFor={`${id}-si`}>Sí</Label>
 </div>
 <div className="flex items-center gap-2">
 <RadioGroupItem id={`${id}-no`} value="no" />
 <Label htmlFor={`${id}-no`}>No</Label>
 </div>
 </RadioGroup>
 </Campo>
 );
 }}
 />
 );
}

/* -------------------------------------------------------------------------- */
/* Checkboxes de selección múltiple (con opción exclusiva opcional) */
/* -------------------------------------------------------------------------- */

export function CampoChecks<T extends FieldValues>({
 control,
 name,
 label,
 description,
 required,
 className,
 opciones,
 exclusiva,
}: CampoBase<T> & {
 opciones: readonly { value: string; label: string }[];
 /** Valor incompatible con cualquier otro: al marcarlo desmarca el resto y viceversa. */
 exclusiva?: string;
}) {
 const id = useId();
 return (
 <Controller
 control={control}
 name={name}
 render={({ field, fieldState }) => {
 const error = fieldState.error?.message;
 const seleccion = (field.value as string[] | null | undefined) ?? [];

 const alternar = (valor: string, marcado: boolean) => {
 if (!marcado) {
 field.onChange(seleccion.filter((v) => v !== valor));
 } else if (valor === exclusiva) {
 field.onChange([valor]);
 } else {
 field.onChange([
 ...seleccion.filter((v) => v !== exclusiva),
 valor,
 ]);
 }
 };

 return (
 <Campo
 id={id}
 grupo
 label={label}
 required={required}
 description={description}
 error={error}
 className={className}
 >
 <div className="space-y-2" onBlur={field.onBlur}>
 {opciones.map((opcion) => (
 <div key={opcion.value} className="flex items-center gap-2">
 <Checkbox
 id={`${id}-${opcion.value}`}
 name={field.name}
 checked={seleccion.includes(opcion.value)}
 onCheckedChange={(c) => alternar(opcion.value, c === true)}
 aria-invalid={!!error}
 />
 <Label htmlFor={`${id}-${opcion.value}`}>
 {opcion.label}
 </Label>
 </div>
 ))}
 </div>
 </Campo>
 );
 }}
 />
 );
}
