import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

// RF-AUTH-015: subtipo de administrador.
export const adminSubtypeEnum = pgEnum("admin_subtype", [
  "GENERAL",
  "CONTENIDO",
]);

/**
 * Perfil de administrador (1:1 con `users`, solo existe cuando
 * users.role = 'ADMINISTRADOR'). No se crea por registro público
 * (RF-AUTH-013): siempre vía seed inicial o vía otro administrador GENERAL.
 */
export const administradores = pgTable("administradores", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  nombreCompleto: text("nombre_completo").notNull(),

  subtype: adminSubtypeEnum("subtype").notNull(),

  // RF-AUTH-013: solo puede ser true para el administrador raíz creado por
  // el seed inicial. Nunca se expone como campo asignable en la API.
  isRoot: boolean("is_root").notNull().default(false),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
