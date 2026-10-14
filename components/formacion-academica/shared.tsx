// @/components/formacion-academica/shared.tsx

"use client";

import type { Control, FieldPath } from "react-hook-form";
import { Controller } from "react-hook-form";

import {
 Field,
 FieldDescription,
 FieldError,
 FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";

import type {
 FormacionAcademica,
 FormacionAcademicaInput,
} from "@/lib/validation/formacion-academica";

export type Institucion = {
 id: string;
 nombre: string;
};

type FieldName = FieldPath<FormacionAcademica>;

type SharedProps = {
 control: Control<FormacionAcademicaInput>;
 name: FieldName;
 label: string;
 description?: string;
};

// ---------------------------------------------------------------------------
// type: "text"
// ---------------------------------------------------------------------------

export function TextFormField({
 control,
 name,
 label,
 description,
 placeholder,
}: SharedProps & { placeholder?: string }) {
 return (
 <Controller
 control={control}
 name={name}
 render={({ field, fieldState }) => (
 <Field data-invalid={fieldState.invalid}>
 <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

 <Input
 {...field}
 id={field.name}
 aria-invalid={fieldState.invalid}
 placeholder={placeholder}
 value={(field.value as string) ?? ""}
 />

 {description ? (
 <FieldDescription>{description}</FieldDescription>
 ) : null}

 {fieldState.invalid ? (
 <FieldError errors={[fieldState.error]} />
 ) : null}
 </Field>
 )}
 />
 );
}

// ---------------------------------------------------------------------------
// type: "number" (años académicos) — nunca mayor al año actual
// (validado en Zod)
// ---------------------------------------------------------------------------
export function AnioFormField({
 control,
 name,
 label,
 description,
}: SharedProps) {
 return (
 <Controller
 control={control}
 name={name}
 render={({ field, fieldState }) => (
 <Field data-invalid={fieldState.invalid}>
 <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

 <Input
 {...field}
 id={field.name}
 type="number"
 inputMode="numeric"
 placeholder="AAAA"
 aria-invalid={fieldState.invalid}
 value={(field.value as number | null | undefined) ?? ""}
 onChange={(e) => {
 const raw = e.target.value;
 field.onChange(raw === "" ? null : Number(raw));
 }}
 />

 {description ? (
 <FieldDescription>{description}</FieldDescription>
 ) : null}

 {fieldState.invalid ? (
 <FieldError errors={[fieldState.error]} />
 ) : null}
 </Field>
 )}
 />
 );
}

// ---------------------------------------------------------------------------
// type: "number" (meses, no es un año) — entero no negativo
// ---------------------------------------------------------------------------
export function NumberFormField({
 control,
 name,
 label,
 description,
}: SharedProps) {
 return (
 <Controller
 control={control}
 name={name}
 render={({ field, fieldState }) => (
 <Field data-invalid={fieldState.invalid}>
 <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

 <Input
 {...field}
 id={field.name}
 type="number"
 min={0}
 inputMode="numeric"
 aria-invalid={fieldState.invalid}
 value={(field.value as number | null | undefined) ?? ""}
 onChange={(e) => {
 const raw = e.target.value;
 field.onChange(raw === "" ? null : Number(raw));
 }}
 />

 {description ? (
 <FieldDescription>{description}</FieldDescription>
 ) : null}

 {fieldState.invalid ? (
 <FieldError errors={[fieldState.error]} />
 ) : null}
 </Field>
 )}
 />
 );
}

// ---------------------------------------------------------------------------
// type: "catalog" (institucion)
// Select poblado desde el catálogo de instituciones
// ---------------------------------------------------------------------------
export function InstitucionFormField({
 control,
 name,
 label,
 instituciones,
}: SharedProps & {
 instituciones: Institucion[];
}) {
 return (
 <Controller
 control={control}
 name={name}
 render={({ field, fieldState }) => {
 const institucionSeleccionada = instituciones.find(
 (inst) => String(inst.id) === String(field.value),
 );

 return (
 <Field data-invalid={fieldState.invalid}>
 <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

 <Select
 value={field.value != null ? String(field.value) : ""}
 onValueChange={field.onChange}
 >
 <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
 <SelectValue placeholder="Selecciona una institución">
 {institucionSeleccionada?.nombre}
 </SelectValue>
 </SelectTrigger>

 <SelectContent>
 {instituciones.map((inst) => (
 <SelectItem key={inst.id} value={inst.id}>
 {inst.nombre}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>

 {fieldState.invalid ? (
 <FieldError errors={[fieldState.error]} />
 ) : null}
 </Field>
 );
 }}
 />
 );
}

// ---------------------------------------------------------------------------
// type: "boolean" — Sí/No
//
// Permite estado "sin responder" para campos opcionales,
// a diferencia de un <Switch> que solo tiene dos estados.
// ---------------------------------------------------------------------------
export function YesNoField({
 control,
 name,
 label,
 description,
 onChangeExtra,
}: SharedProps & {
 onChangeExtra?: (value: boolean) => void;
}) {
 return (
 <Controller
 control={control}
 name={name}
 render={({ field, fieldState }) => {
 const value = field.value as boolean | null | undefined;
 const groupName = String(name);

 return (
 <Field data-invalid={fieldState.invalid} className="space-y-2">
 <FieldLabel>{label}</FieldLabel>

 <RadioGroup
 className="flex gap-4"
 value={value === true ? "si" : value === false ? "no" : ""}
 onValueChange={(v) => {
 const next = v === "si";

 field.onChange(next);
 onChangeExtra?.(next);
 }}
 onBlur={field.onBlur}
 aria-invalid={fieldState.invalid}
 >
 <div className="flex items-center gap-2">
 <RadioGroupItem id={`${groupName}-si`} value="si" />
 <Label htmlFor={`${groupName}-si`} className="font-normal">
 Sí
 </Label>
 </div>

 <div className="flex items-center gap-2">
 <RadioGroupItem id={`${groupName}-no`} value="no" />
 <Label htmlFor={`${groupName}-no`} className="font-normal">
 No
 </Label>
 </div>
 </RadioGroup>

 {description ? (
 <FieldDescription>{description}</FieldDescription>
 ) : null}

 {fieldState.invalid ? (
 <FieldError errors={[fieldState.error]} />
 ) : null}
 </Field>
 );
 }}
 />
 );
}

// ---------------------------------------------------------------------------
// type: "radio" — selección única entre opciones controladas
// ---------------------------------------------------------------------------
export function RadioEnumField({
 control,
 name,
 label,
 description,
 options,
 layout = "row",
 onChangeExtra,
}: SharedProps & {
 options: { value: string; label: string }[];
 layout?: "row" | "column";
 onChangeExtra?: (value: string) => void;
}) {
 return (
 <Controller
 control={control}
 name={name}
 render={({ field, fieldState }) => {
 const groupName = String(name);

 return (
 <Field data-invalid={fieldState.invalid} className="space-y-2">
 <FieldLabel>{label}</FieldLabel>

 <RadioGroup
 className={
 layout === "row"
 ? "flex flex-wrap gap-4"
 : "flex flex-col gap-2"
 }
 value={(field.value as string | null | undefined) ?? ""}
 onValueChange={(v) => {
 field.onChange(v);
 onChangeExtra?.(v);
 }}
 onBlur={field.onBlur}
 aria-invalid={fieldState.invalid}
 >
 {options.map((opt) => (
 <div key={opt.value} className="flex items-center gap-2">
 <RadioGroupItem
 id={`${groupName}-${opt.value}`}
 value={opt.value}
 />

 <Label
 htmlFor={`${groupName}-${opt.value}`}
 className="font-normal"
 >
 {opt.label}
 </Label>
 </div>
 ))}
 </RadioGroup>

 {description ? (
 <FieldDescription>{description}</FieldDescription>
 ) : null}

 {fieldState.invalid ? (
 <FieldError errors={[fieldState.error]} />
 ) : null}
 </Field>
 );
 }}
 />
 );
}

// ---------------------------------------------------------------------------
// type: "checkbox" — selección múltiple,
// se persiste como array de códigos
// ---------------------------------------------------------------------------
export function CheckboxGroupField({
 control,
 name,
 label,
 description,
 options,
 onChangeExtra,
}: SharedProps & {
 options: { value: string; label: string }[];
 onChangeExtra?: (values: string[]) => void;
}) {
 return (
 <Controller
 control={control}
 name={name}
 render={({ field, fieldState }) => {
 const values: string[] =
 (field.value as string[] | null | undefined) ?? [];

 const groupName = String(name);

 function toggle(optionValue: string, checked: boolean) {
 const next = checked
 ? [...values, optionValue]
 : values.filter((v) => v !== optionValue);

 field.onChange(next);
 onChangeExtra?.(next);
 }

 return (
 <Field data-invalid={fieldState.invalid} className="space-y-2">
 <FieldLabel>{label}</FieldLabel>

 <div className="flex flex-col gap-2">
 {options.map((opt) => (
 <div key={opt.value} className="flex items-center gap-2">
 <Checkbox
 id={`${groupName}-${opt.value}`}
 checked={values.includes(opt.value)}
 onCheckedChange={(checked) =>
 toggle(opt.value, checked === true)
 }
 aria-invalid={fieldState.invalid}
 />

 <Label
 htmlFor={`${groupName}-${opt.value}`}
 className="font-normal"
 >
 {opt.label}
 </Label>
 </div>
 ))}
 </div>

 {description ? (
 <FieldDescription>{description}</FieldDescription>
 ) : null}

 {fieldState.invalid ? (
 <FieldError errors={[fieldState.error]} />
 ) : null}
 </Field>
 );
 }}
 />
 );
}

// ---------------------------------------------------------------------------
// Calificación 1–5 usada en la matriz de
// "motivos de elección de institución"
// ---------------------------------------------------------------------------
export function RatingSelectField({
 control,
 name,
 label,
}: Omit<SharedProps, "label"> & {
 label?: string;
}) {
 return (
 <Controller
 control={control}
 name={name}
 render={({ field, fieldState }) => (
 <Field
 data-invalid={fieldState.invalid}
 className="flex flex-1 items-center justify-between gap-4 space-y-0"
 >
 {label ? (
 <FieldLabel className="font-normal">{label}</FieldLabel>
 ) : null}

 <Select
 value={field.value != null ? String(field.value) : ""}
 onValueChange={(v) => field.onChange(Number(v))}
 >
 <SelectTrigger
 className="w-20 shrink-0"
 aria-invalid={fieldState.invalid}
 >
 <SelectValue placeholder="—" />
 </SelectTrigger>

 <SelectContent>
 {[1, 2, 3, 4, 5].map((n) => (
 <SelectItem key={n} value={String(n)}>
 {n}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>

 {fieldState.invalid ? (
 <FieldError errors={[fieldState.error]} />
 ) : null}
 </Field>
 )}
 />
 );
}
