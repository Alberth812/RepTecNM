// components/publicaciones/autores-field.tsx
"use client";

import {
  Controller,
  useFieldArray,
  type FieldArrayPath,
  type FieldValues,
  type Path,
  type UseFormReturn,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const MAX_AUTORES = 50;

/** Forma de cada autor, compartida entre el formulario de creación y el de edición. */
export interface AutorFormValue {
  nombres: string;
  apellidos: string;
  orden: number;
}

interface AutoresFieldProps<
  TFieldValues extends FieldValues & { autores: AutorFormValue[] },
> {
  form: UseFormReturn<TFieldValues>;
}

/**
 * Lista de autores. El orden (`orden`) NO es editable por el usuario en esta
 * primera versión (sin drag & drop): se calcula automáticamente a partir de
 * la posición en la lista, tanto al agregar como al quitar un autor, para
 * que siempre quede una secuencia 1..N sin huecos ni duplicados (requisito
 * de `autoresArraySchema`).
 *
 * Es genérico sobre `TFieldValues` (con tal de que tenga un campo `autores`
 * con esta forma) para poder reutilizarse tanto en "Crear publicación" como
 * en "Editar publicación", ya que ambos comparten `autoresArraySchema`.
 */
export function AutoresField<
  TFieldValues extends FieldValues & { autores: AutorFormValue[] },
>({ form }: AutoresFieldProps<TFieldValues>) {
  const { control, getValues, setValue, formState } = form;
  const autoresName = "autores" as FieldArrayPath<TFieldValues>;
  const autoresPath = "autores" as Path<TFieldValues>;

  const { fields, append, remove } = useFieldArray({
    control,
    name: autoresName,
  });

  // El error a nivel de arreglo (p. ej. "debe tener al menos 1 autor") puede
  // aparecer como `errors.autores.root.message` o `errors.autores.message`
  // según la versión de React Hook Form; se revisan ambos casos.
  const autoresErrors = formState.errors.autores as
    | { root?: { message?: string }; message?: string }
    | undefined;
  const listError = autoresErrors?.root?.message ?? autoresErrors?.message;

  function resequenceOrden() {
    const autores = getValues(autoresPath) as unknown as AutorFormValue[];
    autores.forEach((autor, index) => {
      if (autor.orden !== index + 1) {
        setValue(
          `autores.${index}.orden` as Path<TFieldValues>,
          (index + 1) as never,
          { shouldDirty: true, shouldValidate: false },
        );
      }
    });
  }

  function handleAppend() {
    append({ nombres: "", apellidos: "", orden: fields.length + 1 } as never);
  }

  function handleRemove(index: number) {
    remove(index);
    resequenceOrden();
  }

  return (
    <FieldGroup>
      {fields.map((fieldItem, index) => (
        <div
          key={fieldItem.id}
          className="flex items-start gap-3 rounded-md border border-input p-3"
        >
          <span className="mt-2.5 w-6 shrink-0 text-sm text-muted-foreground">
            {index + 1}.
          </span>

          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <Controller
              name={`autores.${index}.nombres` as Path<TFieldValues>}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nombres</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Nombre(s)"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name={`autores.${index}.apellidos` as Path<TFieldValues>}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Apellidos</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Apellido(s)"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-6 shrink-0"
            disabled={fields.length <= 1}
            onClick={() => handleRemove(index)}
            aria-label={`Eliminar autor ${index + 1}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      {listError && (
        <p className="text-sm font-medium text-destructive">{listError}</p>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={handleAppend}
        disabled={fields.length >= MAX_AUTORES}
      >
        <Plus className="size-4" />
        Agregar autor
      </Button>
    </FieldGroup>
  );
}
