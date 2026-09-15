// @/components/informacion-laboral/informacion-laboral-form.tsx
//
// Formulario de la Sección 3 (Información laboral) del perfil de afiliado.
//
// - useForm + zodResolver, con los 3 genéricos de RHF (input / context /
//   output) para que `handleSubmit` reciba el tipo ya parseado por Zod
//   (con los `.default(...)` aplicados) mientras que los campos del form
//   trabajan con el tipo "de entrada" (más permisivo, p.ej. arrays
//   opcionales o números que llegan como string desde un <input>).
// - <Controller /> para todos los campos controlados (Checkbox, RadioGroup,
//   Input numéricos), siguiendo el patrón recomendado por shadcn/ui:
//   https://ui.shadcn.com/docs/forms/react-hook-form
// - El componente Field de shadcn (`Field`, `FieldSet`, `FieldLegend`,
//   `FieldGroup`, `FieldError`, ...) para accesibilidad y consistencia
//   visual: https://ui.shadcn.com/docs/components/field
// - `defaultValues` como prop para poder rellenar el formulario con una
//   respuesta previa (edición) — se hace merge profundo con valores vacíos
//   para que los campos no controlados/undefined no rompan el formulario.
//
// El endpoint de envío se deja pendiente: se expone a través del prop
// `onSubmit`, que recibe el payload ya validado y tipado
// (`InformacionLaboralSeccionOutput`).

"use client";

import { useEffect, useMemo } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";

import { informacionLaboralSeccionSchema } from "@/lib/validation/informacion-laboral";

import { EmpleoFieldset } from "./empleo-fieldset";
import {
  BooleanRadioField,
  CheckboxGroupField,
  RadioOptionsField,
} from "./informacion-laboral-fields";
import {
  CAUSA_DESEMPLEO_OPTIONS,
  ESTRATEGIA_CONSECUCION_EMPLEO_OPTIONS,
  FACTOR_EMPLEO_OPTIONS,
  TIEMPO_PRIMER_EMPLEO_OPTIONS,
} from "./informacion-laboral-options";

/* -------------------------------------------------------------------------- */
/* Tipos derivados del esquema (z.input / z.output)                          */
/* -------------------------------------------------------------------------- */

// Lo que el formulario acepta mientras el usuario escribe (antes de que Zod
// aplique `.default(...)` / coerciones). Ej.: los arrays con `.default([])`
// son opcionales aquí.
export type InformacionLaboralFormValues = z.input<
  typeof informacionLaboralSeccionSchema
>;

// Lo que recibe `onSubmit` una vez que Zod validó y normalizó los datos.
export type InformacionLaboralSeccionOutput = z.output<
  typeof informacionLaboralSeccionSchema
>;

type EmpleoFormValues =
  InformacionLaboralFormValues["historialEmpleos"][number];

export type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

/* -------------------------------------------------------------------------- */
/* Valores por defecto                                                        */
/* -------------------------------------------------------------------------- */

export function emptyEmpleo(): EmpleoFormValues {
  return {
    puesto: "",
    institucion: "",
    fechaInicioAnio: "" as unknown as number,
    fechaInicioMes: "" as unknown as number,
    esActual: false,
    fechaFinAnio: null,
    fechaFinMes: null,
    tipoContratacion: null,
    // OJO: los campos "Otro" usan `null` (no "") como vacío: el esquema los
    // define como `.min(1)....nullable().optional()`, así que "" fallaría la
    // validación de longitud mínima en cuanto el campo esté presente, aun
    // sin haber sido tocado por el usuario.
    tipoContratacionOtro: null,
    salarioMensualBruto: null,
    horasSemanales: null,
    tipoInstitucion: [],
    tipoInstitucionOtro: null,
    telefonoOrganismo: "",
    sectorPrimario: [],
    sectorSecundario: [],
    sectorTerciario: [],
    tipoActividad: [],
    tipoActividadOtro: null,
    actividadesPrincipales: "",
    estrategiaEmpleoActual: [],
    estrategiaEmpleoActualOtro: null,
    valoracionCoincidenciaConocimientos: null,
    valoracionCapacidadResolverProblemas: null,
    valoracionImpactoSocial: null,
    valoracionPertinenciaPrograma: null,
  };
}

function buildDefaultValues(
  overrides?: DeepPartial<InformacionLaboralFormValues>,
): InformacionLaboralFormValues {
  const info = overrides?.informacionLaboral;
  const empleosOverride = overrides?.historialEmpleos;

  // `tiempoPrimerEmpleo` es requerido en el esquema (sin valor por defecto),
  // por lo que puede quedar `undefined` mientras el usuario no elige una
  // opción; RHF y el RadioGroup controlado lo manejan bien en runtime, pero
  // el tipo generado por Zod no permite `undefined` explícitamente, de ahí
  // el único cast al final de la función.
  const result = {
    informacionLaboral: {
      tiempoPrimerEmpleo: info?.tiempoPrimerEmpleo,
      factoresEmpleo: info?.factoresEmpleo ?? [],
      // Los campos "Otro" son `null` por defecto (ver nota en `emptyEmpleo`).
      factoresEmpleoOtro: info?.factoresEmpleoOtro ?? null,
      laboraActualmente: info?.laboraActualmente ?? false,
      causasDesempleo: info?.causasDesempleo ?? [],
      causasDesempleoOtro: info?.causasDesempleoOtro ?? null,
      estrategiaPostgrado: info?.estrategiaPostgrado ?? [],
      estrategiaPostgradoOtro: info?.estrategiaPostgradoOtro ?? null,
    },
    historialEmpleos: empleosOverride?.length
      ? empleosOverride.map(
          (empleo) => ({ ...emptyEmpleo(), ...empleo }) as EmpleoFormValues,
        )
      : [],
  };

  return result as InformacionLaboralFormValues;
}

/* -------------------------------------------------------------------------- */
/* Componente                                                                 */
/* -------------------------------------------------------------------------- */

const MAX_EMPLEOS = 50;

interface InformacionLaboralFormProps {
  /** Respuesta previa del afiliado, si existe, para rellenar el formulario. */
  defaultValues?: DeepPartial<InformacionLaboralFormValues>;
  /** Se invoca con el payload ya validado por Zod. El endpoint queda a cargo del caller. */
  onSubmit?: (data: InformacionLaboralSeccionOutput) => Promise<void> | void;
  onCancel?: () => void;
}

export function InformacionLaboralForm({
  defaultValues,
  onSubmit,
  onCancel,
}: InformacionLaboralFormProps) {
  // Solo se calcula una vez: cambios posteriores al prop `defaultValues` no
  // deben resetear un formulario que el usuario ya está editando. Si se
  // necesita rehidratar el form tras un fetch async, usar `form.reset(...)`
  // en un `useEffect` desde el componente padre.
  const initialValues = useMemo(() => buildDefaultValues(defaultValues), []); // eslint-disable-line react-hooks/exhaustive-deps

  const form = useForm<
    InformacionLaboralFormValues,
    unknown,
    InformacionLaboralSeccionOutput
  >({
    resolver: zodResolver(informacionLaboralSeccionSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  const { control, handleSubmit, formState, setValue, resetField, trigger } =
    form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "historialEmpleos",
  });

  const tiempoPrimerEmpleo = useWatch({
    control,
    name: "informacionLaboral.tiempoPrimerEmpleo",
  });
  const laboraActualmente = useWatch({
    control,
    name: "informacionLaboral.laboraActualmente",
  });

  const consiguioEmpleo = tiempoPrimerEmpleo !== "sin_empleo";

  // Si nunca consiguió empleo: no aplican factores/estrategia, y tampoco
  // puede estar laborando actualmente.
  useEffect(() => {
    if (!consiguioEmpleo) {
      resetField("informacionLaboral.factoresEmpleo", { defaultValue: [] });
      resetField("informacionLaboral.factoresEmpleoOtro", {
        defaultValue: null,
      });
      resetField("informacionLaboral.estrategiaPostgrado", {
        defaultValue: [],
      });
      resetField("informacionLaboral.estrategiaPostgradoOtro", {
        defaultValue: null,
      });
      setValue("informacionLaboral.laboraActualmente", false, {
        shouldDirty: false,
      });
      trigger();
    }
  }, [consiguioEmpleo, resetField, setValue, trigger]);

  // Si labora actualmente, "causas de desempleo" no aplica.
  useEffect(() => {
    if (laboraActualmente) {
      resetField("informacionLaboral.causasDesempleo", { defaultValue: [] });
      resetField("informacionLaboral.causasDesempleoOtro", {
        defaultValue: null,
      });
      trigger();
    }
  }, [laboraActualmente, resetField, trigger]);

  const submit = handleSubmit(
    async (data) => {
      console.log("✅ Formulario válido. Payload:", data);

      if (onSubmit) {
        await onSubmit(data);
        return;
      }

      console.log("Información laboral", data);
    },
    (errors) => {
      console.log("❌ Error de validación del formulario");
      console.log("Errores RHF/Zod:", errors);

      // Para inspeccionar cada error de forma más legible:
      console.log("Errores serializados:", JSON.stringify(errors, null, 2));
    },
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-10">
      {/* --------------------------------------------------------------- */}
      {/* Situación laboral general                                       */}
      {/* --------------------------------------------------------------- */}
      <FieldSet>
        <FieldLegend>Información laboral</FieldLegend>
        <FieldDescription>
          Información sobre la situación laboral del egresado, incluyendo tiempo
          para conseguir el primer empleo, factores que influyeron, historial de
          empleos detallado con énfasis en el empleo actual y causas de
          desempleo si aplica.
        </FieldDescription>

        <FieldGroup>
          <RadioOptionsField
            control={control}
            name="informacionLaboral.tiempoPrimerEmpleo"
            legend="¿Cuánto tiempo le llevó conseguir empleo después de haber egresado del programa (Maestría/Doctorado)?"
            options={TIEMPO_PRIMER_EMPLEO_OPTIONS}
          />

          {consiguioEmpleo && (
            <CheckboxGroupField
              control={control}
              name="informacionLaboral.factoresEmpleo"
              otroName="informacionLaboral.factoresEmpleoOtro"
              legend="¿Qué factores considera que influyeron para conseguir ese primer empleo después del posgrado?"
              options={FACTOR_EMPLEO_OPTIONS}
            />
          )}

          {consiguioEmpleo && (
            <CheckboxGroupField
              control={control}
              name="informacionLaboral.estrategiaPostgrado"
              otroName="informacionLaboral.estrategiaPostgradoOtro"
              legend="¿Cuál fue la estrategia que lo llevó a conseguir el empleo después de estudiar el posgrado?"
              options={ESTRATEGIA_CONSECUCION_EMPLEO_OPTIONS}
            />
          )}

          <FieldSeparator />

          {consiguioEmpleo && (
            <BooleanRadioField
              control={control}
              name="informacionLaboral.laboraActualmente"
              label="¿Labora actualmente?"
            />
          )}
          {!consiguioEmpleo && (
            <FieldDescription>
              Como aún no ha conseguido empleo, se considerará que no labora
              actualmente.
            </FieldDescription>
          )}

          {laboraActualmente === false && (
            <CheckboxGroupField
              control={control}
              name="informacionLaboral.causasDesempleo"
              otroName="informacionLaboral.causasDesempleoOtro"
              legend="Las causas que le impiden laborar actualmente son"
              options={CAUSA_DESEMPLEO_OPTIONS}
            />
          )}
        </FieldGroup>
      </FieldSet>

      <FieldSeparator />

      {/* --------------------------------------------------------------- */}
      {/* Historial de empleos                                            */}
      {/* --------------------------------------------------------------- */}
      <FieldSet>
        <FieldLegend>Historial de empleos posteriores al egreso</FieldLegend>
        <FieldDescription>
          Registre todos los empleos desempeñados desde el egreso del programa,
          incluyendo el empleo actual si corresponde. Se recomienda capturar
          primero el empleo más antiguo y finalizar con el más reciente. Puede
          registrar empleos simultáneos o con periodos solapados.
        </FieldDescription>

        <div className="space-y-6">
          {fields.map((field, index) => (
            <EmpleoFieldset
              key={field.id}
              control={control}
              setValue={setValue}
              resetField={resetField}
              trigger={trigger}
              index={index}
              onRemove={() => remove(index)}
              canRemove={fields.length > 0}
              permiteEmpleoActual={laboraActualmente === true}
            />
          ))}
        </div>

        {/* Error a nivel de arreglo completo (p. ej. más de 50 empleos). Los
            errores de cada empleo individual se muestran dentro de su propio
            <EmpleoFieldset />. */}
        {typeof formState.errors.historialEmpleos?.message === "string" && (
          <FieldError
            errors={[{ message: formState.errors.historialEmpleos.message }]}
          />
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => append(emptyEmpleo())}
          disabled={fields.length >= MAX_EMPLEOS}
        >
          <Plus className="size-4" />
          Agregar empleo
        </Button>
      </FieldSet>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Guardando..." : "Guardar sección"}
        </Button>
      </div>
    </form>
  );
}

export default InformacionLaboralForm;
