import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  integer,
  uuid,
  index,
} from "drizzle-orm/pg-core";

/**
 * Better Auth trae su propio limitador (ver rateLimit.customRules en
 * lib/auth/auth.ts) para límites simples de "N solicitudes por ventana y por
 * IP" en SUS endpoints. Pero varias reglas de la sección 3.5 son más finas
 * de lo que ese limitador soporta out-of-the-box:
 *   - ventanas largas (7 días, 48 horas) que conviene persistir en Postgres
 *     en vez de en memoria/caché de sesión corta,
 *   - combinar dimensiones (cuenta + IP a la vez, RF-AUTH-026),
 *   - contar solo eventos "exitosos" (p. ej. RF-AUTH-024 solo cuenta cambios
 *     de contraseña que sí se completaron),
 *   - aplicar a rutas propias (no montadas por better-auth) como
 *     /api/account/change-email/*.
 *
 * Para esos casos usamos esta tabla de eventos, tipo "append-only log", y
 * consultamos con COUNT(*) sobre una ventana deslizante. Es simple, auditable
 * y cada regla RF-AUTH-0XX queda expresada como una tupla
 * (tipo, dimensión, ventana, máximo) en src/lib/constants.ts, en vez de vivir
 * dispersa en el código.
 */
export const authEventTypeEnum = pgEnum("auth_event_type", [
  "EMAIL_VERIFICATION_OTP_SENT", // RF-AUTH-002/003/018/019 (signup y cambio de correo)
  "PASSWORD_RESET_REQUESTED", // RF-AUTH-011/023
  "PASSWORD_RESET_COMPLETED", // RF-AUTH-024
  "SIGNUP_ATTEMPTED", // RF-AUTH-017
  "LOGIN_FAILED", // RF-AUTH-025/026
]);

export const authEvents = pgTable(
  "auth_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: authEventTypeEnum("type").notNull(),

    // Dimensiones disponibles para filtrar. No todas aplican a todo tipo de
    // evento; se dejan nullable y cada consulta usa las que necesita.
    userId: text("user_id"),
    email: text("email"),
    ipAddress: text("ip_address"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("auth_events_type_user_idx").on(
      table.type,
      table.userId,
      table.createdAt,
    ),
    index("auth_events_type_email_idx").on(
      table.type,
      table.email,
      table.createdAt,
    ),
    index("auth_events_type_ip_idx").on(
      table.type,
      table.ipAddress,
      table.createdAt,
    ),
  ],
);

/**
 * RF-AUTH-025/026: backoff progresivo de login por cuenta. Se guarda aparte
 * de auth_events (que es un log de eventos) porque acá necesitamos estado
 * mutable (contador + hasta cuándo está bloqueada la cuenta), no un historial.
 */
export const loginLockouts = pgTable("login_lockouts", {
  // Clave normalizada: lower(email). Ver lib/rate-limit/login-lockout.ts
  emailKey: text("email_key").primaryKey(),
  failedCount: integer("failed_count").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
