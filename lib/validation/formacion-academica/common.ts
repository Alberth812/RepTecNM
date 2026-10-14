// @/lib/validations/formacion-academica/common.ts
//
// Utilidades compartidas por todos los esquemas de "Formación Académica"
// (recommended_zod_strategy + global_validation_notes). Sin dependencias de
// servidor: se puede importar tanto en frontend (formularios) como en backend.

import { z } from "zod";

/**
 * Envuelve un schema para que:
 * - el INPUT acepte `null` (así el estado "vacío" del form es válido a
 * nivel de tipos, sin necesitar `as unknown as`),
 * - el OUTPUT, una vez parseado con éxito, sea el tipo real (sin null).
 */
export function required<T extends z.ZodType>(
 schema: T,
 message = "Este campo es requerido.",
) {
 return schema
 .nullable()
 .refine((value): value is z.infer<T> => value !== null, { message });
}

/**
 * Año actual calculado en el momento en que se ejecuta la validación (no al
 * definir el esquema). Cumple con:
 * "El año actual debe obtenerse dinámicamente en tiempo de validación;
 * nunca debe codificarse permanentemente un año fijo."
 */
export function currentYear(): number {
 return new Date().getFullYear();
}

/**
 * Campo de año académico reutilizable: entero de 4 dígitos, >= 1970, nunca
 * mayor al año actual (global_validation_notes). El máximo se evalúa dentro
 * de un `refine` (no en `.max()`) para que se recalcule en cada validación.
 */
export const anioAcademicoBase = z
 .number({
 error: "El año debe ser un número.",
 })
 .int("El año debe ser un número entero de 4 dígitos.")
 .min(1970, "El año debe ser mayor o igual a 1970.")
 .refine((anio) => anio <= currentYear(), {
 message: "El año no puede ser mayor al año actual.",
 });

/** Variante nullish (para campos de año condicionados u opcionales). */
export const anioAcademicoOpcionalSchema = anioAcademicoBase.nullish();
export const anioAcademicoSchema = required(
 anioAcademicoBase,
 "Este campo es requerido.",
);

/** Atajo para registrar un issue de validación en una ruta específica. */
export function addCustomIssue(
 ctx: z.RefinementCtx,
 path: (string | number)[],
 message: string,
) {
 ctx.addIssue({ code: "custom", path, message });
}

function isEmptyValue(value: unknown, isYesNo: boolean): boolean {
 if (isYesNo) {
 return typeof value !== "boolean";
 }

 return (
 value === null ||
 value === undefined ||
 value === false ||
 (typeof value === "string" && value.trim().length === 0) ||
 (Array.isArray(value) && value.length === 0)
 );
}

/**
 * Traduce una condición `visible_when` del JSON de especificación a una
 * validación real de backend/frontend (global_validation_notes):
 * "Las condiciones de visibilidad de la UI no sustituyen la validación.
 * El servidor debe validar también que los campos condicionales sean
 * coherentes con el estado del registro."
 *
 * - Si `shouldBeVisible` es false, el valor debe llegar vacío (null/undefined/
 * ""/[]/false).
 * - Si `shouldBeVisible` es true y `requiredWhenVisible` es true, el valor no
 * puede llegar vacío. Por defecto NO se exige (varios campos condicionados
 * del JSON siguen siendo `required: false` incluso cuando son visibles).
 */
export function validateConditionalField(
 ctx: z.RefinementCtx,
 value: unknown,
 shouldBeVisible: boolean,
 path: (string | number)[],
 fieldLabel: string,
 options: { requiredWhenVisible?: boolean } = {},
 isYesNo: boolean = false,
) {
 const empty = isEmptyValue(value, isYesNo);

 if (!shouldBeVisible && !empty) {
 addCustomIssue(
 ctx,
 path,
 `${fieldLabel} no debe enviarse cuando no aplica.`,
 );
 return;
 }

 if (shouldBeVisible && options.requiredWhenVisible && empty) {
 addCustomIssue(ctx, path, `${fieldLabel} es requerido.`);
 }
}

/**
 * Patrón "Otro (especifique)" (global_validation_notes):
 * "Los valores de 'Otro (especifique)' deben acompañarse de un campo de
 * texto cuando dicha opción sea seleccionada." Siempre requerido cuando
 * la opción "Otro" fue seleccionada, y debe ir vacío en caso contrario.
 */
export function validateOtroEspecifique(
 ctx: z.RefinementCtx,
 otroValue: unknown,
 otroSeleccionado: boolean,
 path: (string | number)[],
 fieldLabel: string,
) {
 validateConditionalField(ctx, otroValue, otroSeleccionado, path, fieldLabel, {
 requiredWhenVisible: true,
 });
}

/**
 * cross_entity_validation_rules: "el egreso o conclusión no puede ocurrir
 * antes que el ingreso" (y variantes equivalentes: titulación/egreso,
 * obtención de grado/egreso, fin/inicio de posdoctorado).
 */
export function validateRangoAnios(
 ctx: z.RefinementCtx,
 inicio: number | null | undefined,
 fin: number | null | undefined,
 pathFin: (string | number)[],
 mensaje: string,
) {
 if (inicio != null && fin != null && fin < inicio) {
 addCustomIssue(ctx, pathFin, mensaje);
 }
}
