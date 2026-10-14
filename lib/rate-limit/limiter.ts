import { and, eq, gt, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { authEvents } from "@/lib/db/schema/rate-limit";
import { ApiError } from "@/lib/errors";
import { authEventTypeEnum } from "../db/schema/enums";

type AuthEventType = (typeof authEventTypeEnum.enumValues)[number];

export type RecordEventInput = {
 type: AuthEventType;
 userId?: string | null;
 email?: string | null;
 ipAddress?: string | null;
};

/** Registra un evento de auditoría/anti-abuso. Ver rate-limit-schema.ts. */
export async function recordAuthEvent(input: RecordEventInput): Promise<void> {
 await db.insert(authEvents).values({
 type: input.type,
 userId: input.userId ?? null,
 email: input.email ?? null,
 ipAddress: input.ipAddress ?? null,
 });
}

type Dimension =
 | { column: "userId"; value: string }
 | { column: "email"; value: string }
 | { column: "ipAddress"; value: string };

/** Cuenta eventos de un tipo, para una dimensión dada, dentro de una ventana. */
export async function countAuthEvents(
 type: AuthEventType,
 dimension: Dimension,
 windowMs: number,
): Promise<number> {
 const since = new Date(Date.now() - windowMs);
 const columnMap = {
 userId: authEvents.userId,
 email: authEvents.email,
 ipAddress: authEvents.ipAddress,
 } as const;

 const [row] = await db
 .select({ count: sql<number>`count(*)` })
 .from(authEvents)
 .where(
 and(
 eq(authEvents.type, type),
 eq(columnMap[dimension.column], dimension.value),
 gt(authEvents.createdAt, since),
 ),
 );

 return Number(row?.count ?? 0);
}

/** Timestamp del evento más reciente de ese tipo/dimensión, o null si no hay ninguno. */
export async function lastAuthEventAt(
 type: AuthEventType,
 dimension: Dimension,
): Promise<Date | null> {
 const columnMap = {
 userId: authEvents.userId,
 email: authEvents.email,
 ipAddress: authEvents.ipAddress,
 } as const;

 const [row] = await db
 .select({ createdAt: authEvents.createdAt })
 .from(authEvents)
 .where(
 and(
 eq(authEvents.type, type),
 eq(columnMap[dimension.column], dimension.value),
 ),
 )
 .orderBy(desc(authEvents.createdAt))
 .limit(1);

 return row?.createdAt ?? null;
}

/**
 * Verifica un límite "máximo N eventos de tipo `type` por ventana deslizante
 * `windowMs`" para una dimensión dada. Lanza ApiError 429 (con Retry-After)
 * si se supera. No registra el evento: eso lo hace el caller explícitamente
 * después de que la operación protegida efectivamente ocurra (así,
 * únicamente los intentos que queremos contar entran al contador; ver
 * comentario en rate-limit-schema.ts).
 */
export async function enforceRollingLimit(params: {
 type: AuthEventType;
 dimension: Dimension;
 windowMs: number;
 max: number;
 message: string;
}): Promise<void> {
 const count = await countAuthEvents(
 params.type,
 params.dimension,
 params.windowMs,
 );
 if (count >= params.max) {
 const oldest = await lastAuthEventAt(params.type, params.dimension);
 // Aproximación simple y suficientemente correcta: si no logramos ubicar
 // el evento más antiguo dentro de la ventana, informamos la ventana
 // completa como tiempo de espera.
 const retryAfterMs = oldest
 ? Math.max(0, oldest.getTime() + params.windowMs - Date.now())
 : params.windowMs;
 throw ApiError.rateLimited(params.message, Math.ceil(retryAfterMs / 1000));
 }
}

/**
 * Verifica un intervalo mínimo entre dos eventos consecutivos del mismo tipo
 * y dimensión (RF-AUTH-003/004: 120s entre reenvíos de OTP).
 */
export async function enforceMinInterval(params: {
 type: AuthEventType;
 dimension: Dimension;
 minIntervalMs: number;
 message: string;
}): Promise<void> {
 const last = await lastAuthEventAt(params.type, params.dimension);
 if (!last) return;

 const elapsed = Date.now() - last.getTime();
 if (elapsed < params.minIntervalMs) {
 const retryAfterMs = params.minIntervalMs - elapsed;
 throw ApiError.rateLimited(params.message, Math.ceil(retryAfterMs / 1000));
 }
}
