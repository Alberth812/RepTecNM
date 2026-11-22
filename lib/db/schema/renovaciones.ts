// @/lib/db/schema/renovaciones.ts

import { sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth-schema";
import { archivos } from "./archivo";

export const renovacionEstadoEnum = pgEnum("renovacion_estado", [
  "PENDIENTE",
  "APROBADA",
  "RECHAZADA",
]);

export const renovacionesMembresia = pgTable(
  "renovaciones_membresia",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    afiliadoId: text("afiliado_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    comprobanteArchivoId: uuid("comprobante_archivo_id")
      .notNull()
      .unique()
      .references(() => archivos.id),

    estado: renovacionEstadoEnum("estado").notNull().default("PENDIENTE"),

    // Observaciones del administrador (se usan sobre todo al rechazar).
    observaciones: text("observaciones"),

    // Snapshot informativo: qué fecha de inicio tenía el afiliado cuando
    // envió este comprobante. Solo para auditoría, no se usa para calcular
    // nada.
    fechaInicioMembresiaPrevia: timestamp("fecha_inicio_membresia_previa", {
      withTimezone: true,
    }),

    // Se llena solo si estado = APROBADA: la nueva fecha de inicio que
    // quedó vigente como resultado de esta renovación.
    fechaInicioMembresiaAplicada: timestamp("fecha_inicio_membresia_aplicada", {
      withTimezone: true,
    }),

    procesadoPorAdminId: text("procesado_por_admin_id").references(
      () => users.id,
      { onDelete: "set null" },
    ),
    procesadoAt: timestamp("procesado_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Garantiza a nivel de base de datos que un afiliado no pueda tener más
    // de una renovación PENDIENTE a la vez. Defensa adicional ante
    // condiciones de carrera (dos pestañas enviando a la vez, etc.).
    uniqueIndex("renovaciones_membresia_pendiente_unica_idx")
      .on(table.afiliadoId)
      .where(sql`${table.estado} = 'PENDIENTE'`),
    index("renovaciones_membresia_afiliado_created_idx").on(
      table.afiliadoId,
      table.createdAt,
    ),
  ],
);

export type RenovacionMembresia = typeof renovacionesMembresia.$inferSelect;
export type NuevaRenovacionMembresia =
  typeof renovacionesMembresia.$inferInsert;
