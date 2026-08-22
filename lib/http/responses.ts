import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAPIError } from "better-auth/api";
import { ApiError } from "@/lib/errors";

export function ok(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, { status: init?.status ?? 200 });
}

/**
 * Traduce cualquier error lanzado dentro de un handler a una respuesta JSON
 * consistente: `ApiError` propias, `ZodError` de validación, `APIError` de
 * better-auth (cuando llamamos auth.api.* directamente), y cualquier otro
 * error inesperado como 500 genérico (sin filtrar detalles internos).
 */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    const headers = new Headers();
    if (error.retryAfterSeconds !== undefined) {
      headers.set("Retry-After", String(Math.ceil(error.retryAfterSeconds)));
    }
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status, headers },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: error.issues[0]?.message ?? "Datos inválidos",
          issues: error.issues,
        },
      },
      { status: 400 },
    );
  }

  if (isAPIError(error)) {
    // better-auth's APIError expone `status` (nombre tipo "BAD_REQUEST"),
    // `statusCode` (número HTTP) y `body` (payload JSON del error).
    const status =
      typeof error.statusCode === "number" ? error.statusCode : 400;
    const code =
      (error.body as { code?: string } | undefined)?.code ??
      error.status ??
      "AUTH_ERROR";
    return NextResponse.json(
      { error: { code, message: error.message } },
      { status },
    );
  }

  console.error("Unhandled error in API route:", error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Ocurrió un error inesperado.",
      },
    },
    { status: 500 },
  );
}
