// app/api/publicaciones/route.ts
import type { NextRequest } from "next/server";

import {
 handleRouteError,
 jsonResponse,
 payloadTooLarge,
 unsupportedMediaType,
} from "@/lib/api/http";
import { requireAfiliado, requireSession } from "@/lib/auth/session";
import { ApiError } from "@/lib/errors";
import { buscarPublicaciones } from "@/lib/publicaciones/busqueda";
import { validarArchivoPdf } from "@/lib/publicaciones/publicacion-pdf";
import { crearPublicacion } from "@/lib/publicaciones/service";
import {
 createPublicacionSchema,
 MAX_PDF_SIZE_BYTES,
} from "@/lib/validation/publicaciones";
import {
 buscarPublicacionesQuerySchema,
 type BuscarPublicacionesQuery,
} from "@/lib/validation/publicaciones-busqueda";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PDF (5 MB) + margen para los campos de texto y el overhead del multipart. */
const MAX_MULTIPART_BODY_BYTES = MAX_PDF_SIZE_BYTES + 512 * 1024;

/**
 * POST /api/publicaciones
 *
 * Content-Type: multipart/form-data con dos campos:
 * - `documento`: archivo PDF (máx. 5 MB).
 * - `metadata`: JSON (string) con los metadatos, incluido `aceptaDescargo: true`.
 *
 * El propietario se obtiene exclusivamente de la sesión.
 */
export async function POST(request: NextRequest) {
 try {
 // 1. Autorización: solo afiliados. El propietario sale de la sesión.
 const { afiliado } = await requireAfiliado();

 // 2. Content-Type y tamaño declarado (antes de leer el body completo).
 const contentType = request.headers.get("content-type") ?? "";
 if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
 throw unsupportedMediaType(
 'El Content-Type debe ser "multipart/form-data".',
 );
 }

 const contentLength = request.headers.get("content-length");
 if (contentLength && Number(contentLength) > MAX_MULTIPART_BODY_BYTES) {
 throw payloadTooLarge("La solicitud excede el tamaño máximo permitido.");
 }

 let formData: FormData;
 try {
 formData = await request.formData();
 } catch {
 throw ApiError.badRequest("No se pudo leer el formulario multipart.");
 }

 // 3. Metadatos.
 const rawMetadata = formData.get("metadata");
 if (typeof rawMetadata !== "string" || rawMetadata.trim() === "") {
 throw ApiError.badRequest(
 'Falta el campo "metadata" con los metadatos en formato JSON.',
 );
 }

 let metadataJson: unknown;
 try {
 metadataJson = JSON.parse(rawMetadata);
 } catch {
 throw ApiError.badRequest('El campo "metadata" debe ser un JSON válido.');
 }

 const input = createPublicacionSchema.parse(metadataJson); // ZodError → 400

 // 4. Archivo: extensión, MIME, tamaño real y magic bytes.
 const file = await validarArchivoPdf(formData.get("documento"));

 // 5. Subida + transacción con compensación.
 const publicacion = await crearPublicacion({
 afiliadoId: afiliado.userId,
 input,
 file,
 });

 return jsonResponse(publicacion, {
 status: 201,
 headers: { Location: `/api/publicaciones/${publicacion.id}` },
 });
 } catch (error) {
 return handleRouteError(error, "POST /api/publicaciones");
 }
}

/* ==========================================================================
 GET /api/publicaciones — búsqueda y filtrado general (RF-DOC-004)
 ========================================================================== */

/** Parámetros permitidos. Cualquier otro se rechaza con 400. */
const PARAMETROS_PERMITIDOS = new Set([
 "q",
 "tipo",
 "anio",
 "anioDesde",
 "anioHasta",
 "autor",
 "keyword",
 "isbn",
 "issn",
 "doi",
 "page",
 "pageSize",
]);

const PARAMETROS_DE_PAGINACION = ["page", "pageSize"] as const;

/**
 * Valida el query string:
 * - solo los parámetros permitidos, sin repetirse;
 * - `q` y los filtros vacíos o con solo espacios se tratan como ausentes;
 * - `page` y `pageSize` deben ser enteros positivos (solo dígitos, hasta 9);
 * - reglas de contenido y de combinación a cargo de `buscarPublicacionesQuerySchema`.
 */
function parseQuery(searchParams: URLSearchParams): BuscarPublicacionesQuery {
 const raw: Record<string, string> = {};

 for (const key of new Set(searchParams.keys())) {
 if (!PARAMETROS_PERMITIDOS.has(key)) {
 throw ApiError.badRequest(
 "Parámetro no permitido. Solo se aceptan: q, tipo, anio, anioDesde, anioHasta, autor, keyword, isbn, issn, doi, page y pageSize.",
 );
 }

 const values = searchParams.getAll(key);
 if (values.length > 1) {
 throw ApiError.badRequest(
 `El parámetro "${key}" solo puede indicarse una vez.`,
 );
 }

 const value = values[0] ?? "";
 const esPaginacion = (
 PARAMETROS_DE_PAGINACION as readonly string[]
 ).includes(key);

 // Un filtro en blanco equivale a no enviarlo; una paginación en blanco es inválida.
 if (value.trim() === "" && !esPaginacion) continue;

 raw[key] = value;
 }

 for (const key of PARAMETROS_DE_PAGINACION) {
 const value = raw[key];
 if (value !== undefined && !/^\d{1,9}$/.test(value)) {
 throw ApiError.badRequest(
 `El parámetro ${key} debe ser un entero positivo.`,
 );
 }
 }

 return buscarPublicacionesQuerySchema.parse(raw); // ZodError → 400
}

/**
 * GET /api/publicaciones?q=&tipo=&anio=&anioDesde=&anioHasta=&autor=&keyword=&isbn=&issn=&doi=&page=&pageSize=
 *
 * Afiliados y administradores. Solo publicaciones ACTIVO. Nunca genera ni
 * devuelve URLs firmadas ni `documentoArchivoId`.
 */
export async function GET(request: NextRequest) {
 try {
 await requireSession();
 const query = parseQuery(request.nextUrl.searchParams);

 const resultado = await buscarPublicaciones(query);
 return jsonResponse(resultado);
 } catch (error) {
 return handleRouteError(error, "GET /api/publicaciones");
 }
}
