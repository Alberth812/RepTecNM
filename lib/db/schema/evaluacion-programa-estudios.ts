// @/lib/db/schema/evaluacion-programa-estudios.ts
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { afiliados } from "./afiliados";
import {
  cumplimientoExpectativasEnum,
  satisfaccionFormacionEnum,
  valoracionEnum,
} from "./evaluacion-programa-enums";

// Las claves deben coincidir EXACTAMENTE con los `value` del catálogo `rows`
// de "evaluacion_infraestructura" en la especificación del formulario.
export type EvaluacionInfraestructura = {
  equipo_computo_conectividad: number;
  programas_informaticos: number;
  bases_datos: number;
  acervo_bibliografico: number;
  area_estudios: number;
  laboratorios: number;
  equipamiento_insumos_laboratorios: number;
  apoyo_gestion_administrativa: number;
  actividades_extracurriculares: number;
};

export const evaluacionProgramaEstudios = pgTable(
  "evaluacion_programa_estudios",
  {
    // Relación 1:1 con afiliados (mismo patrón que afiliados -> users)
    userId: text("user_id")
      .primaryKey()
      .references(() => afiliados.userId, { onDelete: "cascade" }),

    // Texto libre opcional -> nullable
    nombreTesis: text("nombre_tesis"),

    // Preguntas que usan el catálogo "valoraciones"
    correspondenciaPlanEstudios: valoracionEnum(
      "correspondencia_plan_estudios",
    ).notNull(),
    estrategiasDidacticas: valoracionEnum("estrategias_didacticas").notNull(),
    formasEvaluacion: valoracionEnum("formas_evaluacion").notNull(),
    bibliografia: valoracionEnum("bibliografia").notNull(),

    // Escala 1-10
    asesoriaTesis: integer("asesoria_tesis").notNull(),

    // Catálogo propio (5 opciones)
    satisfaccionFormacion: satisfaccionFormacionEnum(
      "satisfaccion_formacion",
    ).notNull(),

    // Matriz de 9 aspectos -> un único JSONB, no columnas ni tabla aparte
    evaluacionInfraestructura: jsonb("evaluacion_infraestructura")
      .$type<EvaluacionInfraestructura>()
      .notNull(),

    // Booleano real, nunca string
    tieneOtroAspectoInfraestructura: boolean(
      "tiene_otro_aspecto_infraestructura",
    ).notNull(),

    // Campos condicionales -> nullable en BD (visible/obligatorios solo si
    // tieneOtroAspectoInfraestructura = true; validado también en Zod)
    otroAspectoInfraestructura: text("otro_aspecto_infraestructura"),
    calificacionOtroAspectoInfraestructura: integer(
      "calificacion_otro_aspecto_infraestructura",
    ),

    cumplimientoExpectativas: cumplimientoExpectativasEnum(
      "cumplimiento_expectativas",
    ).notNull(),
    calidadPrograma: valoracionEnum("calidad_programa").notNull(),

    areasMejora: text("areas_mejora").notNull(),
    mejorasPlanEstudios: text("mejoras_plan_estudios"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // Defensa adicional a nivel de BD (además de Zod) para las reglas cruzadas
    // descritas en la especificación. Opcional pero recomendable: protege la
    // integridad de los datos aunque se inserte por fuera de la app/Zod.
    asesoriaTesisRange: check(
      "asesoria_tesis_range",
      sql`${table.asesoriaTesis} BETWEEN 1 AND 10`,
    ),
    calificacionOtroAspectoRange: check(
      "calificacion_otro_aspecto_infraestructura_range",
      sql`${table.calificacionOtroAspectoInfraestructura} IS NULL
          OR ${table.calificacionOtroAspectoInfraestructura} BETWEEN 1 AND 10`,
    ),
    otroAspectoInfraestructuraCoherence: check(
      "otro_aspecto_infraestructura_coherence",
      sql`(
            ${table.tieneOtroAspectoInfraestructura} = false
            AND ${table.otroAspectoInfraestructura} IS NULL
            AND ${table.calificacionOtroAspectoInfraestructura} IS NULL
          ) OR (
            ${table.tieneOtroAspectoInfraestructura} = true
            AND ${table.otroAspectoInfraestructura} IS NOT NULL
            AND ${table.calificacionOtroAspectoInfraestructura} IS NOT NULL
          )`,
    ),
  }),
);

/*export const evaluacionProgramaEstudiosRelations = relations(
  evaluacionProgramaEstudios,
  ({ one }) => ({
    afiliado: one(afiliados, {
      fields: [evaluacionProgramaEstudios.userId],
      references: [afiliados.userId],
    }),
  }),
);*/

// Tipo de la fila tal como la devuelve Drizzle (para pasarla del Server
// Component al formulario cliente sin duplicar la forma a mano).
/*export type EvaluacionProgramaEstudiosRow =
  typeof evaluacionProgramaEstudios.$inferSelect;

// Opcional: si quieres navegar afiliado -> evaluación, añade en afiliados.ts
// (o en un archivo de relations centralizado):
//
// export const afiliadosRelations = relations(afiliados, ({ one }) => ({
//   evaluacionProgramaEstudios: one(evaluacionProgramaEstudios, {
//     fields: [afiliados.userId],
//     references: [evaluacionProgramaEstudios.userId],
//   }),
// }));
*/
