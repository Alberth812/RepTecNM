// @/lib/db/schema/informacion-laboral.ts
//
// Sección 3 (Información laboral) del perfil de afiliado.
// Si prefieres centralizar todos los enums en "./enums" junto a
// membershipStatusEnum, simplemente mueve el bloque de enums de abajo
// a ese archivo y ajusta este import.

import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { afiliados } from "./afiliados";

/* -------------------------------------------------------------------------- */
/* Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const tiempoPrimerEmpleoEnum = pgEnum("tiempo_primer_empleo", [
  "menos_seis_meses",
  "seis_meses_un_anio",
  "mas_de_un_anio",
  "sin_empleo",
]);

export const factorEmpleoEnum = pgEnum("factor_empleo", [
  "prestigio_institucion",
  "perfil_academico",
  "experiencia_laboral",
  "genero",
  "edad",
  "recomendaciones",
  "otro",
]);

export const causaDesempleoEnum = pgEnum("causa_desempleo", [
  "poca_experiencia",
  "falta_oportunidades",
  "sin_grado",
  "idioma",
  "personales",
  "otro",
]);

export const estrategiaConsecucionEmpleoEnum = pgEnum(
  "estrategia_consecucion_empleo",
  [
    "periodico",
    "redes_sociales",
    "internet",
    "convocatorias",
    "recomendacion_contacto",
    "autoempleo",
    "emigracion",
    "solicitudes",
    "otro",
  ],
);

export const tipoContratacionEnum = pgEnum("tipo_contratacion", [
  "base",
  "confianza",
  "eventual",
  "por_contrato",
  "otro",
]);

export const tipoInstitucionEnum = pgEnum("tipo_institucion", [
  "privada",
  "gobierno",
  "educacion",
  "investigacion",
  "social",
  "otro",
]);

export const sectorPrimarioEnum = pgEnum("sector_primario", [
  "agricultura",
  "ganaderia",
  "forestal",
  "pesca",
]);

export const sectorSecundarioEnum = pgEnum("sector_secundario", [
  "mineria",
  "energia",
  "agua_gas",
  "construccion",
  "manufactura",
]);

export const sectorTerciarioEnum = pgEnum("sector_terciario", [
  "comercio_mayor",
  "comercio_menor",
  "transporte",
  "medios",
  "financiero",
  "inmobiliario",
  "profesionales",
  "educativos",
  "salud",
  "cultura",
  "turismo",
  "otros_servicios",
]);

export const tipoActividadEnum = pgEnum("tipo_actividad_empleo", [
  "academica",
  "empresarial",
  "gubernamental",
  "independiente",
  "otro",
]);

export const valoracionNivelEnum = pgEnum("valoracion_nivel", [
  "muy_baja",
  "baja",
  "media",
  "alta",
  "muy_alta",
]);

export const valoracionImpactoEnum = pgEnum("valoracion_impacto", [
  "muy_bajo",
  "bajo",
  "medio",
  "alto",
  "muy_alto",
]);

/* -------------------------------------------------------------------------- */
/* Tabla 1:1 - afiliados_informacion_laboral                                 */
/* -------------------------------------------------------------------------- */

export const afiliadosInformacionLaboral = pgTable(
  "afiliados_informacion_laboral",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => afiliados.userId, { onDelete: "cascade" }),

    tiempoPrimerEmpleo: tiempoPrimerEmpleoEnum(
      "tiempo_primer_empleo",
    ).notNull(),

    factoresEmpleo: factorEmpleoEnum("factores_empleo").array(),
    factoresEmpleoOtro: text("factores_empleo_otro"),

    laboraActualmente: boolean("labora_actualmente").notNull().default(false),

    causasDesempleo: causaDesempleoEnum("causas_desempleo").array(),
    causasDesempleoOtro: text("causas_desempleo_otro"),

    estrategiaPostgrado: estrategiaConsecucionEmpleoEnum(
      "estrategia_postgrado_para_conseguir_empleo",
    ).array(),
    estrategiaPostgradoOtro: text("estrategia_postgrado_otro"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
);

/* -------------------------------------------------------------------------- */
/* Tabla 1:N - afiliados_empleos (historial_empleos)                         */
/* -------------------------------------------------------------------------- */

export const afiliadosEmpleos = pgTable("afiliados_empleos", {
  id: uuid("id").primaryKey().defaultRandom(),

  afiliadoUserId: text("afiliado_user_id")
    .notNull()
    .references(() => afiliados.userId, { onDelete: "cascade" }),

  puesto: varchar("puesto", { length: 200 }).notNull(),
  institucion: varchar("institucion", { length: 250 }).notNull(),

  fechaInicioAnio: integer("fecha_inicio_anio").notNull(),
  fechaInicioMes: integer("fecha_inicio_mes").notNull(),

  esActual: boolean("es_actual").notNull().default(false),

  fechaFinAnio: integer("fecha_fin_anio"),
  fechaFinMes: integer("fecha_fin_mes"),

  tipoContratacion: tipoContratacionEnum("tipo_contratacion"),
  tipoContratacionOtro: text("tipo_contratacion_otro"),

  salarioMensualBruto: numeric("salario_mensual_bruto", {
    precision: 12,
    scale: 2,
  }),
  horasSemanales: integer("horas_semanales"),

  tipoInstitucion: tipoInstitucionEnum("tipo_institucion").array(),
  tipoInstitucionOtro: text("tipo_institucion_otro"),

  telefonoOrganismo: varchar("telefono_organismo", { length: 20 }),

  sectorPrimario: sectorPrimarioEnum("sector_primario").array(),
  sectorSecundario: sectorSecundarioEnum("sector_secundario").array(),
  sectorTerciario: sectorTerciarioEnum("sector_terciario").array(),

  tipoActividad: tipoActividadEnum("tipo_actividad_empleo_actual").array(),
  tipoActividadOtro: text("tipo_actividad_otro"),

  actividadesPrincipales: text("actividades_principales"),

  estrategiaEmpleoActual: estrategiaConsecucionEmpleoEnum(
    "estrategia_empleo_actual",
  ).array(),
  estrategiaEmpleoActualOtro: text("estrategia_empleo_actual_otro"),

  valoracionCoincidenciaConocimientos: valoracionNivelEnum(
    "valoracion_coincidencia_conocimientos_con_campo_laboral",
  ),
  valoracionCapacidadResolverProblemas: valoracionNivelEnum(
    "valoracion_capacidad_resolver_problemas_laborales",
  ),
  valoracionImpactoSocial: valoracionImpactoEnum(
    "valoracion_impacto_social_actividad_profesional",
  ),
  valoracionPertinenciaPrograma: valoracionNivelEnum(
    "valoracion_pertinencia_programa_campo_laboral",
  ),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/* -------------------------------------------------------------------------- */
/* Relations                                                                  */
/* -------------------------------------------------------------------------- */

/*export const afiliadosInformacionLaboralRelations = relations(
  afiliadosInformacionLaboral,
  ({ one }) => ({
    afiliado: one(afiliados, {
      fields: [afiliadosInformacionLaboral.userId],
      references: [afiliados.userId],
    }),
  }),
);

export const afiliadosEmpleosRelations = relations(
  afiliadosEmpleos,
  ({ one }) => ({
    afiliado: one(afiliados, {
      fields: [afiliadosEmpleos.afiliadoUserId],
      references: [afiliados.userId],
    }),
  }),
);
*/
