// @/components/informacion-laboral/empleo-fieldset.tsx

"use client";

import {
  Controller,
  UseFormResetField,
  UseFormSetValue,
  UseFormTrigger,
  useWatch,
  type Control,
} from "react-hook-form";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

import type { InformacionLaboralFormValues } from "./informacion-laboral-types";

import {
  BooleanRadioField,
  CheckboxGroupField,
  MesSelect,
  RadioOptionsField,
} from "./informacion-laboral-fields";

import {
  ESTRATEGIA_CONSECUCION_EMPLEO_OPTIONS,
  SECTOR_PRIMARIO_OPTIONS,
  SECTOR_SECUNDARIO_OPTIONS,
  SECTOR_TERCIARIO_OPTIONS,
  TIPO_ACTIVIDAD_OPTIONS,
  TIPO_CONTRATACION_OPTIONS,
  TIPO_INSTITUCION_OPTIONS,
  VALORACION_IMPACTO_OPTIONS,
  VALORACION_NIVEL_OPTIONS,
} from "./informacion-laboral-options";
import { NumberInput } from "./number-input";
import { useEffect } from "react";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

const anioActual = new Date().getFullYear();

interface EmpleoFieldsetProps {
  control: Control<InformacionLaboralFormValues>;
  setValue: UseFormSetValue<InformacionLaboralFormValues>;
  resetField: UseFormResetField<InformacionLaboralFormValues>;
  trigger: UseFormTrigger<InformacionLaboralFormValues>;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  permiteEmpleoActual: boolean;
}

/**
 * Tipo de un registro individual de historialEmpleos.
 */
type Empleo = InformacionLaboralFormValues["historialEmpleos"][number];

/**
 * Construye una ruta válida hacia una propiedad de un empleo.
 *
 * Ejemplos:
 *
 * empleoField(0, "puesto")
 * -> "historialEmpleos.0.puesto"
 *
 * empleoField(2, "esActual")
 * -> "historialEmpleos.2.esActual"
 */
type EmpleoFieldName<K extends keyof Empleo> =
  `historialEmpleos.${number}.${K & string}`;

function empleoField<K extends keyof Empleo>(
  index: number,
  field: K,
): EmpleoFieldName<K> {
  return `historialEmpleos.${index}.${String(field)}` as EmpleoFieldName<K>;
}

/* -------------------------------------------------------------------------- */
/* Componente                                                                 */
/* -------------------------------------------------------------------------- */

export function EmpleoFieldset({
  control,
  setValue,
  resetField,
  trigger,
  index,
  onRemove,
  canRemove,
  permiteEmpleoActual,
}: EmpleoFieldsetProps) {
  const esActual = useWatch({ control, name: empleoField(index, "esActual") });

  // Sincroniza los campos que dependen de esActual.
  useEffect(() => {
    if (esActual) {
      resetField(empleoField(index, "fechaFinAnio"), { defaultValue: null });
      resetField(empleoField(index, "fechaFinMes"), { defaultValue: null });
    } else {
      resetField(empleoField(index, "tipoInstitucion"), { defaultValue: [] });
      resetField(empleoField(index, "tipoInstitucionOtro"), {
        defaultValue: null,
      });
      resetField(empleoField(index, "telefonoOrganismo"), { defaultValue: "" });
      resetField(empleoField(index, "sectorPrimario"), { defaultValue: [] });
      resetField(empleoField(index, "sectorSecundario"), { defaultValue: [] });
      resetField(empleoField(index, "sectorTerciario"), { defaultValue: [] });
      resetField(empleoField(index, "tipoActividad"), { defaultValue: [] });
      resetField(empleoField(index, "tipoActividadOtro"), {
        defaultValue: null,
      });
      resetField(empleoField(index, "actividadesPrincipales"), {
        defaultValue: "",
      });
      resetField(empleoField(index, "estrategiaEmpleoActual"), {
        defaultValue: [],
      });
      resetField(empleoField(index, "estrategiaEmpleoActualOtro"), {
        defaultValue: null,
      });
      resetField(empleoField(index, "valoracionCoincidenciaConocimientos"), {
        defaultValue: null,
      });
      resetField(empleoField(index, "valoracionCapacidadResolverProblemas"), {
        defaultValue: null,
      });
      resetField(empleoField(index, "valoracionImpactoSocial"), {
        defaultValue: null,
      });
      resetField(empleoField(index, "valoracionPertinenciaPrograma"), {
        defaultValue: null,
      });
    }
    trigger();
  }, [esActual, resetField, trigger, index]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="text-base font-medium">
          Empleo {index + 1}
        </CardTitle>

        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label={`Eliminar empleo ${index + 1}`}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <FieldGroup>
          {/* ---------------------------------------------------------------- */}
          {/* Puesto / institución                                           */}
          {/* ---------------------------------------------------------------- */}

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name={empleoField(index, "puesto")}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Nombre del puesto
                  </FieldLabel>

                  <Input
                    id={field.name}
                    {...field}
                    value={field.value ?? ""}
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name={empleoField(index, "institucion")}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Institución, empresa u organización
                  </FieldLabel>

                  <Input
                    id={field.name}
                    {...field}
                    value={field.value ?? ""}
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Fechas                                                          */}
          {/* ---------------------------------------------------------------- */}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Fecha de inicio */}
            <div>
              <FieldLabel className="mb-2 block">Fecha de inicio</FieldLabel>

              <div className="grid grid-cols-2 gap-2">
                {/* Mes */}
                <Controller
                  control={control}
                  name={empleoField(index, "fechaInicioMes")}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <MesSelect
                        id={field.name}
                        name={field.name}
                        value={field.value as number | undefined}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        aria-label="Mes de inicio"
                        invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Año */}
                <Controller
                  control={control}
                  name={empleoField(index, "fechaInicioAnio")}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <NumberInput
                        id={field.name}
                        name={field.name}
                        placeholder="Año"
                        min={1965}
                        max={anioActual}
                        maxDigits={4}
                        value={field.value as number | undefined}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        aria-label="Año de inicio"
                        aria-invalid={fieldState.invalid}
                        clampOnBlur={false}
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>

            {/* Fecha de término */}
            {!esActual && (
              <div>
                <FieldLabel className="mb-2 block">Fecha de término</FieldLabel>

                <div className="grid grid-cols-2 gap-2">
                  {/* Mes */}
                  <Controller
                    control={control}
                    name={empleoField(index, "fechaFinMes")}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <MesSelect
                          id={field.name}
                          name={field.name}
                          value={field.value as number | undefined}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          aria-label="Mes de término"
                          invalid={fieldState.invalid}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  {/* Año */}
                  <Controller
                    control={control}
                    name={empleoField(index, "fechaFinAnio")}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <NumberInput
                          id={field.name}
                          name={field.name}
                          placeholder="Año"
                          min={1965}
                          max={anioActual}
                          maxDigits={4}
                          value={field.value as number | undefined}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          aria-label="Año de término"
                          aria-invalid={fieldState.invalid}
                          clampOnBlur={false}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Empleo actual                                                   */}
          {/* ---------------------------------------------------------------- */}

          {permiteEmpleoActual ? (
            <BooleanRadioField
              control={control}
              name={empleoField(index, "esActual")}
              label="¿Este es un empleo actual?"
            />
          ) : (
            <FieldDescription>
              Este empleo se registrará como finalizado, ya que indicó que
              actualmente no labora.
            </FieldDescription>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Contratación                                                    */}
          {/* ---------------------------------------------------------------- */}

          <RadioOptionsField
            control={control}
            name={empleoField(index, "tipoContratacion")}
            otroName={empleoField(index, "tipoContratacionOtro")}
            legend="Tipo de contratación"
            options={TIPO_CONTRATACION_OPTIONS}
          />

          {/* ---------------------------------------------------------------- */}
          {/* Salario / horas                                                 */}
          {/* ---------------------------------------------------------------- */}

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name={empleoField(index, "salarioMensualBruto")}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Salario mensual bruto (MXN)
                  </FieldLabel>

                  <NumberInput
                    id={field.name}
                    name={field.name}
                    decimal
                    min={0}
                    max={10_000_000}
                    maxDigits={10}
                    placeholder="0.00"
                    value={field.value as number | undefined}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name={empleoField(index, "horasSemanales")}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Horas semanales trabajadas
                  </FieldLabel>
                  <NumberInput
                    id={field.name}
                    name={field.name}
                    min={1}
                    max={48}
                    maxDigits={2}
                    placeholder="Horas"
                    value={field.value as number | undefined}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* ================================================================= */}
          {/* CAMPOS EXCLUSIVOS DEL EMPLEO ACTUAL                            */}
          {/* ================================================================= */}

          {esActual && (
            <>
              <FieldSeparator>Empleo actual</FieldSeparator>

              {/* ------------------------------------------------------------- */}
              {/* Tipo de institución                                         */}
              {/* ------------------------------------------------------------- */}

              <CheckboxGroupField
                control={control}
                name={empleoField(index, "tipoInstitucion")}
                otroName={empleoField(index, "tipoInstitucionOtro")}
                legend="Tipo de institución donde se encuentra laborando"
                options={TIPO_INSTITUCION_OPTIONS}
              />

              {/* ------------------------------------------------------------- */}
              {/* Teléfono                                                     */}
              {/* ------------------------------------------------------------- */}

              <Controller
                control={control}
                name={empleoField(index, "telefonoOrganismo")}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="max-w-xs">
                    <FieldLabel htmlFor={field.name}>
                      Teléfono del organismo
                    </FieldLabel>

                    <Input
                      id={field.name}
                      type="tel"
                      {...field}
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* ------------------------------------------------------------- */}
              {/* Sector económico                                             */}
              {/* ------------------------------------------------------------- */}

              <FieldSet>
                <FieldLegend variant="label">
                  Sector económico en el que se encuentra laborando
                </FieldLegend>

                <FieldDescription>
                  Seleccione uno o más sectores según corresponda.
                </FieldDescription>

                <div className="grid gap-6 sm:grid-cols-3">
                  <CheckboxGroupField
                    control={control}
                    name={empleoField(index, "sectorPrimario")}
                    legend="Primario"
                    options={SECTOR_PRIMARIO_OPTIONS}
                  />

                  <CheckboxGroupField
                    control={control}
                    name={empleoField(index, "sectorSecundario")}
                    legend="Secundario"
                    options={SECTOR_SECUNDARIO_OPTIONS}
                  />

                  <CheckboxGroupField
                    control={control}
                    name={empleoField(index, "sectorTerciario")}
                    legend="Terciario"
                    options={SECTOR_TERCIARIO_OPTIONS}
                  />
                </div>
              </FieldSet>

              {/* ------------------------------------------------------------- */}
              {/* Tipo de actividad                                            */}
              {/* ------------------------------------------------------------- */}

              <CheckboxGroupField
                control={control}
                name={empleoField(index, "tipoActividad")}
                otroName={empleoField(index, "tipoActividadOtro")}
                legend="Tipo de actividad"
                options={TIPO_ACTIVIDAD_OPTIONS}
              />

              {/* ------------------------------------------------------------- */}
              {/* Actividades principales                                      */}
              {/* ------------------------------------------------------------- */}

              <Controller
                control={control}
                name={empleoField(index, "actividadesPrincipales")}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Detalle las actividades principales que desarrolla en su
                      empleo actual
                    </FieldLabel>

                    <Textarea
                      id={field.name}
                      rows={4}
                      {...field}
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                    />

                    <FieldDescription>Máximo 500 palabras.</FieldDescription>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* ------------------------------------------------------------- */}
              {/* Estrategia                                                   */}
              {/* ------------------------------------------------------------- */}

              <CheckboxGroupField
                control={control}
                name={empleoField(index, "estrategiaEmpleoActual")}
                otroName={empleoField(index, "estrategiaEmpleoActualOtro")}
                legend="¿Cuál fue la estrategia que lo llevó a conseguir este empleo actual?"
                options={ESTRATEGIA_CONSECUCION_EMPLEO_OPTIONS}
              />

              {/* ------------------------------------------------------------- */}
              {/* Valoraciones                                                 */}
              {/* ------------------------------------------------------------- */}

              <RadioOptionsField
                control={control}
                name={empleoField(index, "valoracionCoincidenciaConocimientos")}
                legend="Coincidencia de los conocimientos adquiridos con las exigencias del campo laboral"
                options={VALORACION_NIVEL_OPTIONS}
              />

              <RadioOptionsField
                control={control}
                name={empleoField(
                  index,
                  "valoracionCapacidadResolverProblemas",
                )}
                legend="Conocimientos adquiridos para responder a los problemas del trabajo"
                options={VALORACION_NIVEL_OPTIONS}
              />

              <RadioOptionsField
                control={control}
                name={empleoField(index, "valoracionImpactoSocial")}
                legend="Impacto en la sociedad de sus actividades profesionales"
                options={VALORACION_IMPACTO_OPTIONS}
              />

              <RadioOptionsField
                control={control}
                name={empleoField(index, "valoracionPertinenciaPrograma")}
                legend="Pertinencia del programa de estudios al campo laboral actual"
                options={VALORACION_NIVEL_OPTIONS}
              />
            </>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

export default EmpleoFieldset;
