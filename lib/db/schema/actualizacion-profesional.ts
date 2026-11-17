// @/lib/db/schema/afiliado-actualizacion-profesional.ts
// Sección 6 · ACTUALIZACIÓN PROFESIONAL — tabla 1:1 con `afiliados`.
// Imports relativos (no `@/`) para que drizzle-kit los resuelva sin configuración extra.
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import {
  DISPONIBILIDAD_ACTUALIZACION,
  DISPONIBILIDAD_EXCLUSIVA,
  MAX_ITEMS_REPETIBLE,
} from "@/lib/validation/actualizacion-profesional/actualizacion-constants";
// Solo tipos (se borran al compilar): el esquema Zod es la fuente de la forma del JSONB.
import type {
  ActividadActualizacion,
  ActualizacionProfesional,
  CargoEleccionPopular,
} from "@/lib/validation/actualizacion-profesional/actualizacion-profesional";
import { afiliados } from "./afiliados";

/* -------------------------------------------------------------------------- */
/* Enum · disponibilidad_actualizacion (checkbox → códigos estables)          */
/* -------------------------------------------------------------------------- */
// Si prefieres, muévelo a ./enums junto con membershipStatusEnum.
export const disponibilidadActualizacionEnum = pgEnum(
  "disponibilidad_actualizacion",
  DISPONIBILIDAD_ACTUALIZACION,
);

/* -------------------------------------------------------------------------- */
/* Helpers SQL para los CHECK                                                 */
/* -------------------------------------------------------------------------- */

/**
 * visible_when + repeatable_group (JSONB):
 * - flag = true  → arreglo JSONB con 1..MAX_ITEMS elementos
 * - flag = false → NULL
 */
const grupoRepetibleCoherente = (flag: AnyPgColumn, grupo: AnyPgColumn) => sql`(
  (${flag} AND ${grupo} IS NOT NULL AND jsonb_typeof(${grupo}) = 'array'
    AND jsonb_array_length(${grupo}) BETWEEN 1 AND ${sql.raw(String(MAX_ITEMS_REPETIBLE))})
  OR (NOT ${flag} AND ${grupo} IS NULL)
)`;

/** visible_when + campo simple: flag = true → NOT NULL; flag = false → NULL. */
const campoCondicionalCoherente = (
  flag: AnyPgColumn,
  campo: AnyPgColumn,
) => sql`(
  (${flag} AND ${campo} IS NOT NULL) OR (NOT ${flag} AND ${campo} IS NULL)
)`;

/* -------------------------------------------------------------------------- */
/* Tabla · afiliado_actualizacion_profesional                                 */
/* -------------------------------------------------------------------------- */

export const afiliadoActualizacionProfesional = pgTable(
  "afiliado_actualizacion_profesional",
  {
    // Relación 1:1 con afiliados (misma PK)
    userId: text("user_id")
      .primaryKey()
      .references(() => afiliados.userId, { onDelete: "cascade" }),

    // ha_tomado_actualizacion (radio, requerido)
    haTomadoActualizacion: boolean("ha_tomado_actualizacion").notNull(),

    // actividades_actualizacion (JSONB, condicional → nullable)
    actividadesActualizacion: jsonb("actividades_actualizacion").$type<
      ActividadActualizacion[]
    >(),

    // actualizacion_deseada (textarea, 5–1000)
    actualizacionDeseada: varchar("actualizacion_deseada", {
      length: 1000,
    }).notNull(),

    // disponibilidad_actualizacion (checkbox, 1–5 opciones)
    disponibilidadActualizacion: disponibilidadActualizacionEnum(
      "disponibilidad_actualizacion",
    )
      .array()
      .notNull(),

    // horario_actualizacion (text opcional, máx. 100)
    horarioActualizacion: varchar("horario_actualizacion", { length: 100 }),

    // creacion_empresa (boolean, requerido)
    creacionEmpresa: boolean("creacion_empresa").notNull(),

    // nombre_empresa (condicional → nullable, máx. 200)
    nombreEmpresa: varchar("nombre_empresa", { length: 200 }),

    // puesto_5_anios (textarea opcional, máx. 500)
    puesto5Anios: varchar("puesto_5_anios", { length: 500 }),

    // ha_ocupado_cargo_eleccion_popular (boolean, requerido)
    haOcupadoCargoEleccionPopular: boolean(
      "ha_ocupado_cargo_eleccion_popular",
    ).notNull(),

    // detalle_cargo_publico (JSONB, condicional → nullable)
    detalleCargoPublico: jsonb("detalle_cargo_publico").$type<
      CargoEleccionPopular[]
    >(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // visible_when / required_when_visible
    check(
      "ap_actividades_coherentes",
      grupoRepetibleCoherente(
        t.haTomadoActualizacion,
        t.actividadesActualizacion,
      ),
    ),
    check(
      "ap_empresa_coherente",
      campoCondicionalCoherente(t.creacionEmpresa, t.nombreEmpresa),
    ),
    check(
      "ap_cargos_coherentes",
      grupoRepetibleCoherente(
        t.haOcupadoCargoEleccionPopular,
        t.detalleCargoPublico,
      ),
    ),
    // min/max_selections + validation.exclusive_options
    check(
      "ap_disponibilidad_valida",
      sql`(
        cardinality(${t.disponibilidadActualizacion}) BETWEEN 1 AND ${sql.raw(String(DISPONIBILIDAD_ACTUALIZACION.length))}
        AND (
          NOT (${sql.raw(`'${DISPONIBILIDAD_EXCLUSIVA}'`)} = ANY(${t.disponibilidadActualizacion}))
          OR cardinality(${t.disponibilidadActualizacion}) = 1
        )
      )`,
    ),
  ],
);

export type AfiliadoActualizacionProfesional =
  typeof afiliadoActualizacionProfesional.$inferSelect;
export type NuevoAfiliadoActualizacionProfesional =
  typeof afiliadoActualizacionProfesional.$inferInsert;

/* -------------------------------------------------------------------------- */
/* Verificación en compilación: Zod ⇄ Drizzle                                 */
/* -------------------------------------------------------------------------- */
// Si el esquema Zod deja de ser insertable en la tabla, TypeScript marca error aquí.
type Assert<T extends true> = T;
type _ZodInsertableEnDrizzle = Assert<
  ActualizacionProfesional extends Omit<
    NuevoAfiliadoActualizacionProfesional,
    "userId" | "createdAt" | "updatedAt"
  >
    ? true
    : false
>;
