// app/api/publicaciones/[id]/documento/route.ts
import type { NextRequest } from "next/server";

import { handleRouteError, jsonResponse, parseIdParam } from "@/lib/api/http";
import { requireSession } from "@/lib/auth/session";
import { generarUrlDocumento } from "@/lib/publicaciones/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/publicaciones/:id/documento
 *
 * Único endpoint que emite URLs firmadas del PDF. Requiere sesión (afiliado o
 * administrador) y que la publicación exista y esté ACTIVO. La respuesta se
 * marca `no-store` (vía jsonResponse) porque contiene una credencial temporal.
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireSession();
    const id = await parseIdParam(params);

    const documento = await generarUrlDocumento(id);
    return jsonResponse(documento);
  } catch (error) {
    return handleRouteError(error, "GET /api/publicaciones/[id]/documento");
  }
}
