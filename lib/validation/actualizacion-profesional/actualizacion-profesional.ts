// @/lib/validations/actualizacion-profesional.ts
// Sección 6 · ACTUALIZACIÓN PROFESIONAL — esquemas Zod (v4)
// Las llaves están en camelCase para coincidir con las propiedades de Drizzle.
import { z } from "zod";
import {
 ANIO_MINIMO_CARGO,
 DISPONIBILIDAD_ACTUALIZACION,
 DISPONIBILIDAD_EXCLUSIVA,
 MAX_ITEMS_REPETIBLE,
} from "./actualizacion-constants";

/* -------------------------------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------------------------------- */

/** type: text / textarea con min_length y max_length. */
const texto = (min: number, max: number) => {
 let esquema = z.string({ error: "Este campo es obligatorio" }).trim();
 // Vacío → "obligatorio" (más claro que "Mínimo 2 caracteres").
 if (min > 1) esquema = esquema.min(1, "Este campo es obligatorio");
 return esquema
 .min(min, `Mínimo ${min} ${min === 1 ? "carácter" : "caracteres"}`)
 .max(max, `Máximo ${max} caracteres`);
};

const fechaActual = () => {
 const hoy = new Date();
 return { anio: hoy.getFullYear(), mes: hoy.getMonth() + 1 };
};

/** Convierte (año, mes) en un índice comparable cronológicamente. */
const indiceMes = (anio: number, mes: number) => anio * 12 + mes;

/** type: boolean / radio Sí-No: sin responder → mensaje claro. */
const siNo = () => z.boolean({ error: "Selecciona una opción" });

/** Entero con mensajes en español (vacío → obligatorio, otro tipo → número). */
const numeroEntero = () =>
 z
 .number({
 error: (iss) =>
 iss.input === undefined || iss.input === null
 ? "Este campo es obligatorio"
 : "Debe ser un número",
 })
 .int("Debe ser un número entero");

/** max_value: { expression: "current_year - 1" } (se evalúa al validar). */
const anioMaximoCargo = () => fechaActual().anio - 1;

/**
 * required_when_visible / visible_when:
 * - visible → el valor es obligatorio
 * - oculto → el valor debe quedar vacío (null/undefined), igual que en BD
 */
function exigirSegunVisibilidad(
 ctx: z.RefinementCtx,
 visible: boolean,
 valor: unknown,
 campo: string,
 condicion: string,
) {
 const vacio = valor == null;
 if (visible && vacio) {
 ctx.addIssue({
 code: "custom",
 path: [campo],
 message: "Este campo es obligatorio",
 });
 }
 if (!visible && !vacio) {
 ctx.addIssue({
 code: "custom",
 path: [campo],
 message: `Debe quedar vacío cuando ${condicion} es "No"`,
 });
 }
}

/* -------------------------------------------------------------------------- */
/* JSONB · actividades_actualizacion (repeatable_group) */
/* -------------------------------------------------------------------------- */

export const actividadActualizacionSchema = z.object({
 tematica: texto(2, 200), // "Temática"
 institucion: texto(2, 200), // "Institución"
});

export type ActividadActualizacion = z.infer<
 typeof actividadActualizacionSchema
>;

/* -------------------------------------------------------------------------- */
/* JSONB · detalle_cargo_publico (repeatable_group) */
/* -------------------------------------------------------------------------- */

// anio_inicio / anio_termino: entero entre 1971 y (año actual - 1)
const anioCargo = numeroEntero()
 .min(ANIO_MINIMO_CARGO, `Debe ser mayor que ${ANIO_MINIMO_CARGO - 1}`)
 .refine((anio) => anio <= anioMaximoCargo(), "Debe ser menor al año actual");

// mes_inicio / mes_termino: entero entre 1 y 12
const mesCargo = numeroEntero().min(1, "Mes inválido").max(12, "Mes inválido");

export const cargoEleccionPopularBaseSchema = z.object({
 puesto: texto(2, 200),
 lugar: texto(2, 200),
 esCargoActual: siNo(),
 anioInicio: anioCargo,
 mesInicio: mesCargo,
 // nullable_when es_cargo_actual = true / required_when es_cargo_actual = false
 anioTermino: anioCargo.nullish(),
 mesTermino: mesCargo.nullish(),
});

export const cargoEleccionPopularSchema =
 cargoEleccionPopularBaseSchema.superRefine((cargo, ctx) => {
 const { esCargoActual, anioInicio, mesInicio, anioTermino, mesTermino } =
 cargo;
 const hoy = fechaActual();
 const indiceHoy = indiceMes(hoy.anio, hoy.mes);
 const indiceInicio = indiceMes(anioInicio, mesInicio);

 if (esCargoActual) {
 // current_role_requires_empty_end_date
 for (const [campo, valor] of [
 ["anioTermino", anioTermino],
 ["mesTermino", mesTermino],
 ] as const) {
 if (valor != null) {
 ctx.addIssue({
 code: "custom",
 path: [campo],
 message: "Debe quedar vacío cuando el cargo es actual",
 });
 }
 }
 } else {
 // non_current_role_requires_end_date
 for (const [campo, valor] of [
 ["anioTermino", anioTermino],
 ["mesTermino", mesTermino],
 ] as const) {
 if (valor == null) {
 ctx.addIssue({
 code: "custom",
 path: [campo],
 message: "Obligatorio cuando el cargo ya no es vigente",
 });
 }
 }
 }

 // start_date_not_after_current_date
 if (indiceInicio > indiceHoy) {
 ctx.addIssue({
 code: "custom",
 path: ["anioInicio"],
 message: "La fecha de inicio no puede ser posterior a la fecha actual",
 });
 }

 if (!esCargoActual && anioTermino != null && mesTermino != null) {
 const indiceTermino = indiceMes(anioTermino, mesTermino);

 // end_date_not_after_current_date
 if (indiceTermino > indiceHoy) {
 ctx.addIssue({
 code: "custom",
 path: ["anioTermino"],
 message:
 "La fecha de término no puede ser posterior a la fecha actual",
 });
 }

 // start_date_before_end_date (primero año, luego mes)
 if (indiceInicio >= indiceTermino) {
 ctx.addIssue({
 code: "custom",
 path: ["anioTermino"],
 message: "La fecha de inicio debe ser anterior a la fecha de término",
 });
 }
 }
 });

export type CargoEleccionPopular = z.infer<typeof cargoEleccionPopularSchema>;

/* -------------------------------------------------------------------------- */
/* Entidad principal · afiliado_actualizacion_profesional */
/* -------------------------------------------------------------------------- */

export const actualizacionProfesionalBaseSchema = z.object({
 // ha_tomado_actualizacion (radio)
 haTomadoActualizacion: siNo(),

 // actividades_actualizacion (JSONB, visible si haTomadoActualizacion = true)
 actividadesActualizacion: z
 .array(actividadActualizacionSchema)
 .min(1, "Agrega al menos una actividad")
 .max(MAX_ITEMS_REPETIBLE, `Máximo ${MAX_ITEMS_REPETIBLE} actividades`)
 .nullish(),

 // actualizacion_deseada (textarea)
 actualizacionDeseada: texto(5, 1000),

 // disponibilidad_actualizacion (checkbox, 1–5 opciones)
 disponibilidadActualizacion: z
 .array(z.enum(DISPONIBILIDAD_ACTUALIZACION), {
 error: "Selecciona al menos una opción",
 })
 .min(1, "Selecciona al menos una opción")
 .max(DISPONIBILIDAD_ACTUALIZACION.length),

 // horario_actualizacion (text, opcional)
 horarioActualizacion: texto(1, 100).nullish(),

 // creacion_empresa (boolean) + nombre_empresa (visible si creacionEmpresa = true)
 creacionEmpresa: siNo(),
 nombreEmpresa: texto(2, 200).nullish(),

 // puesto_5_anios (textarea, opcional)
 puesto5Anios: texto(2, 500).nullish(),

 // ha_ocupado_cargo_eleccion_popular (boolean) + detalle_cargo_publico (JSONB)
 haOcupadoCargoEleccionPopular: siNo(),
 detalleCargoPublico: z
 .array(cargoEleccionPopularSchema)
 .min(1, "Agrega al menos un cargo")
 .max(MAX_ITEMS_REPETIBLE, `Máximo ${MAX_ITEMS_REPETIBLE} cargos`)
 .nullish(),
});

export const actualizacionProfesionalSchema =
 actualizacionProfesionalBaseSchema.superRefine((data, ctx) => {
 // required_when_visible + visible_when de los campos condicionales
 exigirSegunVisibilidad(
 ctx,
 data.haTomadoActualizacion,
 data.actividadesActualizacion,
 "actividadesActualizacion",
 "haber tomado cursos de actualización",
 );
 exigirSegunVisibilidad(
 ctx,
 data.creacionEmpresa,
 data.nombreEmpresa,
 "nombreEmpresa",
 "la creación de empresa",
 );
 exigirSegunVisibilidad(
 ctx,
 data.haOcupadoCargoEleccionPopular,
 data.detalleCargoPublico,
 "detalleCargoPublico",
 "haber ocupado un cargo de elección popular",
 );

 // validation.exclusive_options: "sin_disponibilidad" excluye a las demás
 const disponibilidad = data.disponibilidadActualizacion;
 if (
 disponibilidad.includes(DISPONIBILIDAD_EXCLUSIVA) &&
 disponibilidad.length > 1
 ) {
 ctx.addIssue({
 code: "custom",
 path: ["disponibilidadActualizacion"],
 message:
 '"No dispongo de tiempo" no puede combinarse con otras opciones',
 });
 }

 // Sin opciones repetidas
 if (new Set(disponibilidad).size !== disponibilidad.length) {
 ctx.addIssue({
 code: "custom",
 path: ["disponibilidadActualizacion"],
 message: "No se permiten opciones repetidas",
 });
 }
 });

/** Lo que recibe el formulario / lo que sale validado. */
export type ActualizacionProfesionalInput = z.input<
 typeof actualizacionProfesionalSchema
>;
export type ActualizacionProfesional = z.infer<
 typeof actualizacionProfesionalSchema
>;
