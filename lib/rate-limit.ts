import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rateLimitState } from "@/db/schema";

export type RateLimitOptions = {
  /** Tiempo mínimo (segundos) entre dos solicitudes consecutivas. RF-AUTH-003. */
  cooldownSeconds?: number;
  /** Máximo de solicitudes permitidas dentro de `windowSeconds`. RF-AUTH-011. */
  maxInWindow?: number;
  /** Tamaño de la ventana (segundos), contada desde la primera solicitud del período. */
  windowSeconds?: number;
};

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/**
 * Consulta de solo lectura (no consume) sobre si un cooldown ya se cumplió.
 * Útil para decidir en la UI/API si se debe *ofrecer* la acción de reenviar
 * sin disparar el reenvío en sí (RF-AUTH-005.a).
 */
export async function peekCooldown(
  key: string,
  cooldownSeconds: number,
): Promise<{ ready: boolean; retryAfterSeconds: number }> {
  const rows = await db
    .select()
    .from(rateLimitState)
    .where(eq(rateLimitState.key, key))
    .limit(1);
  const existing = rows[0];
  if (!existing) return { ready: true, retryAfterSeconds: 0 };

  const elapsedMs = Date.now() - existing.lastRequestAt.getTime();
  const cooldownMs = cooldownSeconds * 1000;
  if (elapsedMs >= cooldownMs) return { ready: true, retryAfterSeconds: 0 };
  return {
    ready: false,
    retryAfterSeconds: Math.ceil((cooldownMs - elapsedMs) / 1000),
  };
}

/**
 * Verifica y, si procede, consume una unidad de un "cubo" de rate-limit
 * identificado por `key`. Combina dos reglas independientes (pueden usarse
 * juntas o por separado):
 *
 *   - cooldownSeconds: tiempo mínimo desde la ÚLTIMA solicitud (RF-AUTH-003:
 *     120s entre reenvíos del código de verificación).
 *   - maxInWindow / windowSeconds: cupo máximo dentro de una ventana que se
 *     reinicia desde la PRIMERA solicitud del período, no una ventana
 *     deslizante (RF-AUTH-011: 5 solicitudes de recuperación en 7 días).
 *
 * Usa `SELECT ... FOR UPDATE` dentro de una transacción para que dos
 * solicitudes concurrentes con la misma `key` no puedan ambas "colarse".
 */
export async function checkAndConsume(
  key: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const now = new Date();

  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(rateLimitState)
      .values({ key, windowStart: now, count: 1, lastRequestAt: now })
      .onConflictDoNothing({ target: rateLimitState.key })
      .returning();

    if (inserted.length > 0) {
      return { allowed: true };
    }

    const rows = await tx
      .select()
      .from(rateLimitState)
      .where(eq(rateLimitState.key, key))
      .for("update");
    const existing = rows[0];

    if (!existing) {
      await tx
        .insert(rateLimitState)
        .values({ key, windowStart: now, count: 1, lastRequestAt: now });
      return { allowed: true };
    }

    if (opts.cooldownSeconds) {
      const elapsedMs = now.getTime() - existing.lastRequestAt.getTime();
      const cooldownMs = opts.cooldownSeconds * 1000;
      if (elapsedMs < cooldownMs) {
        return {
          allowed: false,
          retryAfterSeconds: Math.ceil((cooldownMs - elapsedMs) / 1000),
        };
      }
    }

    if (opts.maxInWindow && opts.windowSeconds) {
      const windowElapsedMs = now.getTime() - existing.windowStart.getTime();
      const windowMs = opts.windowSeconds * 1000;

      if (windowElapsedMs > windowMs) {
        // La ventana anterior ya expiró: se reinicia el contador.
        await tx
          .update(rateLimitState)
          .set({ windowStart: now, count: 1, lastRequestAt: now })
          .where(eq(rateLimitState.key, key));
        return { allowed: true };
      }

      if (existing.count > opts.maxInWindow) {
        return {
          allowed: false,
          retryAfterSeconds: Math.ceil((windowMs - windowElapsedMs) / 1000),
        };
      }

      await tx
        .update(rateLimitState)
        .set({ count: existing.count + 1, lastRequestAt: now })
        .where(eq(rateLimitState.key, key));
      return { allowed: true };
    }

    // Solo había regla de cooldown y ya se cumplió: se registra el uso.
    await tx
      .update(rateLimitState)
      .set({ lastRequestAt: now, count: existing.count + 1 })
      .where(eq(rateLimitState.key, key));
    return { allowed: true };
  });
}
