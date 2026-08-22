import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { adminSubtypeEnum } from "./enums";

/**
 * Perfil de administrador (RF-AUTH-013/014/015). Se crea:
 *  - Para el administrador raíz: por `scripts/seed-root-admin.ts` (fuera de la app).
 *  - Para el resto: por `POST /api/admins`, restringido a administradores GENERAL.
 *
 * Nunca se crea a través del registro público (RF-AUTH-013).
 */
export const administradores = pgTable("administradores", {
  accountId: text("account_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),

  nombreCompleto: text("nombre_completo").notNull(),
  subtype: adminSubtypeEnum("subtype").notNull(),

  // Solo se asigna `true` desde scripts/seed-root-admin.ts. Ninguna ruta de
  // la aplicación permite establecer este campo (RF-AUTH-013).
  isRoot: boolean("is_root").notNull().default(false),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
