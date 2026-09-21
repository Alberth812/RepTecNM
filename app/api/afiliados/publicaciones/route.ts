// app/api/afiliado/publicaciones/route.ts
import type { NextRequest } from "next/server";

import { handleRouteError, jsonResponse } from "@/lib/api/http";
import { requireAfiliado } from "@/lib/auth/session";
import { ApiError } from "@/lib/errors";
import { listarMisPublicaciones } from "@/lib/publicaciones/service";
import {
  misPublicacionesQuerySchema,
  type MisPublicacionesQuery,
} from "@/lib/validation/publicaciones";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Parámetros permitidos (RF-DOC-008). Cualquier otro se rechaza con 400. */
const PARAMETROS_PERMITIDOS = new Set(["q", "page", "pageSize"]);

/** Longitud máxima del texto de búsqueda. */
const MAX_LONGITUD_Q = 200;

/**
 * Valida el query string:
 *  - solo `q`, `page`, `pageSize` (en particular, nunca un id de propietario);
 *  - sin parámetros repetidos;
 *  - `page` y `pageSize` como enteros positivos (solo dígitos, hasta 9);
 *  - rangos finales a cargo de `misPublicacionesQuerySchema`.
 */
function parseQuery(searchParams: URLSearchParams): MisPublicacionesQuery {
  const raw: Record<string, string> = {};

  for (const key of new Set(searchParams.keys())) {
    if (!PARAMETROS_PERMITIDOS.has(key)) {
      throw ApiError.badRequest(
        "Parámetro no permitido. Solo se aceptan: q, page y pageSize.",
      );
    }

    const values = searchParams.getAll(key);
    if (values.length > 1) {
      throw ApiError.badRequest(
        `El parámetro "${key}" solo puede indicarse una vez.`,
      );
    }

    raw[key] = values[0] ?? "";
  }

  for (const key of ["page", "pageSize"] as const) {
    const value = raw[key];
    if (value !== undefined && !/^\d{1,9}$/.test(value)) {
      throw ApiError.badRequest(
        `El parámetro ${key} debe ser un entero positivo.`,
      );
    }
  }

  const query = misPublicacionesQuerySchema.parse(raw); // ZodError → 400

  if (query.q && query.q.length > MAX_LONGITUD_Q) {
    throw ApiError.badRequest(
      `El parámetro q no puede exceder ${MAX_LONGITUD_Q} caracteres.`,
    );
  }

  return query;
}

/**
 * GET /api/afiliado/publicaciones?q=&page=&pageSize=
 *
 * Solo AFILIADO. El propietario se obtiene de la sesión del servidor; el
 * endpoint no acepta ni interpreta ningún identificador de propietario.
 * No genera URLs firmadas.
 */
export async function GET(request: NextRequest) {
  try {
    const { afiliado } = await requireAfiliado();
    const query = parseQuery(request.nextUrl.searchParams);

    const resultado = await listarMisPublicaciones({
      afiliadoId: afiliado.userId,
      q: query.q,
      page: query.page,
      pageSize: query.pageSize,
    });

    return jsonResponse(resultado);
  } catch (error) {
    return handleRouteError(error, "GET /api/afiliado/publicaciones");
  }
}
