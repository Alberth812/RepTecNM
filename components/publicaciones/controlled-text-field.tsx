// components/publicaciones/controlled-text-field.tsx
"use client";

import {
 Controller,
 type Control,
 type FieldPath,
 type FieldValues,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import {
 Field,
 FieldDescription,
 FieldError,
 FieldLabel,
} from "@/components/ui/field";

/**
 * Campo de texto simple (título, DOI, URL, ISBN, ISSN, revista, editorial,
 * tipoOtro, etc.) que sigue el patrón oficial de shadcn/ui para
 * React Hook Form + `<Field />`:
 *
 * https://ui.shadcn.com/docs/forms/react-hook-form
 *
 * Los campos "opcionales" del esquema (doi, url, isbn, issn, ...) llegan
 * como `string | null | undefined`, por eso el `value` del input cae a
 * cadena vacía cuando el valor es `null`/`undefined`.
 */
interface ControlledTextFieldProps<TFieldValues extends FieldValues> {
 control: Control<TFieldValues>;
 name: FieldPath<TFieldValues>;
 label: string;
 placeholder?: string;
 description?: string;
 type?: "text" | "url";
}

export function ControlledTextField<TFieldValues extends FieldValues>({
 control,
 name,
 label,
 placeholder,
 description,
 type = "text",
}: ControlledTextFieldProps<TFieldValues>) {
 return (
 <Controller
 name={name}
 control={control}
 render={({ field, fieldState }) => (
 <Field data-invalid={fieldState.invalid}>
 <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
 <Input
 id={field.name}
 name={field.name}
 ref={field.ref}
 type={type}
 value={(field.value as string | null | undefined) ?? ""}
 onChange={(event) => field.onChange(event.target.value)}
 onBlur={field.onBlur}
 placeholder={placeholder}
 aria-invalid={fieldState.invalid}
 />
 {description && !fieldState.invalid && (
 <FieldDescription>{description}</FieldDescription>
 )}
 {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
 </Field>
 )}
 />
 );
}
