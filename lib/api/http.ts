// @/lib/api/http.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError } from "@/lib/errors";
import { publicacionIdParamSchema } from "@/lib/validation/publicaciones";

/* ==========================================================================
 1. RESPUESTAS
 ========================================================================== 
*/

export interface ErrorDetail {
 path: string;
 message: string;
}

export interface ErrorBody {
 error: {
 code: string;
 message: string;
 details?: ErrorDetail[];
 };
}

/**
 * Las respuestas dependen de la sesión y pueden contener credenciales
 * temporales (URLs firmadas): nunca deben almacenarse en cachés.
 */
const CACHE_CONTROL = "private, no-store";

export function jsonResponse<T>(
 data: T,
 init: ResponseInit = {},
): NextResponse<T> {
 const headers = new Headers(init.headers);
 headers.set("Cache-Control", CACHE_CONTROL);
 return NextResponse.json(data, { ...init, headers });
}

export function errorResponse(
 status: number,
 code: string,
 message: string,
 details?: ErrorDetail[],
): NextResponse<ErrorBody> {
 return jsonResponse<ErrorBody>(
 { error: { code, message, ...(details ? { details } : {}) } },
 { status },
 );
}

/* ==========================================================================
 2. FÁBRICAS DE ERRORES ADICIONALES
 (los estáticos badRequest/unauthorized/forbidden/notFound ya existen)
 ========================================================================== */

export const payloadTooLarge = (message: string) =>
 new ApiError(413, "PAYLOAD_TOO_LARGE", message);

export const unsupportedMediaType = (message: string) =>
 new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", message);

export const storageError = (message: string) =>
 new ApiError(502, "STORAGE_ERROR", message);

/* ==========================================================================
 3. MANEJO CENTRALIZADO DE ERRORES
 ========================================================================== */

/** Errores de PostgreSQL que tiene sentido traducir a un status HTTP concreto. */
const POSTGRES_ERRORS: Record<
 string,
 { status: number; code: string; message: string }
> = {
 // unique_violation
 "23505": {
 status: 409,
 code: "CONFLICT",
 message: "La operación entra en conflicto con un registro existente.",
 },
 // foreign_key_violation
 "23503": {
 status: 409,
 code: "CONFLICT",
 message: "La operación entra en conflicto con registros relacionados.",
 },
 // check_violation
 "23514": {
 status: 422,
 code: "CONSTRAINT_VIOLATION",
 message: "Los datos enviados no cumplen las restricciones del sistema.",
 },
};

/**
 * Drizzle (según versión) envuelve el error del driver en `cause`, por lo que
 * se recorre la cadena buscando un SQLSTATE (5 caracteres, empieza con dígito).
 */
function findPostgresCode(error: unknown): string | undefined {
 let current: unknown = error;

 for (let depth = 0; depth < 4; depth++) {
 if (typeof current !== "object" || current === null) return undefined;

 const { code, cause } = current as { code?: unknown; cause?: unknown };
 if (typeof code === "string" && /^\d{2}[0-9A-Z]{3}$/.test(code)) {
 return code;
 }
 current = cause;
 }

 return undefined;
}

/**
 * Convierte cualquier error lanzado dentro de un route handler en una
 * respuesta JSON consistente: `{ error: { code, message, details? } }`.
 *
 * Orden: ApiError → ZodError → error de PostgreSQL conocido → 500.
 * Los errores inesperados nunca exponen su mensaje interno al cliente.
 */
export function handleRouteError(
 error: unknown,
 contexto: string,
): NextResponse<ErrorBody> {
 if (error instanceof ApiError) {
 return errorResponse(error.status, error.code, error.message);
 }

 if (error instanceof ZodError) {
 const details: ErrorDetail[] = error.issues.map((issue) => ({
 path: issue.path.join("."),
 message: issue.message,
 }));

 return errorResponse(
 400,
 "VALIDATION_ERROR",
 details[0]?.message ?? "Los datos enviados no son válidos.",
 details,
 );
 }

 const pgCode = findPostgresCode(error);
 const pgError = pgCode ? POSTGRES_ERRORS[pgCode] : undefined;
 if (pgError) {
 console.error(`[${contexto}] Error de PostgreSQL (${pgCode}):`, error);
 return errorResponse(pgError.status, pgError.code, pgError.message);
 }

 console.error(`[${contexto}] Error no controlado:`, error);
 return errorResponse(
 500,
 "INTERNAL_ERROR",
 "Ocurrió un error interno. Intenta de nuevo más tarde.",
 );
}

/* ==========================================================================
 4. PARSEO DE ENTRADAS
 ========================================================================== */

/** Tamaño máximo razonable para un body JSON de metadatos. */
const DEFAULT_MAX_JSON_BYTES = 256 * 1024;

/**
 * Lee un body JSON validando Content-Type y tamaño declarado.
 * El resultado es `unknown`: debe validarse con un esquema Zod.
 */
export async function readJsonBody(
 request: Request,
 maxBytes = DEFAULT_MAX_JSON_BYTES,
): Promise<unknown> {
 const contentType = request.headers.get("content-type") ?? "";
 if (!contentType.toLowerCase().includes("application/json")) {
 throw unsupportedMediaType('El Content-Type debe ser "application/json".');
 }

 const contentLength = request.headers.get("content-length");
 if (contentLength && Number(contentLength) > maxBytes) {
 throw payloadTooLarge("El cuerpo de la solicitud es demasiado grande.");
 }

 try {
 return await request.json();
 } catch {
 throw ApiError.badRequest(
 "El cuerpo de la solicitud debe ser un JSON válido.",
 );
 }
}

/**
 * Valida el parámetro de ruta `[id]` (UUID).
 * En Next.js 15+ `params` es una Promise; `await` también es seguro en 14.
 */
export async function parseIdParam(
 params: Promise<{ id: string }> | { id: string },
): Promise<string> {
 const { id } = publicacionIdParamSchema.parse(await params);
 return id;
}
