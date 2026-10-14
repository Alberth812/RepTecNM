// @/lib/constants/actualizacion-profesional.ts
// Sección 6 · ACTUALIZACIÓN PROFESIONAL
// Fuente única de valores estables, compartida por Drizzle (BD) y Zod (validación).

/** disponibilidad_actualizacion (checkbox): se guardan códigos, no etiquetas. */
export const DISPONIBILIDAD_ACTUALIZACION = [
 "mananas",
 "tardes",
 "fines_de_semana",
 "unicamente_sabados",
 "sin_disponibilidad",
] as const;

export type DisponibilidadActualizacion =
 (typeof DISPONIBILIDAD_ACTUALIZACION)[number];

/** Etiquetas visibles (solo para la UI). */
export const DISPONIBILIDAD_ACTUALIZACION_LABELS: Record<
 DisponibilidadActualizacion,
 string
> = {
 mananas: "Mañanas",
 tardes: "Tardes",
 fines_de_semana: "Fines de semana",
 unicamente_sabados: "Únicamente sábados",
 sin_disponibilidad: "No dispongo de tiempo",
};

/** validation.exclusive_options: incompatible con cualquier otra opción. */
export const DISPONIBILIDAD_EXCLUSIVA =
 "sin_disponibilidad" satisfies DisponibilidadActualizacion;

/** max_items de actividades_actualizacion y detalle_cargo_publico. */
export const MAX_ITEMS_REPETIBLE = 15;

/** min_value de anio_inicio / anio_termino (debe ser > 1970). */
export const ANIO_MINIMO_CARGO = 1971;
