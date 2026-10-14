// @/lib/db/schema/afiliados-investigacion.ts
import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { afiliados } from "./afiliados";
import {
 PRODUCCION_ACADEMICA_VALUES,
 SITUACION_SNI_VALUES,
} from "@/lib/validation/afiliados-investigacion/investigacion-options";

/**
 * Los valores de estos enums vienen del mismo catálogo que usa Zod
 * (lib/constants/afiliados-investigacion-options.ts), así el código de cada
 * opción ("articulos_revistas", "anterior_y_actual", etc.) vive en un solo
 * lugar y Postgres además rechaza a nivel de columna cualquier código no
 * contemplado en la especificación (defensa adicional a la de Zod).
 */
export const produccionAcademicaEnum = pgEnum("produccion_academica_opcion", [
 ...PRODUCCION_ACADEMICA_VALUES,
]);

export const situacionSniEnum = pgEnum("situacion_sni", [
 ...SITUACION_SNI_VALUES,
]);

export const afiliadosInvestigacion = pgTable("afiliados_investigacion", {
 userId: text("user_id")
 .primaryKey()
 .references(() => afiliados.userId, { onDelete: "cascade" }),

 // --- 1. Producción académica ---
 // Boolean tri-state a nivel de formulario: NULL = sin responder,
 // true/false = respuesta explícita. Se deja NULL-able también porque es
 // razonable permitir guardar el perfil incompleto mientras se llena.
 participacionProduccionConocimiento: boolean(
 "participacion_produccion_conocimiento",
 ),
 // Checkbox -> array de códigos. NULL-able: solo aplica si el campo anterior
 // es true (clear_when_hidden). Si tu versión de drizzle-orm no soporta
 // `.array()` sobre un pgEnum, la alternativa es una tabla puente
 // (afiliados_investigacion_producto_academico) con PK compuesta
 // (user_id, opcion) para garantizar unicidad a nivel de BD.
 produccionAcademica: produccionAcademicaEnum("produccion_academica").array(),
 // required=false siempre; solo debe tener valor cuando
 // participacionProduccionConocimiento es true (se valida en Zod).
 otrosProductosAcademicos: text("otros_productos_academicos"),

 // --- 2. Sistema Nacional de Investigadoras e Investigadores (SNI) ---
 situacionSni: situacionSniEnum("situacion_sni"),
 // Condicional: solo aplica si situacionSni es "anterior" o "anterior_y_actual"
 sniPeriodoAnterior: text("sni_periodo_anterior"),
 // Condicional: solo aplica si situacionSni es "actual" o "anterior_y_actual"
 sniPeriodoActual: text("sni_periodo_actual"),

 // --- 3. Redes temáticas CONACYT ---
 redTematicaConacyt: boolean("red_tematica_conacyt"),
 // Condicional: solo aplica si redTematicaConacyt es true
 nombreRed: text("nombre_red"),

 // --- 4. Premios y reconocimientos ---
 haRecibidoPremiosReconocimientos: boolean(
 "ha_recibido_premios_reconocimientos",
 ),
 // Condicional: solo aplica si haRecibidoPremiosReconocimientos es true
 detalleReconocimiento: text("detalle_reconocimiento"),

 // --- 5. Pertenencia a academias / sociedades ---
 perteneceAcademiaSociedad: boolean("pertenece_academia_sociedad"),
 // Condicional: solo aplica si perteneceAcademiaSociedad es true
 nombreOrganizacion: text("nombre_organizacion"),

 createdAt: timestamp("created_at", { withTimezone: true })
 .notNull()
 .defaultNow(),
 updatedAt: timestamp("updated_at", { withTimezone: true })
 .notNull()
 .defaultNow()
 .$onUpdate(() => new Date()),
});

/*export const afiliadosInvestigacionRelations = relations(
 afiliadosInvestigacion,
 ({ one }) => ({
 afiliado: one(afiliados, {
 fields: [afiliadosInvestigacion.userId],
 references: [afiliados.userId],
 }),
 }),
);*/

/**
 * Opcional: si en tu archivo de afiliados.ts ya tienes (o quieres agregar)
 * la relación inversa, sería así:
 *
 * export const afiliadosRelations = relations(afiliados, ({ one }) => ({
 * investigacion: one(afiliadosInvestigacion, {
 * fields: [afiliados.userId],
 * references: [afiliadosInvestigacion.userId],
 * }),
 * }));
 */
