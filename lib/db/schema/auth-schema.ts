/**
 * Tablas "núcleo" que Better Auth necesita (user, session, account, verification).
 *
 * Están basadas 1:1 en lo que genera `npx @better-auth/cli generate`, con dos
 * columnas propias añadidas a `user` a través de `additionalFields` en `src/lib/auth.ts`:
 *
 *   - role            : "AFILIADO" | "ADMINISTRADOR"  (RF-AUTH intro, sección 3)
 *   - emailVerifiedAt : marca de tiempo de verificación (equivalente a lo que
 *                       en el diseño original vivía en `accounts.email_verified_at`)
 *
 * Deliberadamente NO se usa la tabla `accounts` original que compartiste
 * (la del enum account_role + password_hash manual): Better Auth ya administra
 * usuarios, credenciales y sesiones con sus propias tablas (`user`, `account`,
 * `session`, `verification`), así que esa tabla se descarta para evitar
 * duplicar responsabilidades, tal como comentaste en la solicitud.
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { accountRoleEnum } from "./enums";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),

  // --- Campos propios del dominio (additionalFields en better-auth) ---
  role: accountRoleEnum("role").notNull().default("AFILIADO"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

// Nota: Better Auth llama a esta tabla "account" (singular) y la usa para
// credenciales (email+password) y proveedores OAuth. No confundir con el
// concepto de negocio "cuenta" del documento de requisitos: aquí `user` ES
// la cuenta, y `account` son sus métodos de acceso.
export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    issuer: text("issuer").notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("account_issuer_accountId_uidx").on(
      table.issuer,
      table.accountId,
    ),
    index("account_userId_idx").on(table.userId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);
