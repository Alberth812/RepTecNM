// components/afiliados/afiliado-investigacion-form.tsx
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Control } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

import {
  PRODUCCION_ACADEMICA_OPTIONS,
  SITUACION_SNI_OPTIONS,
} from "@/lib/validation/afiliados-investigacion/investigacion-options";
import {
  afiliadoInvestigacionSchema,
  type AfiliadoInvestigacionFormInput,
  type AfiliadoInvestigacionFormOutput,
} from "@/lib/validation/afiliados-investigacion/investigacion";

const DEFAULT_VALUES: AfiliadoInvestigacionFormInput = {
  participacionProduccionConocimiento: null,
  produccionAcademica: null,
  otrosProductosAcademicos: null,
  situacionSni: null,
  sniPeriodoAnterior: null,
  sniPeriodoActual: null,
  redTematicaConacyt: null,
  nombreRed: null,
  haRecibidoPremiosReconocimientos: null,
  detalleReconocimiento: null,
  perteneceAcademiaSociedad: null,
  nombreOrganizacion: null,
};

type BooleanFieldName =
  | "participacionProduccionConocimiento"
  | "redTematicaConacyt"
  | "haRecibidoPremiosReconocimientos"
  | "perteneceAcademiaSociedad";

type TextFieldName =
  | "otrosProductosAcademicos"
  | "sniPeriodoAnterior"
  | "sniPeriodoActual"
  | "nombreRed"
  | "detalleReconocimiento"
  | "nombreOrganizacion";

// ---------------------------------------------------------------------------
// Sub-componentes reutilizables (no exportados: son de uso interno del form)
// ---------------------------------------------------------------------------

/**
 * Pregunta Sí/No tri-state con RadioGroup (no un Switch): así "sin
 * responder" es un estado visualmente distinto de "No", en vez de que el
 * interruptor arranque en "apagado" pareciendo ya una respuesta.
 */
function YesNoField({
  control,
  name,
  legend,
  description,
}: {
  control: Control<AfiliadoInvestigacionFormInput>;
  name: BooleanFieldName;
  legend: string;
  description?: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FieldSet>
          <FieldLegend variant="label">{legend}</FieldLegend>
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          <RadioGroup
            name={field.name}
            value={
              field.value === true
                ? "true"
                : field.value === false
                  ? "false"
                  : undefined
            }
            onValueChange={(value) => field.onChange(value === "true")}
            className="flex flex-row gap-6"
          >
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <RadioGroupItem
                value="true"
                id={`${field.name}-si`}
                aria-invalid={fieldState.invalid}
              />
              <FieldLabel htmlFor={`${field.name}-si`} className="font-normal">
                Sí
              </FieldLabel>
            </Field>
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <RadioGroupItem
                value="false"
                id={`${field.name}-no`}
                aria-invalid={fieldState.invalid}
              />
              <FieldLabel htmlFor={`${field.name}-no`} className="font-normal">
                No
              </FieldLabel>
            </Field>
          </RadioGroup>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </FieldSet>
      )}
    />
  );
}

/**
 * Campo de texto/textarea condicional (visible_when). Se monta solo cuando
 * `visible` es true; el "clear_when_hidden" real se hace en el componente
 * padre con `setValue(..., null)` para que el estado del form quede limpio
 * incluso mientras el campo no está montado.
 */
function ConditionalTextField({
  control,
  name,
  label,
  description,
  visible,
  multiline = false,
  maxLength,
}: {
  control: Control<AfiliadoInvestigacionFormInput>;
  name: TextFieldName;
  label: string;
  description?: string;
  visible: boolean;
  multiline?: boolean;
  maxLength: number;
}) {
  if (!visible) return null;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) =>
        multiline ? (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <Textarea
              {...field}
              value={field.value ?? ""}
              id={field.name}
              maxLength={maxLength}
              aria-invalid={fieldState.invalid}
              className="min-h-24"
            />
            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        ) : (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <Input
              {...field}
              value={field.value ?? ""}
              id={field.name}
              maxLength={maxLength}
              aria-invalid={fieldState.invalid}
            />
            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Formulario principal
// ---------------------------------------------------------------------------

export interface AfiliadoInvestigacionFormProps {
  /** Se llama con los datos ya guardados tras un submit exitoso. */
  onSaved?: (data: AfiliadoInvestigacionFormOutput) => void;
}

export function AfiliadoInvestigacionForm({
  onSaved,
}: AfiliadoInvestigacionFormProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  // z.input como TFieldValues (lo que RHF guarda mientras se llena el form)
  // y z.output como TTransformedValues (lo que recibe onSubmit, ya validado
  // y normalizado por los `transform` del schema).
  const form = useForm<
    AfiliadoInvestigacionFormInput,
    unknown,
    AfiliadoInvestigacionFormOutput
  >({
    resolver: zodResolver(afiliadoInvestigacionSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onBlur",
  });

  const { control, handleSubmit, watch, setValue, reset, formState } = form;

  // --- Cargar los datos existentes, si el afiliado ya llenó esta sección ---
  React.useEffect(() => {
    let cancelled = false;

    async function loadExisting() {
      try {
        const response = await fetch("/api/afiliados/investigacion");
        if (!response.ok) {
          throw new Error("No se pudo cargar la información de investigación.");
        }

        const { data } = (await response.json()) as {
          data:
            | (AfiliadoInvestigacionFormOutput & {
                userId: string;
                createdAt: string;
                updatedAt: string;
              })
            | null;
        };

        if (!cancelled && data) {
          const {
            userId: _userId,
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            ...formValues
          } = data;
          reset(formValues);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "No se pudo cargar la información.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadExisting();
    return () => {
      cancelled = true;
    };
  }, [reset]);

  // --- Visibilidad condicional (visible_when de la especificación) ---
  const participacion = watch("participacionProduccionConocimiento");
  const situacionSni = watch("situacionSni");
  const redTematica = watch("redTematicaConacyt");
  const haRecibidoPremios = watch("haRecibidoPremiosReconocimientos");
  const perteneceAcademia = watch("perteneceAcademiaSociedad");

  const produccionVisible = participacion === true;
  const sniAnteriorVisible =
    situacionSni === "anterior" || situacionSni === "anterior_y_actual";
  const sniActualVisible =
    situacionSni === "actual" || situacionSni === "anterior_y_actual";
  const nombreRedVisible = redTematica === true;
  const detalleReconocimientoVisible = haRecibidoPremios === true;
  const nombreOrganizacionVisible = perteneceAcademia === true;

  // --- clear_when_hidden: limpiar el estado del form apenas se oculta ---
  React.useEffect(() => {
    if (!produccionVisible) {
      setValue("produccionAcademica", null, { shouldValidate: false });
      setValue("otrosProductosAcademicos", null, { shouldValidate: false });
    }
  }, [produccionVisible, setValue]);

  React.useEffect(() => {
    if (!sniAnteriorVisible)
      setValue("sniPeriodoAnterior", null, { shouldValidate: false });
  }, [sniAnteriorVisible, setValue]);

  React.useEffect(() => {
    if (!sniActualVisible)
      setValue("sniPeriodoActual", null, { shouldValidate: false });
  }, [sniActualVisible, setValue]);

  React.useEffect(() => {
    if (!nombreRedVisible)
      setValue("nombreRed", null, { shouldValidate: false });
  }, [nombreRedVisible, setValue]);

  React.useEffect(() => {
    if (!detalleReconocimientoVisible) {
      setValue("detalleReconocimiento", null, { shouldValidate: false });
    }
  }, [detalleReconocimientoVisible, setValue]);

  React.useEffect(() => {
    if (!nombreOrganizacionVisible) {
      setValue("nombreOrganizacion", null, { shouldValidate: false });
    }
  }, [nombreOrganizacionVisible, setValue]);

  async function onSubmit(data: AfiliadoInvestigacionFormOutput) {
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const response = await fetch("/api/afiliados/investigacion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo guardar la información.");
      }

      const { data: saved } = (await response.json()) as {
        data: AfiliadoInvestigacionFormOutput;
      };
      setSubmitSuccess(true);
      onSaved?.(saved);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la información.",
      );
    }
  }

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Cargando tu información de investigación…
      </p>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {loadError ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar tu información</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : null}

      {submitError ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudo guardar</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      {submitSuccess ? (
        <Alert>
          <AlertTitle>Guardado</AlertTitle>
          <AlertDescription>
            Tu información de investigación se guardó correctamente.
          </AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        {/* Bloque 1: producción académica */}
        <FieldSet>
          <FieldLegend>Producción académica</FieldLegend>
          <FieldDescription>
            Actividades de producción de conocimientos y publicaciones después
            de concluir estudios de posgrado.
          </FieldDescription>
          <FieldGroup>
            <YesNoField
              control={control}
              name="participacionProduccionConocimiento"
              legend="Después de haber concluido los estudios de posgrado, ¿participó en actividades de producción de conocimientos y publicaciones?"
            />

            {produccionVisible ? (
              <Controller
                name="produccionAcademica"
                control={control}
                render={({ field, fieldState }) => (
                  <FieldSet>
                    <FieldLegend variant="label">
                      Especifique en cuáles actividades participa o ha
                      participado
                    </FieldLegend>
                    <FieldGroup data-slot="checkbox-group">
                      {PRODUCCION_ACADEMICA_OPTIONS.map((option) => {
                        const current = field.value ?? [];
                        const checked = current.includes(option.value);
                        return (
                          <Field key={option.value} orientation="horizontal">
                            <Checkbox
                              id={`produccion-academica-${option.value}`}
                              name={field.name}
                              checked={checked}
                              aria-invalid={fieldState.invalid}
                              onCheckedChange={(isChecked) => {
                                const next =
                                  isChecked === true
                                    ? [...current, option.value]
                                    : current.filter(
                                        (value) => value !== option.value,
                                      );
                                field.onChange(next.length === 0 ? null : next);
                              }}
                            />
                            <FieldLabel
                              htmlFor={`produccion-academica-${option.value}`}
                              className="font-normal"
                            >
                              {option.label}
                            </FieldLabel>
                          </Field>
                        );
                      })}
                    </FieldGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldSet>
                )}
              />
            ) : null}

            <ConditionalTextField
              control={control}
              name="otrosProductosAcademicos"
              label="Si realizó otra actividad que desee mencionar, especifique"
              description="Describa brevemente la actividad de producción académica (máx. 1000 caracteres)."
              visible={produccionVisible}
              multiline
              maxLength={1000}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        {/* Bloque 2: SNI */}
        <FieldSet>
          <FieldLegend>
            Sistema Nacional de Investigadoras e Investigadores (SNI)
          </FieldLegend>
          <FieldGroup>
            <Controller
              name="situacionSni"
              control={control}
              render={({ field, fieldState }) => (
                <FieldSet>
                  <FieldLegend variant="label">
                    Indique su relación con el Sistema Nacional de
                    Investigadoras e Investigadores
                  </FieldLegend>
                  <RadioGroup
                    name={field.name}
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                  >
                    {SITUACION_SNI_OPTIONS.map((option) => (
                      <Field
                        key={option.value}
                        orientation="horizontal"
                        data-invalid={fieldState.invalid}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`situacion-sni-${option.value}`}
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldLabel
                          htmlFor={`situacion-sni-${option.value}`}
                          className="font-normal"
                        >
                          {option.label}
                        </FieldLabel>
                      </Field>
                    ))}
                  </RadioGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldSet>
              )}
            />

            <ConditionalTextField
              control={control}
              name="sniPeriodoAnterior"
              label="Especifique el nivel y periodo anterior"
              description="Indique el nivel/categoría y el periodo correspondiente (máx. 300 caracteres)."
              visible={sniAnteriorVisible}
              multiline
              maxLength={300}
            />

            <ConditionalTextField
              control={control}
              name="sniPeriodoActual"
              label="Especifique el nivel y periodo actual"
              description="Indique el nivel/categoría y el periodo correspondiente (máx. 300 caracteres)."
              visible={sniActualVisible}
              multiline
              maxLength={300}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        {/* Bloque 3: red temática CONACYT */}
        <FieldSet>
          <FieldLegend>Redes temáticas</FieldLegend>
          <FieldGroup>
            <YesNoField
              control={control}
              name="redTematicaConacyt"
              legend="¿Participa en alguna red temática del CONACYT?"
            />
            <ConditionalTextField
              control={control}
              name="nombreRed"
              label="Especifique el nombre de la red temática"
              visible={nombreRedVisible}
              maxLength={200}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        {/* Bloque 4: premios y reconocimientos */}
        <FieldSet>
          <FieldLegend>Premios y reconocimientos</FieldLegend>
          <FieldGroup>
            <YesNoField
              control={control}
              name="haRecibidoPremiosReconocimientos"
              legend="¿Ha recibido premios, reconocimientos o distinciones por su ejercicio profesional o de otra índole?"
            />
            <ConditionalTextField
              control={control}
              name="detalleReconocimiento"
              label="Especifique la institución que le otorgó el reconocimiento y de qué tipo fue"
              description="Institución otorgante, reconocimiento recibido y, si corresponde, el año (máx. 1000 caracteres)."
              visible={detalleReconocimientoVisible}
              multiline
              maxLength={1000}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        {/* Bloque 5: academias / sociedades */}
        <FieldSet>
          <FieldLegend>Pertenencia a academias o sociedades</FieldLegend>
          <FieldGroup>
            <YesNoField
              control={control}
              name="perteneceAcademiaSociedad"
              legend="¿Pertenece a alguna academia, sociedad u organización profesional?"
            />
            <ConditionalTextField
              control={control}
              name="nombreOrganizacion"
              label="Especifique el nombre de la academia, sociedad u organización"
              visible={nombreOrganizacionVisible}
              maxLength={250}
            />
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <Field orientation="horizontal">
        <Button type="button" variant="outline" onClick={() => reset()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Guardando…" : "Guardar"}
        </Button>
      </Field>
    </form>
  );
}
