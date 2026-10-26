// Añadir estas exportaciones a: @/lib/db/schema/enums.ts

import { pgEnum } from "drizzle-orm/pg-core";

// Catálogo "valoraciones" del JSON (persist: false -> no es tabla, sí pgEnum
// reutilizable). Se usa en: correspondencia_plan_estudios, estrategias_didacticas,
// formas_evaluacion, bibliografia y calidad_programa.
export const valoracionEnum = pgEnum("valoracion", [
  "excelente",
  "buena",
  "regular",
  "mala",
  "pesima",
]);

// Catálogo propio (5 opciones) de la pregunta "satisfaccion_formacion"
export const satisfaccionFormacionEnum = pgEnum("satisfaccion_formacion", [
  "totalmente_satisfecho",
  "muy_satisfecho",
  "regularmente_satisfecho",
  "poco_satisfecho",
  "nada_satisfecho",
]);

// Catálogo propio (5 opciones) de la pregunta "cumplimiento_expectativas"
export const cumplimientoExpectativasEnum = pgEnum(
  "cumplimiento_expectativas",
  [
    "muy_de_acuerdo",
    "de_acuerdo",
    "ni_de_acuerdo_ni_en_desacuerdo",
    "en_desacuerdo",
    "muy_en_desacuerdo",
  ],
);
