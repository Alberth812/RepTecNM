// @/lib/validations/afiliados-investigacion.ts

import { z } from "zod";
import {
 PRODUCCION_ACADEMICA_VALUES,
 SITUACION_SNI_VALUES,
} from "./investigacion-options";
// Solo se usa como tipo (`$inferSelect`); no arrastra código de Drizzle al
// bundle del cliente si este schema de validación también se importa desde
// un componente "use client".
import type { afiliadosInvestigacion } from "@/lib/db/schema/afiliados-investigacion";

// ---------------------------------------------------------------------------
// Helpers de campo — reglas que NO dependen de otros campos (self-contained).
// Las reglas cruzadas (conditional_required / clear_when_hidden) se resuelven
// más abajo en `superRefine`.
// ---------------------------------------------------------------------------

/** Boolean tri-state a nivel de formulario. null = sin responder. */
const triStateBoolean = z.boolean().nullable();

/**
 * Texto/textarea nullable con normalización (text_behavior).
 *
 * A propósito NO se usa `z.preprocess`: preprocess colapsa el tipo de
 * "input" del campo a `unknown`, lo cual rompe el tipado de
 * `z.input<...>` que luego usamos para el estado del formulario en RHF.
 * En su lugar: `nullable()` deja el input como `string | null`, `transform`
 * recorta y normaliza "" -> null (esto es lo que cambia el "output"), y
 * `superRefine` valida longitud solo cuando el valor (ya normalizado) no es
 * null — así un campo vacío pero oculto nunca dispara "muy corto".
 */
function nullableTrimmedText(minLength: number, maxLength: number) {
 return z
 .string()
 .nullable()
 .transform((value) => {
 if (value === null) return null;
 const trimmed = value.trim();
 return trimmed.length === 0 ? null : trimmed;
 })
 .superRefine((value, ctx) => {
 if (value === null) return;
 if (value.length < minLength) {
 ctx.addIssue({
 code: "custom",
 minimum: minLength,
 type: "string",
 inclusive: true,
 message: `Debe tener al menos ${minLength} caracteres`,
 });
 }
 if (value.length > maxLength) {
 ctx.addIssue({
 code: "custom",
 maximum: maxLength,
 type: "string",
 inclusive: true,
 message: `Debe tener como máximo ${maxLength} caracteres`,
 });
 }
 });
}

export const produccionAcademicaOpcionSchema = z.enum([
 ...PRODUCCION_ACADEMICA_VALUES,
]);
export const situacionSniOpcionSchema = z.enum([...SITUACION_SNI_VALUES]);

// ---------------------------------------------------------------------------
// Shape — se exporta "plano" (sin envolver en z.object) para poder
// reutilizarlo/extenderlo después en el formulario del frontend, por ejemplo
// con z.object(afiliadoInvestigacionShape).pick({...}) para validar un paso
// de un wizard.
// ---------------------------------------------------------------------------

export const afiliadoInvestigacionShape = {
 participacionProduccionConocimiento: triStateBoolean,

 // checkbox_behavior: array de códigos, sin duplicados. unknown_values ya
 // queda cubierto por z.enum (rechaza cualquier código fuera del catálogo).
 produccionAcademica: z
 .array(produccionAcademicaOpcionSchema)
 .refine(
 (values) => new Set(values).size === values.length,
 "No se permiten actividades duplicadas",
 )
 .nullable(),

 otrosProductosAcademicos: nullableTrimmedText(1, 1000),

 situacionSni: situacionSniOpcionSchema.nullable(),
 sniPeriodoAnterior: nullableTrimmedText(2, 300),
 sniPeriodoActual: nullableTrimmedText(2, 300),

 redTematicaConacyt: triStateBoolean,
 nombreRed: nullableTrimmedText(2, 200),

 haRecibidoPremiosReconocimientos: triStateBoolean,
 detalleReconocimiento: nullableTrimmedText(2, 1000),

 perteneceAcademiaSociedad: triStateBoolean,
 nombreOrganizacion: nullableTrimmedText(2, 250),
};

/** Schema base: tipos y reglas propias de cada campo, sin reglas cruzadas. */
export const afiliadoInvestigacionBaseSchema = z.object(
 afiliadoInvestigacionShape,
);

export type AfiliadoInvestigacionInput = z.infer<
 typeof afiliadoInvestigacionBaseSchema
>;

// ---------------------------------------------------------------------------
// Reglas cruzadas (superRefine)
// ---------------------------------------------------------------------------

type Path = (string | number)[];

function isEmptyValue(value: unknown): boolean {
 return (
 value === null ||
 value === undefined ||
 (Array.isArray(value) && value.length === 0)
 );
}

/** Obligatorio cuando `isVisible` es true; debe quedar vacío cuando es false. */
function requireWhenVisible(
 ctx: z.RefinementCtx,
 value: unknown,
 isVisible: boolean,
 path: Path,
 requiredMessage: string,
 clearedMessage: string,
) {
 const empty = isEmptyValue(value);
 if (isVisible && empty) {
 ctx.addIssue({
 code: z.ZodIssueCode.custom,
 path,
 message: requiredMessage,
 });
 }
 if (!isVisible && !empty) {
 ctx.addIssue({
 code: z.ZodIssueCode.custom,
 path,
 message: clearedMessage,
 });
 }
}

/** Nunca obligatorio, pero debe quedar vacío cuando `isVisible` es false. */
function forbidWhenHidden(
 ctx: z.RefinementCtx,
 value: unknown,
 isVisible: boolean,
 path: Path,
 clearedMessage: string,
) {
 if (!isVisible && !isEmptyValue(value)) {
 ctx.addIssue({
 code: z.ZodIssueCode.custom,
 path,
 message: clearedMessage,
 });
 }
}

function validarReglasCruzadas(
 data: AfiliadoInvestigacionInput,
 ctx: z.RefinementCtx,
) {
 // --- boolean_behavior a nivel de envío final ---
 // A nivel de tipo estos campos son tri-state (nullable) para permitir
 // guardar el perfil incompleto; aquí, al validar el envío final, null se
 // rechaza pero false se acepta como respuesta válida.
 const requiredTopLevel: Array<[unknown, Path, string]> = [
 [
 data.participacionProduccionConocimiento,
 ["participacionProduccionConocimiento"],
 "Debe indicar si participó en producción de conocimiento",
 ],
 [
 data.situacionSni,
 ["situacionSni"],
 "Debe indicar su situación ante el SNI",
 ],
 [
 data.redTematicaConacyt,
 ["redTematicaConacyt"],
 "Debe indicar si participa en una red temática del CONACYT",
 ],
 [
 data.haRecibidoPremiosReconocimientos,
 ["haRecibidoPremiosReconocimientos"],
 "Debe indicar si ha recibido premios o reconocimientos",
 ],
 [
 data.perteneceAcademiaSociedad,
 ["perteneceAcademiaSociedad"],
 "Debe indicar si pertenece a alguna academia o sociedad",
 ],
 ];

 for (const [value, path, message] of requiredTopLevel) {
 if (value === null) {
 ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
 }
 }

 // --- Bloque 1: producción académica ---
 const produccionVisible = data.participacionProduccionConocimiento === true;

 requireWhenVisible(
 ctx,
 data.produccionAcademica,
 produccionVisible,
 ["produccionAcademica"],
 "Seleccione al menos una actividad de producción académica",
 "No debe seleccionar actividades de producción académica",
 );

 // required=false / conditional_required=false: solo se valida el "clear",
 // nunca se exige como obligatorio.
 forbidWhenHidden(
 ctx,
 data.otrosProductosAcademicos,
 produccionVisible,
 ["otrosProductosAcademicos"],
 "No debe especificar otra actividad de producción académica",
 );

 // --- Bloque 2: SNI ---
 const sniAnteriorVisible =
 data.situacionSni === "anterior" ||
 data.situacionSni === "anterior_y_actual";
 const sniActualVisible =
 data.situacionSni === "actual" || data.situacionSni === "anterior_y_actual";

 requireWhenVisible(
 ctx,
 data.sniPeriodoAnterior,
 sniAnteriorVisible,
 ["sniPeriodoAnterior"],
 "Especifique el nivel y periodo anterior en el SNI",
 "No debe especificar un periodo anterior del SNI",
 );

 requireWhenVisible(
 ctx,
 data.sniPeriodoActual,
 sniActualVisible,
 ["sniPeriodoActual"],
 "Especifique el nivel y periodo actual en el SNI",
 "No debe especificar un periodo actual del SNI",
 );

 // --- Bloque 3: red temática CONACYT ---
 requireWhenVisible(
 ctx,
 data.nombreRed,
 data.redTematicaConacyt === true,
 ["nombreRed"],
 "Especifique el nombre de la red temática",
 "No debe especificar una red temática",
 );

 // --- Bloque 4: premios y reconocimientos ---
 requireWhenVisible(
 ctx,
 data.detalleReconocimiento,
 data.haRecibidoPremiosReconocimientos === true,
 ["detalleReconocimiento"],
 "Especifique el reconocimiento recibido",
 "No debe especificar un reconocimiento",
 );

 // --- Bloque 5: academia / sociedad ---
 requireWhenVisible(
 ctx,
 data.nombreOrganizacion,
 data.perteneceAcademiaSociedad === true,
 ["nombreOrganizacion"],
 "Especifique el nombre de la academia, sociedad u organización",
 "No debe especificar una organización",
 );
}

// ---------------------------------------------------------------------------
// Schema final — usar este para validar el envío/submit, tanto en cliente
// (p. ej. con react-hook-form + zodResolver) como en el servidor antes de
// insertar/actualizar en BD.
// ---------------------------------------------------------------------------

export const afiliadoInvestigacionSchema =
 afiliadoInvestigacionBaseSchema.superRefine(validarReglasCruzadas);

export type AfiliadoInvestigacion = AfiliadoInvestigacionInput;

/**
 * z.input / z.output del schema final.
 *
 * - `AfiliadoInvestigacionFormInput` (z.input): el tipo de lo que RHF guarda
 * mientras el usuario llena el formulario (antes del `transform` de cada
 * campo de texto, p. ej. puede traer espacios sin recortar).
 * - `AfiliadoInvestigacionFormOutput` (z.output): el tipo ya validado y
 * normalizado que recibe `onSubmit` gracias al 3er genérico de
 * `useForm<TFieldValues, TContext, TTransformedValues>`.
 *
 * En este schema en particular ambos tipos son estructuralmente iguales
 * (los `transform` no cambian el tipo, solo el valor), pero se exportan por
 * separado porque es el patrón correcto para un schema con `transform` y es
 * lo que espera `zodResolver` para tipar `handleSubmit` correctamente.
 */
export type AfiliadoInvestigacionFormInput = z.input<
 typeof afiliadoInvestigacionSchema
>;
export type AfiliadoInvestigacionFormOutput = z.output<
 typeof afiliadoInvestigacionSchema
>;

// ---------------------------------------------------------------------------
// Schema de borrador — todos los campos opcionales y sin reglas cruzadas.
// Útil para un endpoint de autoguardado (PATCH) mientras el usuario llena
// el formulario por secciones, sin bloquear por campos aún no visibles.
// ---------------------------------------------------------------------------

export const afiliadoInvestigacionDraftSchema =
 afiliadoInvestigacionBaseSchema.partial();

// ---------------------------------------------------------------------------
// Puente BD -> formulario, para usar desde un Server Component.
//
// Nota: se importa el *tipo* de la tabla (import type), no runtime, así que
// esto no crea una dependencia circular real entre schema/validations.
// ---------------------------------------------------------------------------

export const AFILIADO_INVESTIGACION_DEFAULT_VALUES: AfiliadoInvestigacionFormInput =
 {
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

export type AfiliadoInvestigacionRow =
 typeof afiliadosInvestigacion.$inferSelect;

/**
 * Convierte la fila devuelta por `db.query.afiliadosInvestigacion.findFirst`
 * en el shape que espera el formulario. Si no existe registro todavía
 * (afiliado que no ha llenado esta sección), devuelve los valores por
 * defecto (todo null).
 */
export function toAfiliadoInvestigacionFormValues(
 row: AfiliadoInvestigacionRow | null | undefined,
): AfiliadoInvestigacionFormInput {
 if (!row) return AFILIADO_INVESTIGACION_DEFAULT_VALUES;

 return {
 participacionProduccionConocimiento:
 row.participacionProduccionConocimiento,
 produccionAcademica: row.produccionAcademica,
 otrosProductosAcademicos: row.otrosProductosAcademicos,
 situacionSni: row.situacionSni,
 sniPeriodoAnterior: row.sniPeriodoAnterior,
 sniPeriodoActual: row.sniPeriodoActual,
 redTematicaConacyt: row.redTematicaConacyt,
 nombreRed: row.nombreRed,
 haRecibidoPremiosReconocimientos: row.haRecibidoPremiosReconocimientos,
 detalleReconocimiento: row.detalleReconocimiento,
 perteneceAcademiaSociedad: row.perteneceAcademiaSociedad,
 nombreOrganizacion: row.nombreOrganizacion,
 };
}
