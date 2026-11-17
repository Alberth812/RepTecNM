// app/api/publicaciones/[id]/route.ts
import type { NextRequest } from "next/server";

import {
 handleRouteError,
 jsonResponse,
 parseIdParam,
 readJsonBody,
} from "@/lib/api/http";
import { requireAfiliado, requireSession } from "@/lib/auth/session";
import { ApiError } from "@/lib/errors";
import {
 actualizarPublicacion,
 eliminarPublicacion,
 obtenerPublicacionActiva,
} from "@/lib/publicaciones/service";
import { updatePublicacionSchema } from "@/lib/validation/publicaciones";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/* --------------------------------------------------------------------------
 GET /api/publicaciones/:id
 Afiliados y administradores. Solo publicaciones ACTIVO.
 Nunca genera ni devuelve URLs firmadas (eso es /documento).
 -------------------------------------------------------------------------- */
export async function GET(_request: NextRequest, { params }: RouteContext) {
 try {
 await requireSession();
 const id = await parseIdParam(params);

 const publicacion = await obtenerPublicacionActiva(id);
 return jsonResponse(publicacion);
 } catch (error) {
 return handleRouteError(error, "GET /api/publicaciones/[id]");
 }
}

/* --------------------------------------------------------------------------
 PATCH /api/publicaciones/:id
 Solo el afiliado propietario, solo publicaciones ACTIVO.
 Body JSON con los metadatos completos (reemplaza autores y palabras clave).
 -------------------------------------------------------------------------- */

/** Intentos explícitos de cambiar el PDF: se rechazan con un mensaje claro. */
const CAMPOS_DE_DOCUMENTO = ["documento", "documentoArchivoId"] as const;

function rechazarCambioDeDocumento(body: unknown): void {
 if (typeof body !== "object" || body === null || Array.isArray(body)) {
 throw ApiError.badRequest("El cuerpo debe ser un objeto JSON.");
 }

 const presentes = CAMPOS_DE_DOCUMENTO.filter((campo) =>
 Object.prototype.hasOwnProperty.call(body, campo),
 );

 if (presentes.length > 0) {
 throw ApiError.badRequest(
 "El documento PDF no puede sustituirse ni modificarse después de crear la publicación.",
 );
 }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
 try {
 const { afiliado } = await requireAfiliado();
 const id = await parseIdParam(params);

 const body = await readJsonBody(request);
 rechazarCambioDeDocumento(body);

 // Los campos desconocidos (afiliadoId, estado, descargo*, etc.) son
 // descartados por Zod y nunca se usan.
 const input = updatePublicacionSchema.parse(body); // ZodError → 400

 const publicacion = await actualizarPublicacion({
 id,
 afiliadoId: afiliado.userId,
 input,
 });

 return jsonResponse(publicacion);
 } catch (error) {
 return handleRouteError(error, "PATCH /api/publicaciones/[id]");
 }
}

/* --------------------------------------------------------------------------
 DELETE /api/publicaciones/:id
 Solo el afiliado propietario. Hard delete (BD + objeto S3).
 -------------------------------------------------------------------------- */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
 try {
 const { afiliado } = await requireAfiliado();
 const id = await parseIdParam(params);

 await eliminarPublicacion({ id, afiliadoId: afiliado.userId });

 return jsonResponse({ id, eliminada: true });
 } catch (error) {
 return handleRouteError(error, "DELETE /api/publicaciones/[id]");
 }
}
