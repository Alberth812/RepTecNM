import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { loginLockouts } from "@/lib/db/schema/rate-limit";
import { AUTH_RULES } from "@/lib/constants";
import { ApiError } from "@/lib/errors";
import { countAuthEvents, recordAuthEvent } from "./limiter";

/**
 * RF-AUTH-025: intentos fallidos de login con backoff progresivo, combinando
 * como mínimo cuenta + IP (RF-AUTH-026).
 *
 * - Por CUENTA: contador persistente con bloqueo progresivo (tabla
 * login_lockouts). Es la defensa principal contra fuerza bruta dirigida a
 * una sola cuenta, sin importar desde cuántas IPs distintas venga.
 * - Por IP: tope simple de fallos en una ventana corta (tabla auth_events),
 * para frenar a un atacante que reparte intentos entre muchas cuentas
 * desde una misma IP (RF-AUTH-026: "un atacante puede distribuir
 * solicitudes entre múltiples direcciones", así que también cubrimos el
 * caso simétrico: una IP contra muchas cuentas).
 */

function normalizeEmail(email: string) {
 return email.trim().toLowerCase();
}

function tierFor(failedCount: number): number {
 let lockMs = 0;
 for (const tier of AUTH_RULES.LOGIN_BACKOFF_TIERS) {
 if (failedCount >= tier.afterFailures) lockMs = tier.lockMs;
 }
 return lockMs;
}

export async function assertLoginAllowed(
 email: string,
 ip: string,
): Promise<void> {
 const key = normalizeEmail(email);

 const [row] = await db
 .select()
 .from(loginLockouts)
 .where(eq(loginLockouts.emailKey, key));

 if (row?.lockedUntil && row.lockedUntil.getTime() > Date.now()) {
 const retryAfterSeconds = Math.ceil(
 (row.lockedUntil.getTime() - Date.now()) / 1000,
 );
 throw ApiError.rateLimited(
 "Demasiados intentos fallidos. Intenta de nuevo más tarde.",
 retryAfterSeconds,
 "TOO_MANY_LOGIN_ATTEMPTS",
 );
 }

 const ipFailures = await countAuthEvents(
 "LOGIN_FAILED",
 { column: "ipAddress", value: ip },
 AUTH_RULES.LOGIN_MAX_FAILURES_PER_IP_WINDOW_MS,
 );
 if (ipFailures >= AUTH_RULES.LOGIN_MAX_FAILURES_PER_IP) {
 throw ApiError.rateLimited(
 "Demasiados intentos fallidos desde tu red. Intenta de nuevo más tarde.",
 Math.ceil(AUTH_RULES.LOGIN_MAX_FAILURES_PER_IP_WINDOW_MS / 1000),
 "TOO_MANY_LOGIN_ATTEMPTS_IP",
 );
 }
}

export async function recordLoginFailure(
 email: string,
 ip: string,
): Promise<void> {
 const key = normalizeEmail(email);

 await recordAuthEvent({ type: "LOGIN_FAILED", email: key, ipAddress: ip });

 // UPSERT: incrementa el contador de fallos y recalcula el bloqueo.
 await db
 .insert(loginLockouts)
 .values({ emailKey: key, failedCount: 1, lockedUntil: null })
 .onConflictDoUpdate({
 target: loginLockouts.emailKey,
 set: { failedCount: sql`${loginLockouts.failedCount} + 1` },
 });

 const [row] = await db
 .select()
 .from(loginLockouts)
 .where(eq(loginLockouts.emailKey, key));

 const failedCount = row?.failedCount ?? 1;
 const lockMs = tierFor(failedCount);
 if (lockMs > 0) {
 await db
 .update(loginLockouts)
 .set({ lockedUntil: new Date(Date.now() + lockMs) })
 .where(eq(loginLockouts.emailKey, key));
 }
}

export async function resetLoginFailures(email: string): Promise<void> {
 const key = normalizeEmail(email);
 await db
 .update(loginLockouts)
 .set({ failedCount: 0, lockedUntil: null })
 .where(eq(loginLockouts.emailKey, key));
}
