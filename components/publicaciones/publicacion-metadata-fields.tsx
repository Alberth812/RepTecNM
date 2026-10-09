// components/publicaciones/publicacion-metadata-fields.tsx
"use client";

import {
  Controller,
  type FieldValues,
  type Path,
  type UseFormReturn,
} from "react-hook-form";

import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";

import { ControlledTextField } from "@/components/publicaciones/controlled-text-field";
import {
  AutoresField,
  type AutorFormValue,
} from "@/components/publicaciones/autores-field";
import { InputTags } from "@/components/publicaciones/input-tags";

import { TIPO_PUBLICACION_OPTIONS } from "@/lib/publicaciones/schemas/tipo-publicacion-labels";
import {
  MIN_ANIO_PUBLICACION,
  TipoPublicacion,
} from "@/lib/validation/publicaciones";
import type { PublicacionMetadataFormValues } from "@/lib/publicaciones/schemas/publicacion-metadata-form-values";

const CURRENT_YEAR = new Date().getFullYear();

//
interface PublicacionMetadataFieldsProps<
  TFieldValues extends FieldValues &
    PublicacionMetadataFormValues & { autores: AutorFormValue[] },
> {
  form: UseFormReturn<TFieldValues>;
}

/**
 * Todos los campos de metadatos comunes a "Crear publicación" y
 * "Editar publicación" (título, descripción, tipo, año, identificadores,
 * autores y palabras clave). El formulario que lo use agrega por su cuenta
 * lo que le sea propio: el PDF y el checkbox de descargo en creación, o la
 * tarjeta de solo lectura del documento en edición.
 *
 * Genérico sobre `TFieldValues` para funcionar con ambos `useForm`.
 */
export function PublicacionMetadataFields<
  TFieldValues extends FieldValues &
    PublicacionMetadataFormValues & { autores: AutorFormValue[] },
>({ form }: PublicacionMetadataFieldsProps<TFieldValues>) {
  const { control, watch } = form;
  const tipoSeleccionado = watch("tipo" as Path<TFieldValues>);

  return (
    <>
      <FieldSet>
        <FieldLegend>Información general</FieldLegend>
        <FieldGroup>
          <ControlledTextField
            control={control}
            name={"titulo" as Path<TFieldValues>}
            label="Título"
            placeholder="Título de la publicación"
          />

          <Controller
            name={"descripcion" as Path<TFieldValues>}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
                <Textarea
                  id={field.name}
                  rows={5}
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                  placeholder="Resumen de la publicación (10 a 1,800 caracteres)"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name={"tipo" as Path<TFieldValues>}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Tipo de publicación
                  </FieldLabel>
                  <Select
                    value={field.value as string}
                    onValueChange={field.onChange}
                    items={TIPO_PUBLICACION_OPTIONS}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_PUBLICACION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name={"anioPublicacion" as Path<TFieldValues>}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Año de publicación
                  </FieldLabel>
                  <input
                    id={field.name}
                    type="number"
                    inputMode="numeric"
                    min={MIN_ANIO_PUBLICACION}
                    max={CURRENT_YEAR}
                    value={
                      Number.isFinite(field.value as number)
                        ? (field.value as number)
                        : ""
                    }
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? undefined
                          : Number(event.target.value),
                      )
                    }
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {tipoSeleccionado === TipoPublicacion.OTRO && (
            <ControlledTextField
              control={control}
              name={"tipoOtro" as Path<TFieldValues>}
              label='Especifique "Otro"'
              placeholder="Describe el tipo de publicación (3 a 50 caracteres)"
            />
          )}
        </FieldGroup>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Identificadores y enlaces</FieldLegend>
        <FieldDescription>Todos estos campos son opcionales.</FieldDescription>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <ControlledTextField
              control={control}
              name={"doi" as Path<TFieldValues>}
              label="DOI"
              placeholder="10.1000/xyz123"
              description="También acepta enlaces doi.org."
            />
            <ControlledTextField
              control={control}
              name={"url" as Path<TFieldValues>}
              label="URL de acceso"
              type="url"
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ControlledTextField
              control={control}
              name={"isbn" as Path<TFieldValues>}
              label="ISBN-13"
            />
            <ControlledTextField
              control={control}
              name={"issn" as Path<TFieldValues>}
              label="ISSN"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ControlledTextField
              control={control}
              name={"revistaCongreso" as Path<TFieldValues>}
              label="Revista o congreso"
            />
            <ControlledTextField
              control={control}
              name={"editorial" as Path<TFieldValues>}
              label="Editorial"
            />
          </div>
        </FieldGroup>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Autores</FieldLegend>
        <AutoresField form={form} />
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Palabras clave</FieldLegend>
        <Controller
          name={"palabrasClave" as Path<TFieldValues>}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Palabras clave</FieldLabel>
              <InputTags
                id={field.name}
                value={field.value as string[]}
                onChange={field.onChange}
                onBlur={field.onBlur}
                max={15}
                placeholder="Escribe y presiona Enter…"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                {(field.value as string[]).length}/15 palabras clave. Enter
                agrega, sin duplicados.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldSet>
    </>
  );
}
