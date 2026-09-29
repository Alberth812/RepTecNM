// Ubicación sugerida: @/lib/instituciones/api/handle-api-error.ts

import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError } from "@/lib/errors";

/**
 * Traduce cualquier error capturado en un route handler a una respuesta
 * HTTP semánticamente correcta, sin filtrar detalles internos de
 * PostgreSQL/Drizzle al cliente.
 */
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.retryAfterSeconds !== undefined
            ? { retryAfterSeconds: error.retryAfterSeconds }
            : {}),
        },
      },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: "Los datos proporcionados no son válidos.",
          issues: error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  // Reemplaza este console.error por el logger del proyecto si existe uno.
  console.error("[instituciones] Error inesperado:", error);

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Ocurrió un error inesperado. Intenta nuevamente.",
      },
    },
    { status: 500 },
  );
}
