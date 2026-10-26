import {
  integer,
  pgTable,
  primaryKey,
} from "drizzle-orm/pg-core";

export const foliosAnuales = pgTable(
  "folios_anuales",
  {
    anio: integer("anio").notNull(),
    ultimoNumero: integer("ultimo_numero").notNull().default(0),
  },
  (table) => [
    primaryKey({
      columns: [table.anio],
    }),
  ],
);