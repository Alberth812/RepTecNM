// @/components/informacion-laboral/informacion-laboral-form.tsx
//
// Formulario de la Seccin 3 (Informacin laboral) del perfil de afiliado.
//
// - useForm + zodResolver, con los 3 genricos de RHF (input / context /
// output) para que `handleSubmit` reciba el tipo ya parseado por Zod
// (con los `.default(...)` aplicados) mientras que los campos del form
// trabajan con el tipo "de entrada" (ms permisivo, p.ej. arrays
// opcionales o nmeros que llegan como string desde un <input>).
// - <Controller /> para todos los campos controlados (Checkbox, RadioGroup,
// Input numricos), siguiendo el patrn recomendado por shadcn/ui:
// https://ui.shadcn.com/docs/forms/react-hook-form
// - El componente Field de shadcn (`Field`, `FieldSet`, `FieldLegend`,
// `FieldGroup`, `FieldError`, ...) para accesibilidad y consistencia
// visual: https://ui.shadcn.com/docs/components/field
// - `defaultValues` como prop para poder rellenar el formulario con una
// respuesta previa (edicin) se hace merge profundo con valores vacos
// para que los campos no controlados/undefined no rompan el formulario.
//
// El endpoint de envo se deja pendiente: se expone a travs del prop
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
/* Tipos derivados del esquema (z.input / z.output) */
/* -------------------------------------------------------------------------- */

// Lo que el formulario acepta mientras el usuario escribe (antes de que Zod
// aplique `.default(...)` / coerciones). Ej.: los arrays con `.default([])`
// son opcionales aqu.

export type InformacionLaboralFormValues = z.input<
 typeof informacionLaboralSeccionSchema
>;

// Lo que recibe `onSubmit` una vez que Zod valid y normaliz los datos.
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
/* Valores por defecto */
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
 // OJO: los campos "Otro" usan `null` (no "") como vaco: el esquema los
 // define como `.min(1)....nullable().optional()`, as que "" fallara la
 // validacin de longitud mnima en cuanto el campo est presente, aun
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
 // opcin; RHF y el RadioGroup controlado lo manejan bien en runtime, pero
 // el tipo generado por Zod no permite `undefined` explcitamente, de ah
 // el nico cast al final de la funcin.
 const result = {
 informacionLaboral: {
 tiempoPrimerEmpleo: info?.tiempoPrimerEmpleo ?? null,
 factoresEmpleo: info?.factoresEmpleo ?? [],
 // Los campos "Otro" son `null` por defecto (ver nota en `emptyEmpleo`).
 factoresEmpleoOtro: info?.factoresEmpleoOtro ?? null,
 laboraActualmente: info?.laboraActualmente ?? null,
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

 return result;
}

/* -------------------------------------------------------------------------- */
/* Componente */
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
 // deben resetear un formulario que el usuario ya est editando. Si se
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

 const { control, handleSubmit, formState, setValue, resetField } = form;

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

 // `tiempoPrimerEmpleo` es el activador de toda la seccin: mientras no
 // tenga un valor (null an no respondido), no debe mostrarse ninguna
 // pregunta dependiente. Una vez respondido, se bifurca igual que el
 // `superRefine` del esquema:
 // - sinEmpleo: nunca consigui un primer empleo.
 // - haConseguidoEmpleo: cualquier otro valor, s lo consigui en algn
 // momento (independientemente de si labora actualmente o no).
 const sinEmpleo = tiempoPrimerEmpleo === "sin_empleo";
 const haConseguidoEmpleo = tiempoPrimerEmpleo != null && !sinEmpleo;

 // Rama "sin empleo": factoresEmpleo/estrategiaPostgrado no aplican (el
 // esquema rechaza que vengan con elementos), y tampoco puede estar
 // laborando actualmente.
 useEffect(() => {
 if (sinEmpleo) {
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
 }
 }, [sinEmpleo, resetField, setValue]);

 // Rama "consigui empleo": causasDesempleo no aplica. Esto depende solo de
 // haConseguidoEmpleo, no de laboraActualmente: el esquema bifurca
 // nicamente por tiempoPrimerEmpleo, as que "causas de desempleo" es
 // exclusiva de quien nunca ha tenido un primer empleo.
 useEffect(() => {
 if (haConseguidoEmpleo) {
 resetField("informacionLaboral.causasDesempleo", { defaultValue: [] });
 resetField("informacionLaboral.causasDesempleoOtro", {
 defaultValue: null,
 });
 }
 }, [haConseguidoEmpleo, resetField]);

 const submit = handleSubmit(
 async (data) => {
 console.log(" Formulario vlido. Payload:", data);

 if (onSubmit) {
 await onSubmit(data);
 return;
 }

 console.log("Informacin laboral", data);
 },
 (errors) => {
 console.log(" Error de validacin del formulario");
 console.log("Errores RHF/Zod:", errors);

 // Para inspeccionar cada error de forma ms legible:
 console.log("Errores serializados:", JSON.stringify(errors, null, 2));
 },
 );

 return (
 <form onSubmit={submit} noValidate className="space-y-10">
 {/* --------------------------------------------------------------- */}
 {/* Situacin laboral general */}
 {/* --------------------------------------------------------------- */}

 <FieldSet>
 <FieldLegend>Informacin laboral</FieldLegend>
 <FieldDescription>
 Informacin sobre la situacin laboral del egresado, incluyendo tiempo
 para conseguir el primer empleo, factores que influyeron, historial de
 empleos detallado con nfasis en el empleo actual y causas de
 desempleo si aplica.
 </FieldDescription>

 <FieldGroup>
 <RadioOptionsField
 control={control}
 name="informacionLaboral.tiempoPrimerEmpleo"
 legend="Cunto tiempo le llev conseguir empleo despus de haber egresado del programa (Maestra/Doctorado)?"
 options={TIEMPO_PRIMER_EMPLEO_OPTIONS}
 />

 {haConseguidoEmpleo && (
 <CheckboxGroupField
 control={control}
 name="informacionLaboral.factoresEmpleo"
 otroName="informacionLaboral.factoresEmpleoOtro"
 legend="Qu factores considera que influyeron para conseguir ese primer empleo despus del posgrado?"
 options={FACTOR_EMPLEO_OPTIONS}
 />
 )}

 {haConseguidoEmpleo && (
 <CheckboxGroupField
 control={control}
 name="informacionLaboral.estrategiaPostgrado"
 otroName="informacionLaboral.estrategiaPostgradoOtro"
 legend="Cul fue la estrategia que lo llev a conseguir el empleo despus de estudiar el posgrado?"
 options={ESTRATEGIA_CONSECUCION_EMPLEO_OPTIONS}
 />
 )}

 <FieldSeparator />

 {haConseguidoEmpleo && (
 <BooleanRadioField
 control={control}
 name="informacionLaboral.laboraActualmente"
 label="Labora actualmente?"
 />
 )}
 {sinEmpleo && (
 <FieldDescription>
 Como an no ha conseguido empleo, se considerar que no labora
 actualmente.
 </FieldDescription>
 )}

 {sinEmpleo && (
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
 {/* Historial de empleos */}
 {/* --------------------------------------------------------------- */}
 <FieldSet>
 <FieldLegend>Historial de empleos posteriores al egreso</FieldLegend>
 <FieldDescription>
 Registre todos los empleos desempeados desde el egreso del programa,
 incluyendo el empleo actual si corresponde. Se recomienda capturar
 primero el empleo ms antiguo y finalizar con el ms reciente. Puede
 registrar empleos simultneos o con periodos solapados.
 </FieldDescription>

 <div className="space-y-6">
 {fields.map((field, index) => (
 <EmpleoFieldset
 key={field.id}
 control={control}
 resetField={resetField}
 index={index}
 onRemove={() => remove(index)}
 canRemove={fields.length > 0}
 permiteEmpleoActual={laboraActualmente === true}
 />
 ))}
 </div>

 {/* Error a nivel de arreglo completo (p. ej. ms de 50 empleos). Los
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
 {formState.isSubmitting ? "Guardando..." : "Guardar seccin"}
 </Button>
 </div>
 </form>
 );
}

export default InformacionLaboralForm;
