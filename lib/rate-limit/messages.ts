/**
 * Rate limiting para envío de mensajes
 * Usa un Map en memoria (para producción considerar Redis)
 */

interface RateLimitEntry {
 count: number;
 resetAt: number;
}

// Mapa en memoria para rate limiting
const messageLimits = new Map<string, RateLimitEntry>();

// Configuración
const MAX_MESSAGES_PER_HOUR = 10;
const MAX_MESSAGES_PER_DAY = 50;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function checkMessageRateLimit(userId: string): {
 allowed: boolean;
 remaining: number;
 resetAt: number;
} {
 const now = Date.now();
 const entry = messageLimits.get(userId);

 // Si no existe o expiró, crear nuevo
 if (!entry || now > entry.resetAt) {
 messageLimits.set(userId, {
 count: 1,
 resetAt: now + HOUR_MS,
 });
 return {
 allowed: true,
 remaining: MAX_MESSAGES_PER_HOUR - 1,
 resetAt: now + HOUR_MS,
 };
 }

 // Verificar límite por hora
 if (entry.count >= MAX_MESSAGES_PER_HOUR) {
 return {
 allowed: false,
 remaining: 0,
 resetAt: entry.resetAt,
 };
 }

 // Incrementar contador
 entry.count += 1;
 return {
 allowed: true,
 remaining: MAX_MESSAGES_PER_HOUR - entry.count,
 resetAt: entry.resetAt,
 };
}

export function checkDailyMessageLimit(userId: string): {
 allowed: boolean;
 remaining: number;
} {
 const now = Date.now();
 const dailyKey = `daily:${userId}`;
 const entry = messageLimits.get(dailyKey);

 if (!entry || now > entry.resetAt) {
 messageLimits.set(dailyKey, {
 count: 1,
 resetAt: now + DAY_MS,
 });
 return {
 allowed: true,
 remaining: MAX_MESSAGES_PER_DAY - 1,
 };
 }

 if (entry.count >= MAX_MESSAGES_PER_DAY) {
 return {
 allowed: false,
 remaining: 0,
 };
 }

 entry.count += 1;
 return {
 allowed: true,
 remaining: MAX_MESSAGES_PER_DAY - entry.count,
 };
}
