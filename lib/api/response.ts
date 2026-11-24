// @/lib/api/response.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "@/lib/errors";

/**
 * Envoltura uniforme para todas las respuestas JSON de la API administrativa.
 * Éxito:  { success: true, data: T }
 * Error:  { success: false, error: { code, message, issues? } }
 */
export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) {
    const headers: HeadersInit | undefined =
      error.retryAfterSeconds !== undefined
        ? { "Retry-After": String(error.retryAfterSeconds) }
        : undefined;

    return NextResponse.json(
      {
        success: false,
        error: { code: error.code, message: error.message },
      },
      { status: error.status, headers },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Los datos proporcionados no son válidos.",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 },
    );
  }

  // Nunca se expone el detalle real del error (stack trace, mensajes de la
  // base de datos, etc.) al cliente; solo se registra en el servidor.
  console.error("[api] Error no controlado:", error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Ocurrió un error inesperado. Intenta de nuevo más tarde.",
      },
    },
    { status: 500 },
  );
}
