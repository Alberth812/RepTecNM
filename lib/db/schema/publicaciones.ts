// @/lib/db/schema/publicaciones.ts
import { sql } from "drizzle-orm";
import {
 check,
 index,
 integer,
 pgEnum,
 pgTable,
 text,
 timestamp,
 uniqueIndex,
 uuid,
} from "drizzle-orm/pg-core";

import { afiliados } from "./afiliados";
import { archivos } from "./archivo";

/* -------------------------------------------------------------------------- */
/* Enums */
/* -------------------------------------------------------------------------- */

export const tipoPublicacionEnum = pgEnum("tipo_publicacion", [
 "ARTICULO",
 "TESIS",
 "LIBRO",
 "MEMORIA_CONGRESO",
 "PRESENTACION",
 "ENSAYO",
 "REPORTE_TECNICO",
 "OTRO",
]);

export const estadoPublicacionEnum = pgEnum("estado_publicacion", ["ACTIVO"]);

/* -------------------------------------------------------------------------- */
/* Publicaciones */
/* -------------------------------------------------------------------------- */

export const publicaciones = pgTable(
 "publicaciones",
 {
 id: uuid("id").defaultRandom().primaryKey(),

 afiliadoId: text("afiliado_id")
 .notNull()
 .references(() => afiliados.userId, { onDelete: "cascade" }),

 titulo: text("titulo").notNull(),
 descripcion: text("descripcion").notNull(),

 tipo: tipoPublicacionEnum("tipo").notNull(),
 tipoOtro: text("tipo_otro"),

 anioPublicacion: integer("anio_publicacion").notNull(),

 doi: text("doi"),
 revistaCongreso: text("revista_congreso"),
 editorial: text("editorial"),
 isbn: text("isbn"),
 issn: text("issn"),
 url: text("url"),

 documentoArchivoId: uuid("documento_archivo_id")
 .notNull()
 .references(() => archivos.id, { onDelete: "restrict" }),

 descargoVersion: integer("descargo_version").notNull(),
 descargoAceptadoAt: timestamp("descargo_aceptado_at", {
 withTimezone: true,
 }).notNull(),

 estado: estadoPublicacionEnum("estado").notNull().default("ACTIVO"),

 createdAt: timestamp("created_at", { withTimezone: true })
 .defaultNow()
 .notNull(),
 updatedAt: timestamp("updated_at", { withTimezone: true })
 .defaultNow()
 .notNull(),
 },
 (table) => [
 // Un archivo solo puede estar asociado a una publicación.
 uniqueIndex("publicaciones_documento_archivo_id_unique").on(
 table.documentoArchivoId,
 ),

 // tipo_otro: NULL sii tipo <> OTRO; obligatorio sii tipo = OTRO.
 check(
 "publicaciones_tipo_otro_check",
 sql`(${table.tipo} = 'OTRO' AND ${table.tipoOtro} IS NOT NULL)
 OR (${table.tipo} <> 'OTRO' AND ${table.tipoOtro} IS NULL)`,
 ),

 check(
 "publicaciones_tipo_otro_length_check",
 sql`${table.tipoOtro} IS NULL
 OR char_length(${table.tipoOtro}) BETWEEN 3 AND 50`,
 ),

 check(
 "publicaciones_titulo_length_check",
 sql`char_length(${table.titulo}) BETWEEN 3 AND 300`,
 ),

 check(
 "publicaciones_descripcion_length_check",
 sql`char_length(${table.descripcion}) BETWEEN 10 AND 1800`,
 ),

 check(
 "publicaciones_anio_check",
 sql`${table.anioPublicacion} BETWEEN 1950
 AND EXTRACT(YEAR FROM CURRENT_DATE)::int`,
 ),

 index("publicaciones_afiliado_id_idx").on(table.afiliadoId),
 index("publicaciones_estado_idx").on(table.estado),
 index("publicaciones_created_at_idx").on(table.createdAt),
 index("publicaciones_tipo_idx").on(table.tipo),
 index("publicaciones_anio_publicacion_idx").on(table.anioPublicacion),
 ],
);

/* -------------------------------------------------------------------------- */
/* Autores de publicación */
/* -------------------------------------------------------------------------- */

export const publicacionAutores = pgTable(
 "publicacion_autores",
 {
 id: uuid("id").defaultRandom().primaryKey(),

 publicacionId: uuid("publicacion_id")
 .notNull()
 .references(() => publicaciones.id, { onDelete: "cascade" }),

 nombres: text("nombres").notNull(),
 apellidos: text("apellidos").notNull(),
 orden: integer("orden").notNull(),
 },
 (table) => [
 uniqueIndex("publicacion_autores_publicacion_orden_unique").on(
 table.publicacionId,
 table.orden,
 ),

 check(
 "publicacion_autores_nombres_length_check",
 sql`char_length(${table.nombres}) BETWEEN 3 AND 150`,
 ),
 check(
 "publicacion_autores_apellidos_length_check",
 sql`char_length(${table.apellidos}) BETWEEN 3 AND 150`,
 ),
 check("publicacion_autores_orden_check", sql`${table.orden} >= 1`),

 index("publicacion_autores_publicacion_id_idx").on(table.publicacionId),
 ],
);

/* -------------------------------------------------------------------------- */
/* Palabras clave de publicación */
/* -------------------------------------------------------------------------- */

export const publicacionPalabrasClave = pgTable(
 "publicacion_palabras_clave",
 {
 id: uuid("id").defaultRandom().primaryKey(),

 publicacionId: uuid("publicacion_id")
 .notNull()
 .references(() => publicaciones.id, { onDelete: "cascade" }),

 // Se almacena ya normalizado (trim, minúsculas, espacios internos simples).
 valor: text("valor").notNull(),
 },
 (table) => [
 uniqueIndex("publicacion_palabras_clave_publicacion_valor_unique").on(
 table.publicacionId,
 table.valor,
 ),

 check(
 "publicacion_palabras_clave_valor_length_check",
 sql`char_length(${table.valor}) BETWEEN 3 AND 50`,
 ),

 index("publicacion_palabras_clave_valor_idx").on(table.valor),
 ],
);

/* -------------------------------------------------------------------------- */
/* Relaciones */
/* -------------------------------------------------------------------------- */
/*
export const publicacionesRelations = relations(
 publicaciones,
 ({ one, many }) => ({
 afiliado: one(afiliados, {
 fields: [publicaciones.afiliadoId],
 references: [afiliados.userId],
 }),
 documento: one(archivos, {
 fields: [publicaciones.documentoArchivoId],
 references: [archivos.id],
 }),
 autores: many(publicacionAutores),
 palabrasClave: many(publicacionPalabrasClave),
 }),
);

export const publicacionAutoresRelations = relations(
 publicacionAutores,
 ({ one }) => ({
 publicacion: one(publicaciones, {
 fields: [publicacionAutores.publicacionId],
 references: [publicaciones.id],
 }),
 }),
);

export const publicacionPalabrasClaveRelations = relations(
 publicacionPalabrasClave,
 ({ one }) => ({
 publicacion: one(publicaciones, {
 fields: [publicacionPalabrasClave.publicacionId],
 references: [publicaciones.id],
 }),
 }),
);
*/
/* -------------------------------------------------------------------------- */
/* Types */
/* -------------------------------------------------------------------------- */

export type Publicacion = typeof publicaciones.$inferSelect;
export type NewPublicacion = typeof publicaciones.$inferInsert;

export type PublicacionAutor = typeof publicacionAutores.$inferSelect;
export type NewPublicacionAutor = typeof publicacionAutores.$inferInsert;

export type PublicacionPalabraClave =
 typeof publicacionPalabrasClave.$inferSelect;
export type NewPublicacionPalabraClave =
 typeof publicacionPalabrasClave.$inferInsert;

export type TipoPublicacion = (typeof tipoPublicacionEnum.enumValues)[number];
export type EstadoPublicacion =
 (typeof estadoPublicacionEnum.enumValues)[number];
