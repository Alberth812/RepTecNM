// @/lib/db/schema/instituciones.ts

import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const instituciones = pgTable("instituciones", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
});
