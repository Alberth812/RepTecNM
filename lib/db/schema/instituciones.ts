// @/lib/db/schema/instituciones.ts

import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const institucionEstadoEnum = pgEnum("institucion_estado", [
  "ACTIVO",
  "INACTIVO",
]);

export const instituciones = pgTable("instituciones", {
  id: uuid("id").primaryKey().defaultRandom(),

  nombre: text("nombre").notNull(),

  estado: institucionEstadoEnum("estado").notNull().default("ACTIVO"),

  lastChangedToInactivoAt: timestamp("last_changed_to_inactivo_at", {
    withTimezone: true,
  }),
});
