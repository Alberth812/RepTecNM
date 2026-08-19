import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const accountRoleEnum = pgEnum("account_role", [
  "AFILIADO",
  "ADMINISTRADOR",
]);

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),

  email: text("email").notNull(),

  passwordHash: text("password_hash").notNull(),

  role: accountRoleEnum("role").notNull(),

  emailStatus: boolean("email_verified").notNull().default(false),

  emailVerifiedAt: timestamp("email_verified_at", {
    withTimezone: true,
  }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
