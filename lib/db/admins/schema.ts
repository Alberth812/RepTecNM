import { boolean, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { accounts } from "../accounts/schema";

export const adminSubtypeEnum = pgEnum("admin_subtype", [
  "GENERAL",
  "CONTENIDO",
]);

export const administradores = pgTable("administradores", {
  accountId: uuid("account_id")
    .primaryKey()
    .references(() => accounts.id, {
      onDelete: "cascade",
    }),

  nombreCompleto: text("nombre_completo").notNull(),

  subtype: adminSubtypeEnum("subtype").notNull(),

  isRoot: boolean("is_root").notNull().default(false),
});
