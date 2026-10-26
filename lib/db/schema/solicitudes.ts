// db/schema/solicitudes.ts
import type { SolicitudDatosSnapshot } from "@/lib/registro/solicitud-snapshot";
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { administradores } from "./administradores";
import { afiliados } from "./afiliados";
import { archivos } from "./archivo";
import { revisionDecisionEnum } from "./enums";

/**
 * Cada fila es una versión inmutable de la solicitud de registro de un
 * afiliado. Solo se conservan las últimas dos versiones por afiliado (la
 * "actual" = version más alta, y la "anterior"); versiones más viejas se
 * podan en cada nuevo envío (ver `crearSolicitud`).
 *
 * Cuando un admin aprueba al afiliado, los datos de la versión actual se
 * copian de forma definitiva a `afiliados` (+ tablas relacionadas). Esta
 * tabla deja de ser fuente de verdad para ese afiliado a partir de ahí,
 * pero se conserva como historial de solo lectura.
 */
export const solicitudes = pgTable(
  "solicitudes",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    afiliadoId: text("afiliado_id")
      .notNull()
      .references(() => afiliados.userId, { onDelete: "cascade" }),

    /** 1, 2, 3... por afiliado. La versión más alta es la "actual". */
    version: integer("version").notNull(),

    /**
     * Snapshot de todas las respuestas del formulario, excepto los
     * archivos (que viven en `archivos`, referenciados abajo).
     */
    datos: jsonb("datos").notNull().$type<SolicitudDatosSnapshot>(),

    fotografiaArchivoId: uuid("fotografia_archivo_id")
      .notNull()
      .references(() => archivos.id),
    comprobanteMembresiaArchivoId: uuid("comprobante_membresia_archivo_id")
      .notNull()
      .references(() => archivos.id),

    // --- Revisión del administrador (nula hasta que se atienda) ---
    revisionDecision: revisionDecisionEnum("revision_decision"),
    revisionObservaciones: text("revision_observaciones"),
    revisadoPorAdminId: text("revisado_por_admin_id").references(
      () => administradores.userId,
    ),
    revisadoEn: timestamp("revisado_en", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("solicitudes_afiliado_version_unique").on(
      table.afiliadoId,
      table.version,
    ),
  ],
);

export type SolicitudRow = typeof solicitudes.$inferSelect;
export type NewSolicitud = typeof solicitudes.$inferInsert;
