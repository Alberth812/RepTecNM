"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcwIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import type { BuscarPublicacionesQuery } from "@/lib/validation/publicaciones-busqueda";
import type {
  AnioModoFiltro,
  PublicacionesFiltrosFormInput,
  PublicacionesFiltrosFormOutput,
} from "@/lib/validation/publicaciones-filtros-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIPO_PUBLICACION_OPTIONS } from "@/lib/publicaciones/tipo-labels";
import {
  FILTRO_TIPO_TODOS,
  FILTROS_FORM_DEFAULT_VALUES,
  mapFiltrosFormAQuery,
  publicacionesFiltrosFormSchema,
} from "@/lib/validation/publicaciones-filtros-form";

interface PublicacionesSearchFormProps {
  /** Se llama solo al pulsar "Buscar", con los filtros ya validados. */
  onBuscar: (
    filtros: Omit<BuscarPublicacionesQuery, "page" | "pageSize">,
  ) => void;
  /** Se llama al pulsar "Limpiar": el formulario se resetea internamente. */
  onLimpiar: () => void;
  disabled?: boolean;
}

const OPCIONES_MODO_ANIO: Array<{ value: AnioModoFiltro; label: string }> = [
  { value: "todos", label: "Cualquier año" },
  { value: "exacto", label: "Año exacto" },
  { value: "rango", label: "Rango de años" },
];

export function PublicacionesSearchForm({
  onBuscar,
  onLimpiar,
  disabled = false,
}: PublicacionesSearchFormProps) {
  const [anioModo, setAnioModo] = useState<AnioModoFiltro>("todos");

  // El tercer genérico (`TTransformedValues`) hace que `handleSubmit` reciba
  // directamente la salida YA transformada/validada por el resolver de zod.
  const form = useForm<
    PublicacionesFiltrosFormInput,
    unknown,
    PublicacionesFiltrosFormOutput
  >({
    resolver: zodResolver(publicacionesFiltrosFormSchema),
    defaultValues: FILTROS_FORM_DEFAULT_VALUES,
  });

  function handleAnioModoChange(modo: AnioModoFiltro) {
    setAnioModo(modo);

    if (modo === "todos") {
      form.setValue("anio", "", { shouldValidate: false });
      form.setValue("anioDesde", "", { shouldValidate: false });
      form.setValue("anioHasta", "", { shouldValidate: false });
    } else if (modo === "exacto") {
      form.setValue("anioDesde", "", { shouldValidate: false });
      form.setValue("anioHasta", "", { shouldValidate: false });
    } else {
      form.setValue("anio", "", { shouldValidate: false });
    }

    form.clearErrors(["anio", "anioDesde", "anioHasta"]);
  }

  const handleValidSubmit = form.handleSubmit((filtros) => {
    onBuscar(mapFiltrosFormAQuery(filtros));
  });

  function handleLimpiar() {
    form.reset(FILTROS_FORM_DEFAULT_VALUES);
    setAnioModo("todos");
    onLimpiar();
  }

  return (
    <form onSubmit={handleValidSubmit} className="space-y-6" noValidate>
      {/* Barra de búsqueda */}
      <Controller
        name="q"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="publicaciones-q">
              Buscar publicaciones
            </FieldLabel>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                {...field}
                id="publicaciones-q"
                placeholder="Título, descripción, autor, palabra clave, ISBN, ISSN o DOI…"
                aria-invalid={fieldState.invalid}
                className="sm:flex-1"
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={disabled}>
                  <SearchIcon className="size-4" aria-hidden="true" />
                  Buscar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLimpiar}
                  disabled={disabled}
                >
                  <RotateCcwIcon className="size-4" aria-hidden="true" />
                  Limpiar
                </Button>
              </div>
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Filtros */}
      <FieldSet className="rounded-lg border p-4">
        <FieldLegend>Filtros</FieldLegend>
        <FieldDescription>
          Combina los filtros que necesites; se aplican junto con la búsqueda al
          pulsar &quot;Buscar&quot;.
        </FieldDescription>

        <FieldGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Controller
            name="tipo"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="publicaciones-tipo">Tipo</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  items={TIPO_PUBLICACION_OPTIONS.map((opcion) => ({
                    value: opcion.value,
                    label: opcion.label,
                  }))}
                >
                  <SelectTrigger
                    id="publicaciones-tipo"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="autor"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="publicaciones-autor">Autor</FieldLabel>
                <Input
                  {...field}
                  id="publicaciones-autor"
                  placeholder="Nombre o apellido"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="keyword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="publicaciones-keyword">
                  Palabra clave
                </FieldLabel>
                <Input
                  {...field}
                  id="publicaciones-keyword"
                  placeholder="Ej. inteligencia artificial"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field className="sm:col-span-2 lg:col-span-3">
            <FieldLabel>Año de publicación</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {OPCIONES_MODO_ANIO.map((opcion) => (
                <Button
                  key={opcion.value}
                  type="button"
                  size="sm"
                  variant={anioModo === opcion.value ? "default" : "outline"}
                  onClick={() => handleAnioModoChange(opcion.value)}
                >
                  {opcion.label}
                </Button>
              ))}
            </div>

            {anioModo === "exacto" && (
              <Controller
                name="anio"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="mt-2 max-w-[10rem]">
                    <Input
                      {...field}
                      inputMode="numeric"
                      placeholder="Ej. 2024"
                      aria-invalid={fieldState.invalid}
                      aria-label="Año exacto"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </div>
                )}
              />
            )}

            {anioModo === "rango" && (
              <div className="mt-2 flex flex-wrap gap-3">
                <Controller
                  name="anioDesde"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="max-w-[10rem]">
                      <Input
                        {...field}
                        inputMode="numeric"
                        placeholder="Desde"
                        aria-invalid={fieldState.invalid}
                        aria-label="Año desde"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="anioHasta"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="max-w-[10rem]">
                      <Input
                        {...field}
                        inputMode="numeric"
                        placeholder="Hasta"
                        aria-invalid={fieldState.invalid}
                        aria-label="Año hasta"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </div>
                  )}
                />
              </div>
            )}
          </Field>

          <Controller
            name="isbn"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="publicaciones-isbn">ISBN</FieldLabel>
                <Input
                  {...field}
                  id="publicaciones-isbn"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="issn"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="publicaciones-issn">ISSN</FieldLabel>
                <Input
                  {...field}
                  id="publicaciones-issn"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="doi"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="publicaciones-doi">DOI</FieldLabel>
                <Input
                  {...field}
                  id="publicaciones-doi"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
