/**
 * Fuente única de verdad para los catálogos de la Sección 4 (Investigación)
 * del perfil de afiliado.
 *
 * Se reutiliza en tres lugares para no duplicar los códigos:
 *  - lib/db/schema/afiliados-investigacion.ts  -> valores del pgEnum
 *  - lib/validations/afiliados-investigacion.ts -> valores del z.enum
 *  - el futuro formulario frontend             -> labels para los checkboxes/radios
 *
 * Los "value" corresponden exactamente a los "value" del JSON de especificación
 * (códigos estables), nunca a los "label" (texto visible al usuario).
 */

// ---------------------------------------------------------------------------
// produccion_academica (checkbox)
// ---------------------------------------------------------------------------

export const PRODUCCION_ACADEMICA_VALUES = [
  "articulos_revistas",
  "articulos_divulgacion",
  "articulos_periodicos",
  "libros",
  "capitulos_libro",
  "ponencias",
  "conferencias",
  "direccion_tesis",
  "informes_tecnicos",
  "prototipos_productos",
  "propiedad_intelectual",
  "proyectos_investigacion",
  "grupos_investigacion",
  "divulgacion_cientifica",
  "otra",
] as const;

export type ProduccionAcademicaValue =
  (typeof PRODUCCION_ACADEMICA_VALUES)[number];

export const PRODUCCION_ACADEMICA_LABELS: Record<
  ProduccionAcademicaValue,
  string
> = {
  articulos_revistas:
    "Publicación de artículos en revistas científicas o académicas",
  articulos_divulgacion: "Publicación de artículos en revistas de divulgación",
  articulos_periodicos:
    "Publicación de artículos o colaboraciones en periódicos",
  libros: "Publicación de libros",
  capitulos_libro: "Publicación de capítulos de libro",
  ponencias: "Presentación de ponencias en congresos, coloquios o seminarios",
  conferencias: "Participación como conferencista o expositor",
  direccion_tesis: "Dirección o codirección de tesis",
  informes_tecnicos:
    "Elaboración de informes técnicos o reportes de investigación",
  prototipos_productos:
    "Desarrollo de prototipos o productos derivados de investigación",
  propiedad_intelectual:
    "Registro de patentes, modelos de utilidad u otras formas de propiedad intelectual",
  proyectos_investigacion: "Participación en proyectos de investigación",
  grupos_investigacion:
    "Participación en cuerpos académicos o grupos de investigación",
  divulgacion_cientifica: "Actividades de divulgación científica o tecnológica",
  otra: "Otra actividad de producción académica",
};

/** Útil para renderizar checkboxes en el frontend, preservando el orden del catálogo. */
export const PRODUCCION_ACADEMICA_OPTIONS = PRODUCCION_ACADEMICA_VALUES.map(
  (value) => ({
    value,
    label: PRODUCCION_ACADEMICA_LABELS[value],
  }),
);

// ---------------------------------------------------------------------------
// situacion_sni (radio)
// ---------------------------------------------------------------------------

export const SITUACION_SNI_VALUES = [
  "nunca",
  "anterior",
  "actual",
  "anterior_y_actual",
] as const;

export type SituacionSniValue = (typeof SITUACION_SNI_VALUES)[number];

export const SITUACION_SNI_LABELS: Record<SituacionSniValue, string> = {
  nunca: "Nunca he sido miembro",
  anterior: "Fui miembro anteriormente",
  actual: "Actualmente soy miembro",
  anterior_y_actual: "Fui miembro anteriormente y actualmente también lo soy",
};

export const SITUACION_SNI_OPTIONS = SITUACION_SNI_VALUES.map((value) => ({
  value,
  label: SITUACION_SNI_LABELS[value],
}));
