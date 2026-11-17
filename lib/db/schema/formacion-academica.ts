// @/lib/db/schema/formacion-academica.ts
//
// Esquema Drizzle correspondiente a la especificación semántica "Formación Académica" (v2.0).
// Separa la trayectoria académica del afiliado en entidades relacionadas (recommended_persistence_strategy):
//   afiliados -> licenciaturas (1:N)
//   afiliados -> posgrados (1:N)
//   afiliados -> estancias_posdoctorales (1:N)
//
// NOTA: ajusta la ruta de importación de `instituciones` si tu catálogo vive en otro archivo.
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { afiliados } from "./afiliados";
import { instituciones } from "./instituciones";

// ---------------------------------------------------------------------------
// Enums
// Los campos de tipo opción se persisten con valores estables (códigos), no
// con las etiquetas mostradas al usuario (recommended_persistence_strategy).
// ---------------------------------------------------------------------------

// Sección "Posgrados" -> campo tipo_posgrado
export const tipoPosgradoEnum = pgEnum("tipo_posgrado", [
  "MAESTRIA",
  "DOCTORADO",
]);

// Sección "Posgrados" -> campo trayectoria_posgrado (solo aplica cuando tipo_posgrado = DOCTORADO)
export const trayectoriaPosgradoEnum = pgEnum("trayectoria_posgrado", [
  "INDEPENDIENTE",
  "INTEGRADA_MAESTRIA_DOCTORADO",
]);

// Sección "Posgrados" -> campo modalidad
export const modalidadPosgradoEnum = pgEnum("modalidad_posgrado", [
  "PRESENCIAL",
  "EN_LINEA",
  "HIBRIDA",
  "OTRA",
]);

// Sección "Posgrados" -> campo dedicacion
export const dedicacionPosgradoEnum = pgEnum("dedicacion_posgrado", [
  "TIEMPO_COMPLETO",
  "MEDIO_TIEMPO",
  "TIEMPO_PARCIAL",
]);

// Sección "Posgrados" -> campo fuentes_financiamiento (beca de posgrado)
export const fuenteFinanciamientoPosgradoEnum = pgEnum(
  "fuente_financiamiento_posgrado",
  ["CONAHCYT", "INSTITUCION_LABORA", "PRODEP", "INSTITUCION_POSGRADO", "OTRO"],
);

// Sección "Posgrados" -> campo motivo_no_obtencion_grado
export const motivoNoObtencionGradoEnum = pgEnum("motivo_no_obtencion_grado", [
  "EN_PROCESO",
  "TESIS_PENDIENTE",
  "EXAMEN_PENDIENTE",
  "TRAMITE_NO_REALIZADO",
  "OTRO",
]);

// Sección "Posgrados" -> estado_civil_inicio / estado_civil_conclusion
// (el JSON no define códigos explícitos para estas opciones; se controlan aquí)
export const estadoCivilEnum = pgEnum("estado_civil", [
  "SOLTERO",
  "CASADO",
  "UNION_LIBRE",
  "OTRO",
]);

// Sección "Posdoctorado" -> campo situacion (el formulario original usaba 0,1,2,3; aquí valores nominales)
export const situacionPosdoctoradoEnum = pgEnum("situacion_posdoctorado", [
  "CONCLUIDA",
  "ACTUAL",
  "INTERES_FUTURO",
  "SIN_INTERES",
]);

// Sección "Posdoctorado" -> campo campo_investigacion
export const campoInvestigacionPosdoctoradoEnum = pgEnum(
  "campo_investigacion_posdoctorado",
  [
    "CIENCIAS_SOCIALES_HUMANIDADES",
    "CIENCIAS_NATURALES_EXACTAS",
    "INGENIERIA_TECNOLOGIA",
    "CIENCIAS_AGROPECUARIAS",
    "EDUCACION",
    "OTRO",
  ],
);

// Sección "Posdoctorado" -> campo fuentes_financiamiento (apoyo económico posdoctoral)
export const fuenteFinanciamientoPosdoctoradoEnum = pgEnum(
  "fuente_financiamiento_posdoctorado",
  [
    "BECA_NACIONAL",
    "BECA_INTERNACIONAL",
    "APOYO_INSTITUCIONAL",
    "PROYECTO_INVESTIGACION",
    "OTRO",
  ],
);

// ---------------------------------------------------------------------------
// Tipo para el campo "motivos_eleccion_institucion" (scale_matrix_with_custom_rows)
// Se modela como JSONB: filas fijas como propiedades estructuradas + arreglo de
// motivos personalizados con su propia calificación (data_model_notes).
// ---------------------------------------------------------------------------
export type MotivoEleccionInstitucionPosgrado = {
  filas: {
    prestigio_academico: number; // 1-5
    proximidad_domicilio: number; // 1-5
    posgrado_interes: number; // 1-5
    beca_academica: number; // 1-5
  };
  otros?: { motivo: string; calificacion: number }[];
};

// ---------------------------------------------------------------------------
// Sección "Licenciatura" (entity: licenciatura, one_to_many, repeatable)
// ---------------------------------------------------------------------------
export const licenciaturas = pgTable("licenciaturas", {
  id: uuid("id").primaryKey().defaultRandom(),
  afiliadoId: text("afiliado_id")
    .notNull()
    .references(() => afiliados.userId, { onDelete: "cascade" }),

  institucionId: uuid("institucion_id")
    .notNull()
    .references(() => instituciones.id),

  programa: text("programa").notNull(),
  disciplina: text("disciplina").notNull(),

  anioIngreso: integer("anio_ingreso"), // required: false
  anioEgreso: integer("anio_egreso").notNull(), // required: true

  // tiene_titulo separa egreso de titulación
  anioTitulacion: integer("anio_titulacion").notNull(), // required: false

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ---------------------------------------------------------------------------
// Sección "Posgrados" (entity: posgrado, one_to_many, repeatable)
// Cubre tanto maestría como doctorado, distinguidos por tipo_posgrado.
// ---------------------------------------------------------------------------
export const posgrados = pgTable("posgrados", {
  id: uuid("id").primaryKey().defaultRandom(),
  afiliadoId: text("afiliado_id")
    .notNull()
    .references(() => afiliados.userId, { onDelete: "cascade" }),

  tipoPosgrado: tipoPosgradoEnum("tipo_posgrado").notNull(),
  // Solo tiene sentido cuando tipoPosgrado = DOCTORADO; conserva la semántica
  // de la opción original "Maestría y Doctorado" sin forzar una entidad única.
  trayectoriaPosgrado: trayectoriaPosgradoEnum("trayectoria_posgrado"),

  institucionId: uuid("institucion_id")
    .notNull()
    .references(() => instituciones.id),

  programa: text("programa").notNull(),
  disciplina: text("disciplina").notNull(),
  lineaInvestigacion: text("linea_investigacion"),

  // scale_matrix_with_custom_rows -> JSONB (ver MotivoEleccionInstitucionPosgrado)
  motivosEleccionInstitucion: jsonb("motivos_eleccion_institucion")
    .$type<MotivoEleccionInstitucionPosgrado>()
    .notNull(),

  anioIngreso: integer("anio_ingreso").notNull(), // required: true
  anioEgreso: integer("anio_egreso"), // required: false, puede quedar vacío si actualmente_cursa = true
  actualmenteCursa: boolean("actualmente_cursa").notNull(),

  modalidad: modalidadPosgradoEnum("modalidad").notNull(),
  modalidadOtra: text("modalidad_otra"), // visible_when modalidad = OTRA

  dedicacion: dedicacionPosgradoEnum("dedicacion").notNull(),

  becado: boolean("becado").notNull(),
  // checkbox -> array de valores controlados (recommended_persistence_strategy)
  fuentesFinanciamiento: fuenteFinanciamientoPosgradoEnum(
    "fuentes_financiamiento",
  ).array(),
  fuentesFinanciamientoOtro: text("fuentes_financiamiento_otro"), // visible_when fuentes_financiamiento contiene OTRO

  tieneGrado: boolean("tiene_grado").notNull(),
  anioObtencionGrado: integer("anio_obtencion_grado"), // visible_when tiene_grado = true
  mesesObtencionGrado: integer("meses_obtencion_grado"), // visible_when tiene_grado = true

  motivoNoObtencionGrado: motivoNoObtencionGradoEnum(
    "motivo_no_obtencion_grado",
  ), // visible_when tiene_grado = false
  motivoNoObtencionGradoOtro: text("motivo_no_obtencion_grado_otro"), // visible_when motivo... = OTRO

  // Datos históricos conservados por compatibilidad con el formulario original
  // (data_model_notes: son contextuales, no propiedades académicas intrínsecas).
  estadoCivilInicio: estadoCivilEnum("estado_civil_inicio"),
  estadoCivilInicioOtro: text("estado_civil_inicio_otro"), // visible_when estado_civil_inicio = OTRO
  estadoCivilConclusion: estadoCivilEnum("estado_civil_conclusion"),
  estadoCivilConclusionOtro: text("estado_civil_conclusion_otro"), // visible_when estado_civil_conclusion = OTRO

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ---------------------------------------------------------------------------
// Sección "Posdoctorado / Estancias posdoctorales" (entity: estancia_posdoctoral, one_to_many)
// ---------------------------------------------------------------------------
export const estanciasPosdoctorales = pgTable("estancias_posdoctorales", {
  id: uuid("id").primaryKey().defaultRandom(),
  afiliadoId: text("afiliado_id")
    .notNull()
    .references(() => afiliados.userId, { onDelete: "cascade" }),

  situacion: situacionPosdoctoradoEnum("situacion").notNull(),

  // Los siguientes campos solo aplican cuando situacion in (CONCLUIDA, ACTUAL)
  institucionId: uuid("institucion_id").references(() => instituciones.id),
  programa: text("programa"),
  campoInvestigacion: campoInvestigacionPosdoctoradoEnum("campo_investigacion"),
  campoInvestigacionOtro: text("campo_investigacion_otro"), // visible_when campo_investigacion = OTRO
  lineaInvestigacion: text("linea_investigacion"),
  anioInicio: integer("anio_inicio"),
  anioFin: integer("anio_fin"), // visible_when situacion = CONCLUIDA

  recibioApoyoEconomico: boolean("recibio_apoyo_economico"),
  fuentesFinanciamiento: fuenteFinanciamientoPosdoctoradoEnum(
    "fuentes_financiamiento",
  ).array(),
  fuentesFinanciamientoOtro: text("fuentes_financiamiento_otro"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ---------------------------------------------------------------------------
// Relaciones (drizzle-orm relations API) para habilitar `db.query.afiliados.findMany({ with: {...} })`
// DEBEN CAMBIARSE A LA V2 DE RELATIONS
// ---------------------------------------------------------------------------
/* 
export const afiliadoFormacionAcademicaRelations = relations(
  afiliados,
  ({ many, one }) => ({
    licenciaturas: many(licenciaturas),
    posgrados: many(posgrados),
    estanciasPosdoctorales: many(estanciasPosdoctorales),
  }),
);

export const licenciaturasRelations = relations(licenciaturas, ({ one }) => ({
  afiliado: one(afiliados, {
    fields: [licenciaturas.afiliadoId],
    references: [afiliados.userId],
  }),
  institucion: one(instituciones, {
    fields: [licenciaturas.institucionId],
    references: [instituciones.id],
  }),
}));

export const posgradosRelations = relations(posgrados, ({ one }) => ({
  afiliado: one(afiliados, {
    fields: [posgrados.afiliadoId],
    references: [afiliados.userId],
  }),
  institucion: one(instituciones, {
    fields: [posgrados.institucionId],
    references: [instituciones.id],
  }),
}));

export const estanciasPosdoctoralesRelations = relations(
  estanciasPosdoctorales,
  ({ one }) => ({
    afiliado: one(afiliados, {
      fields: [estanciasPosdoctorales.afiliadoId],
      references: [afiliados.userId],
    }),
    institucion: one(instituciones, {
      fields: [estanciasPosdoctorales.institucionId],
      references: [instituciones.id],
    }),
  }),
);
*/
