// @/lib/validations/evaluacion-programa-estudios.ts
import { z } from "zod";

// ---------------------------------------------------------------------------
// Catálogos / enums (deben coincidir exactamente con los pgEnum de Drizzle)
// ---------------------------------------------------------------------------

export const VALORACION_OPTIONS = [
 "excelente",
 "buena",
 "regular",
 "mala",
 "pesima",
] as const;
export const valoracionSchema = z.enum(VALORACION_OPTIONS);
export type Valoracion = z.infer<typeof valoracionSchema>;

export const SATISFACCION_FORMACION_OPTIONS = [
 "totalmente_satisfecho",
 "muy_satisfecho",
 "regularmente_satisfecho",
 "poco_satisfecho",
 "nada_satisfecho",
] as const;
export const satisfaccionFormacionSchema = z.enum(
 SATISFACCION_FORMACION_OPTIONS,
);
export type SatisfaccionFormacion = z.infer<typeof satisfaccionFormacionSchema>;

export const CUMPLIMIENTO_EXPECTATIVAS_OPTIONS = [
 "muy_de_acuerdo",
 "de_acuerdo",
 "ni_de_acuerdo_ni_en_desacuerdo",
 "en_desacuerdo",
 "muy_en_desacuerdo",
] as const;
export const cumplimientoExpectativasSchema = z.enum(
 CUMPLIMIENTO_EXPECTATIVAS_OPTIONS,
);
export type CumplimientoExpectativas = z.infer<
 typeof cumplimientoExpectativasSchema
>;

// ---------------------------------------------------------------------------
// Helpers de validación / normalización
// (implementan las reglas "trim", "empty_value: null" y "scale 1-10 entero")
// ---------------------------------------------------------------------------

const scale1to10 = z
 .number({ error: "Debe ser un número" })
 .int("Debe ser un número entero")
 .min(1, "El valor mínimo es 1")
 .max(10, "El valor máximo es 10");

/** number | null | undefined -> number | null, validando 1-10 cuando hay valor */
function optionalScale1to10() {
 return z.preprocess(
 (val) => (val === undefined ? null : val),
 scale1to10.nullable(),
 );
}

/** string | null | undefined -> string (trim) | null. Nunca permite "" */
function optionalTrimmedText(min: number, max: number) {
 return z.preprocess(
 (val) => {
 if (val === undefined || val === null) return null;
 if (typeof val !== "string") return val;
 const trimmed = val.trim();
 return trimmed.length === 0 ? null : trimmed;
 },
 z
 .string()
 .min(min, `Debe tener al menos ${min} caracteres`)
 .max(max, `Debe tener como máximo ${max} caracteres`)
 .nullable(),
 );
}

const requiredTrimmedText = (min: number, max: number) =>
 z
 .string({ error: "Este campo es obligatorio" })
 .trim()
 .min(min, `Debe tener al menos ${min} caracteres`)
 .max(max, `Debe tener como máximo ${max} caracteres`);

// ---------------------------------------------------------------------------
// Matriz de infraestructura (JSONB) — claves exactas del catálogo `rows`
// ---------------------------------------------------------------------------

const INFRAESTRUCTURA_KEYS = [
 "equipo_computo_conectividad",
 "programas_informaticos",
 "bases_datos",
 "acervo_bibliografico",
 "area_estudios",
 "laboratorios",
 "equipamiento_insumos_laboratorios",
 "apoyo_gestion_administrativa",
 "actividades_extracurriculares",
] as const;

const evaluacionInfraestructuraSchema = z
 .object(
 Object.fromEntries(
 INFRAESTRUCTURA_KEYS.map((key) => [key, scale1to10]),
 ) as Record<(typeof INFRAESTRUCTURA_KEYS)[number], typeof scale1to10>,
 )
 .strict(); // rechaza claves fuera del catálogo definido

export type EvaluacionInfraestructuraInput = z.infer<
 typeof evaluacionInfraestructuraSchema
>;

// ---------------------------------------------------------------------------
// Esquema principal
// ---------------------------------------------------------------------------

const evaluacionProgramaEstudiosBaseSchema = z.object({
 nombreTesis: optionalTrimmedText(3, 500),

 correspondenciaPlanEstudios: valoracionSchema,
 estrategiasDidacticas: valoracionSchema,
 formasEvaluacion: valoracionSchema,
 bibliografia: valoracionSchema,

 asesoriaTesis: scale1to10,

 satisfaccionFormacion: satisfaccionFormacionSchema,

 evaluacionInfraestructura: evaluacionInfraestructuraSchema,

 tieneOtroAspectoInfraestructura:
 z.boolean(/*{
 required_error: "Este campo es obligatorio",
 invalid_type_error: "Debe ser verdadero o falso",
 }*/),
 otroAspectoInfraestructura: optionalTrimmedText(3, 300),
 calificacionOtroAspectoInfraestructura: optionalScale1to10(),

 cumplimientoExpectativas: cumplimientoExpectativasSchema,
 calidadPrograma: valoracionSchema,

 areasMejora: requiredTrimmedText(10, 2000),
 mejorasPlanEstudios: optionalTrimmedText(10, 2000),
});

export const evaluacionProgramaEstudiosSchema =
 evaluacionProgramaEstudiosBaseSchema
 .superRefine((data, ctx) => {
 // Regla cruzada (visible_when / required_when_visible):
 // si tieneOtroAspectoInfraestructura es true, ambos campos
 // condicionales pasan a ser obligatorios.
 if (data.tieneOtroAspectoInfraestructura) {
 if (data.otroAspectoInfraestructura === null) {
 ctx.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["otroAspectoInfraestructura"],
 message: "Debe especificar el otro aspecto de infraestructura.",
 });
 }
 if (data.calificacionOtroAspectoInfraestructura === null) {
 ctx.addIssue({
 code: z.ZodIssueCode.custom,
 path: ["calificacionOtroAspectoInfraestructura"],
 message:
 "Debe indicar la calificación del otro aspecto de infraestructura.",
 });
 }
 }
 })
 .transform((data) => {
 // Regla: "Conditional fields become null when condition is false".
 // Se normaliza sin importar qué haya llegado en el payload.
 if (!data.tieneOtroAspectoInfraestructura) {
 return {
 ...data,
 otroAspectoInfraestructura: null,
 calificacionOtroAspectoInfraestructura: null,
 };
 }
 return data;
 });

// Tipo de entrada (antes de validar/transformar) — útil para React Hook Form
export type EvaluacionProgramaEstudiosInput = z.input<
 typeof evaluacionProgramaEstudiosBaseSchema
>;
// Tipo de salida (después de validar/normalizar) — listo para insertar con Drizzle
export type EvaluacionProgramaEstudios = z.output<
 typeof evaluacionProgramaEstudiosSchema
>;
