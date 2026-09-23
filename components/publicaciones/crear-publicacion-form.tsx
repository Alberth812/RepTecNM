// components/publicaciones/crear-publicacion-form.tsx
"use client";

/**
 * Formulario "Crear publicación".
 *
 * Uso:
 *   <CrearPublicacionForm onSuccess={(publicacion) => router.push(`/publicaciones/${publicacion.id}`)} />
 *
 * Requiere que el componente `field` de shadcn/ui ya esté agregado:
 *   pnpm dlx shadcn@latest add field
 * (junto con button, input, textarea, checkbox, select y badge, que ya
 * mencionas tener instalados).
 */

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";

import { PublicacionMetadataFields } from "@/components/publicaciones/publicacion-metadata-fields";
import { PdfFileField } from "@/components/publicaciones/pdf-file-field";

import {
  crearPublicacionFormSchema,
  type CrearPublicacionFormInput,
  type CrearPublicacionFormOutput,
} from "@/lib/publicaciones/schemas/crear-publicacion-form-schema";
import { useCrearPublicacion } from "@/lib/publicaciones/hooks/use-crear-publicacion";
import { ApiRequestError } from "@/lib/publicaciones/api/publicaciones-client";
import { TipoPublicacion } from "@/lib/validation/publicaciones";
import type { PublicacionDetalleResponse } from "@/lib/validation/publicaciones";

const CURRENT_YEAR = new Date().getFullYear();

function buildDefaultValues(): CrearPublicacionFormInput {
  return {
    titulo: "",
    descripcion: "",
    tipo: TipoPublicacion.ARTICULO,
    tipoOtro: null,
    anioPublicacion: CURRENT_YEAR,
    doi: null,
    revistaCongreso: null,
    editorial: null,
    isbn: null,
    issn: null,
    url: null,
    autores: [{ nombres: "", apellidos: "", orden: 1 }],
    palabrasClave: [],
    // No hay archivo seleccionado todavía. `pdfFileSchema` exige un `File`,
    // así que este `undefined` es "ilegal" a nivel de tipos pero es el
    // estado real hasta que el usuario elija un PDF; zodResolver lo
    // reportará como campo obligatorio si se intenta enviar vacío.
    documento: undefined as unknown as File,
    aceptaDescargo: false,
  };
}

export interface CrearPublicacionFormProps {
  /** Se invoca tras una creación exitosa (201), con la publicación creada. */
  onSuccess?: (publicacion: PublicacionDetalleResponse) => void;
}

export function CrearPublicacionForm({ onSuccess }: CrearPublicacionFormProps) {
  const form = useForm<
    CrearPublicacionFormInput,
    unknown,
    CrearPublicacionFormOutput
  >({
    resolver: zodResolver(crearPublicacionFormSchema),
    defaultValues: buildDefaultValues(),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { control, handleSubmit, reset } = form;
  const mutation = useCrearPublicacion();

  async function onValid(data: CrearPublicacionFormOutput) {
    const { documento, ...metadata } = data;

    const formData = new FormData();
    // `aceptaDescargo` se fija explícitamente en `true`: si llegamos aquí,
    // la validación (incluido el `.refine`) ya garantizó que es `true`; el
    // esquema del formulario lo tipa como `boolean`, pero el contrato del
    // servidor (`createPublicacionSchema`) exige el literal `true`.
    formData.set(
      "metadata",
      JSON.stringify({ ...metadata, aceptaDescargo: true }),
    );
    formData.set("documento", documento, documento.name);

    try {
      const publicacion = await mutation.mutateAsync(formData);
      toast.success("Publicación creada correctamente.");
      reset(buildDefaultValues());
      onSuccess?.(publicacion);
    } catch (error) {
      handleMutationError(error);
    }
  }

  function handleMutationError(error: unknown) {
    if (error instanceof ApiRequestError) {
      if (error.code === "VALIDATION_ERROR" && error.details?.length) {
        toast.error(error.message, {
          description: (
            <pre className="mt-2 max-h-40 w-full overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-xs text-muted-foreground">
              {error.details
                .map((detail) => `${detail.path}: ${detail.message}`)
                .join("\n")}
            </pre>
          ),
        });
        return;
      }

      // Para el resto de códigos (401/403/409/413/415/422/502/500...) se
      // muestra tal cual el `message` que ya devuelve el servidor, sin
      // inventar redacciones específicas por status.
      toast.error(error.message);
      return;
    }

    toast.error("No se pudo crear la publicación. Inténtalo nuevamente.");
  }

  return (
    <form
      onSubmit={handleSubmit(onValid, () => {
        toast.error("Revisa los campos marcados en el formulario.");
      })}
      noValidate
      className="space-y-8"
    >
      <PublicacionMetadataFields form={form} />

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Documento</FieldLegend>
        <Controller
          name="documento"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="documento">
                Archivo PDF (máx. 5 MB)
              </FieldLabel>
              <PdfFileField
                id="documento"
                value={field.value}
                onChange={(file) => {
                  field.onChange(file);
                  // Valida de inmediato (tamaño, MIME, extensión) en vez de
                  // esperar a un blur o al submit.
                  void form.trigger("documento");
                }}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                La validación del cliente es solo para una respuesta rápida; el
                servidor vuelve a validar tamaño, tipo y firma del archivo.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldSet>

      <FieldSeparator />

      <Controller
        name="aceptaDescargo"
        control={control}
        render={({ field, fieldState }) => (
          <Field orientation="horizontal" data-invalid={fieldState.invalid}>
            <Checkbox
              id="aceptaDescargo"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              onBlur={field.onBlur}
              aria-invalid={fieldState.invalid}
            />
            <FieldLabel htmlFor="aceptaDescargo" className="font-normal">
              He leído y acepto el descargo de responsabilidad.
            </FieldLabel>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Field orientation="horizontal">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Publicando…" : "Publicar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => reset(buildDefaultValues())}
        >
          Cancelar
        </Button>
      </Field>
    </form>
  );
}
