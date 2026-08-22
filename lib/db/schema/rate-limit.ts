import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

/**
 * Contador de rate-limit genérico y reutilizable, propio de la aplicación
 * (independiente del `rateLimit` interno de Better Auth, que protege sus
 * propios endpoints contra fuerza bruta a nivel de IP/requests-por-ventana).
 *
 * Se usa para reglas de negocio específicas que no son "N requests por
 * ventana fija", sino cosas como:
 *   - RF-AUTH-003: 120s de enfriamiento entre reenvíos del código de verificación.
 *   - RF-AUTH-011: máximo 5 solicitudes de recuperación de contraseña en una
 *     ventana de 7 días, contados desde la PRIMERA solicitud de ese período
 *     (no una ventana deslizante clásica).
 *
 * `key` identifica el "cubo" que se limita, p. ej.:
 *   "otp-resend:email-verification:usuario@ejemplo.com"
 *   "password-reset:usuario@ejemplo.com"
 */
export const rateLimitState = pgTable("rate_limit_state", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(0),
  lastRequestAt: timestamp("last_request_at", { withTimezone: true }).notNull(),
});
