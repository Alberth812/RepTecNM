// components/publicaciones/editar-publicacion-form.tsx
"use client";

/**
 * Formulario "Editar publicación".
 *
 * Uso:
 *   <EditarPublicacionForm
 *     publicacionId={id}
 *     onSuccess={(publicacion) => router.push(`/publicaciones/${publicacion.id}`)}
 *   />
 *
 * A diferencia de "Crear publicación":
 *  - Precarga los metadatos vía GET /api/publicaciones/:id (TanStack Query).
 *  - Envía el PATCH como JSON (no FormData): solo metadatos, sin
 *    `aceptaDescargo` ni `documento`.
 *  - El PDF no es editable aquí; solo se muestra y se puede abrir en una
 *    pestaña nueva mediante la URL firmada (`DocumentoActualCard`).
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";

import { PublicacionMetadataFields } from "@/components/publicaciones/publicacion-metadata-fields";
import { DocumentoActualCard } from "@/components/publicaciones/documento-actual-card";

import {
  editarPublicacionFormSchema,
  type EditarPublicacionFormInput,
  type EditarPublicacionFormOutput,
} from "@/lib/publicaciones/schemas/editar-publicacion-form-schema";
import { usePublicacion } from "@/lib/publicaciones/hooks/use-publicacion";
import { useActualizarPublicacion } from "@/lib/publicaciones/hooks/use-actualizar-publicacion";
import { ApiRequestError } from "@/lib/publicaciones/api/publicaciones-client";
import type { PublicacionDetalleResponse } from "@/lib/validation/publicaciones";

export interface EditarPublicacionFormProps {
  publicacionId: string;
  /** Se invoca tras guardar cambios (200), con la publicación actualizada. */
  onSuccess?: (publicacion: PublicacionDetalleResponse) => void;
}

/**
 * Wrapper: resuelve la carga (GET) de la publicación y solo entonces monta
 * el formulario real, ya con datos concretos para `defaultValues` (evita
 * lidiar con `reset()` asíncrono tras el primer render).
 */
export function EditarPublicacionForm({
  publicacionId,
  onSuccess,
}: EditarPublicacionFormProps) {
  const {
    data: publicacion,
    isPending,
    isError,
    error,
    refetch,
  } = usePublicacion(publicacionId);

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Cargando publicación…</p>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3 rounded-md border border-destructive/50 p-4">
        <p className="text-sm text-destructive">
          {error instanceof ApiRequestError
            ? error.message
            : "No se pudo cargar la publicación."}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <EditarPublicacionFormInner
      publicacion={publicacion}
      onSuccess={onSuccess}
    />
  );
}

interface EditarPublicacionFormInnerProps {
  publicacion: PublicacionDetalleResponse;
  onSuccess?: (publicacion: PublicacionDetalleResponse) => void;
}

function buildDefaultValues(
  publicacion: PublicacionDetalleResponse,
): EditarPublicacionFormInput {
  return {
    titulo: publicacion.titulo,
    descripcion: publicacion.descripcion,
    tipo: publicacion.tipo,
    tipoOtro: publicacion.tipoOtro,
    anioPublicacion: publicacion.anioPublicacion,
    doi: publicacion.doi,
    revistaCongreso: publicacion.revistaCongreso,
    editorial: publicacion.editorial,
    isbn: publicacion.isbn,
    issn: publicacion.issn,
    url: publicacion.url,
    // El orden que venga del servidor manda; se ordena por si acaso llega
    // en otro orden desde la API.
    autores: publicacion.autores
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map((autor) => ({
        nombres: autor.nombres,
        apellidos: autor.apellidos,
        orden: autor.orden,
      })),
    palabrasClave: publicacion.palabrasClave,
  };
}

function EditarPublicacionFormInner({
  publicacion,
  onSuccess,
}: EditarPublicacionFormInnerProps) {
  const form = useForm<
    EditarPublicacionFormInput,
    unknown,
    EditarPublicacionFormOutput
  >({
    resolver: zodResolver(editarPublicacionFormSchema),
    defaultValues: buildDefaultValues(publicacion),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { handleSubmit, reset, formState } = form;
  const mutation = useActualizarPublicacion(publicacion.id);

  async function onValid(data: EditarPublicacionFormOutput) {
    try {
      const actualizada = await mutation.mutateAsync(data);
      toast.success("Publicación actualizada correctamente.");
      // Sincroniza el formulario con lo que realmente quedó guardado (y
      // limpia el estado "dirty").
      reset(buildDefaultValues(actualizada));
      onSuccess?.(actualizada);
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

      // Para el resto de códigos (401/403/404/409/422/500...) se muestra
      // tal cual el `message` que ya devuelve el servidor.
      toast.error(error.message);
      return;
    }

    toast.error("No se pudo actualizar la publicación. Inténtalo nuevamente.");
  }

  return (
    <form
      onSubmit={handleSubmit(onValid, () => {
        toast.error("Revisa los campos marcados en el formulario.");
      })}
      noValidate
      className="space-y-8"
    >
      <FieldSet>
        <FieldLegend>Documento</FieldLegend>
        <DocumentoActualCard
          publicacionId={publicacion.id}
          archivo={publicacion.archivo}
        />
        <FieldDescription>
          El PDF no puede sustituirse desde este formulario. Si necesitas
          cambiarlo, crea una publicación nueva.
        </FieldDescription>
      </FieldSet>

      <FieldSeparator />

      <PublicacionMetadataFields form={form} />

      <Field orientation="horizontal">
        <Button
          type="submit"
          disabled={mutation.isPending || !formState.isDirty}
        >
          {mutation.isPending ? "Guardando…" : "Guardar cambios"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={mutation.isPending || !formState.isDirty}
          onClick={() => reset(buildDefaultValues(publicacion))}
        >
          Descartar cambios
        </Button>
      </Field>
    </form>
  );
}
