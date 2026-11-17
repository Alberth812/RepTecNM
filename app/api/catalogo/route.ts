/**
 * API del Catálogo Profesional de Afiliados
 * GET /api/catalogo - Obtener lista de afiliados ACTIVOS con filtros avanzados
 */
import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { afiliados, proyectosRelevantes } from "@/lib/db/schema/afiliados";
import { users } from "@/lib/db/schema/auth-schema";
import { archivos } from "@/lib/db/schema/archivo";
import { posgrados } from "@/lib/db/schema/formacion-academica";
import { eq, ilike, or, and, sql, inArray, desc, ne, type SQL } from "drizzle-orm";
import { ok, toErrorResponse } from "@/lib/http/responses";
import { getCurrentSession } from "@/lib/auth/session";
import { getFileUrl } from "@/lib/storage";

export async function GET(request: NextRequest) {
 try {
 const sp = request.nextUrl.searchParams;

 const search = sp.get("search") || "";
 const estado = sp.get("estado");
 const tipoPosgradoParam = sp.get("tipoPosgrado");
 const areas = sp.getAll("areaConocimiento");
 const servicios = sp.getAll("tipoServicios");
 const page = parseInt(sp.get("page") || "1");
 const limit = parseInt(sp.get("limit") || "25");
 const random = sp.get("random") !== "false";
 const offset = (page - 1) * limit;

 // 1. Obtener usuario actual para excluirlo del catálogo
 const session = await getCurrentSession();
 const currentUserId = session?.user?.id;

 const conditions: SQL<unknown>[] = [
 eq(afiliados.membershipStatus, "ACTIVO"),
 eq(afiliados.autorizaPublicacion, true),
 ];

 // 2. Excluir al usuario actual si está autenticado
 if (currentUserId) {
 conditions.push(ne(afiliados.userId, currentUserId));
 }

 if (estado) conditions.push(eq(afiliados.estadoResidencia, estado));

 if (tipoPosgradoParam) {
 const tipos = tipoPosgradoParam.split(",").map((t) => t.toUpperCase());
 const rows = await db.select({ userId: posgrados.afiliadoId }).from(posgrados).where(inArray(posgrados.tipoPosgrado, tipos));
 const ids = [...new Set(rows.map((r) => r.userId))];
 conditions.push(ids.length > 0 ? inArray(afiliados.userId, ids) : sql`1 = 0`);
 }

 if (areas.length > 0) {
 conditions.push(sql`${afiliados.areaConocimiento} && ${areas}::text[]`);
 }

 if (servicios.length > 0) {
 conditions.push(sql`${afiliados.tipoServicios} && ${servicios}::text[]`);
 }

 let searchCond = undefined;
 if (search) {
 const t = `%${search}%`;
 searchCond = or(
 ilike(afiliados.nombres, t),
 ilike(afiliados.apellidoPaterno, t),
 ilike(afiliados.apellidoMaterno, t),
 ilike(afiliados.perfilProfesional, t),
 sql`${afiliados.palabrasClave}::text ILIKE ${t}`
 );
 }

 const where = searchCond ? and(...conditions, searchCond) : and(...conditions);
 const hasFilters = Boolean(search || estado || tipoPosgradoParam || areas.length || servicios.length);

 const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(afiliados).innerJoin(users, eq(afiliados.userId, users.id)).where(where);
 const total = Number(count);

 // 3. Consulta principal con LEFT JOIN a archivos para obtener el objectKey de la foto
 const baseQuery = db
 .select({
 userId: afiliados.userId,
 nombres: afiliados.nombres,
 apellidoPaterno: afiliados.apellidoPaterno,
 apellidoMaterno: afiliados.apellidoMaterno,
 estadoResidencia: afiliados.estadoResidencia,
 ciudadResidencia: afiliados.ciudadResidencia,
 areaConocimiento: afiliados.areaConocimiento,
 perfilProfesional: afiliados.perfilProfesional,
 palabrasClave: afiliados.palabrasClave,
 tipoServicios: afiliados.tipoServicios,
 descripcionServicios: afiliados.descripcionServicios,
 fotoObjectKey: archivos.objectKey,
 })
 .from(afiliados)
 .innerJoin(users, eq(afiliados.userId, users.id))
 .leftJoin(archivos, eq(afiliados.fotografiaArchivoId, archivos.id))
 .where(where);

 const orderedQuery = random && !hasFilters 
 ? baseQuery.orderBy(sql`RANDOM()`) 
 : baseQuery.orderBy(desc(afiliados.nombres));

 const resultados = await orderedQuery.limit(limit).offset(offset);

 const ids = resultados.map((r) => r.userId);
 const proyectosMap = new Map<string, Record<string, unknown>[]>();
 if (ids.length > 0) {
 const proys = await db.select().from(proyectosRelevantes).where(inArray(proyectosRelevantes.afiliadoId, ids));
 proys.forEach((p) => {
 if (!proyectosMap.has(p.afiliadoId)) proyectosMap.set(p.afiliadoId, []);
 proyectosMap.get(p.afiliadoId)!.push(p);
 });
 }

 // 4. Mapear resultados y generar la URL de la foto de forma asíncrona
 const data = await Promise.all(resultados.map(async (a) => {
 let fotografiaUrl: string | undefined = undefined;
 if (a.fotoObjectKey) {
 try {
 // Usamos "afiliados" como target del bucket, igual que en el registro
 fotografiaUrl = await getFileUrl("afiliados", a.fotoObjectKey);
 } catch (e) {
 console.error("Error generando URL de foto para", a.userId, e);
 }
 }

 return {
 userId: a.userId,
 nombres: a.nombres,
 apellidoPaterno: a.apellidoPaterno,
 apellidoMaterno: a.apellidoMaterno,
 estadoResidencia: a.estadoResidencia,
 ciudadResidencia: a.ciudadResidencia,
 areaConocimiento: a.areaConocimiento,
 perfilProfesional: a.perfilProfesional,
 palabrasClave: a.palabrasClave,
 tipoServicios: a.tipoServicios,
 descripcionServicios: a.descripcionServicios,
 nombreCompleto: `${a.nombres} ${a.apellidoPaterno} ${a.apellidoMaterno}`.trim(),
 proyectosRelevantes: proyectosMap.get(a.userId) || [],
 fotografiaUrl,
 };
 }));

 const raw = await db.execute(sql`
 SELECT
 (SELECT COALESCE(array_agg(DISTINCT v ORDER BY v), '{}'::text[]) FROM afiliados, unnest(area_conocimiento) AS v WHERE membership_status='ACTIVO' AND autoriza_publicacion=true AND v IS NOT NULL AND v!='') AS areas,
 (SELECT COALESCE(array_agg(DISTINCT v ORDER BY v), '{}'::text[]) FROM afiliados, unnest(tipo_servicios) AS v WHERE membership_status='ACTIVO' AND autoriza_publicacion=true AND v IS NOT NULL AND v!='') AS servicios
 `);
 const row = (Array.isArray(raw) ? raw : (raw as { rows: unknown[] }).rows)?.[0] as Record<string, unknown> || {};

 return ok({
 data,
 pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
 facets: { areas: row.areas || [], servicios: row.servicios || [] },
 });
 } catch (error) {
 console.error("Error en GET /api/catalogo:", error);
 return toErrorResponse(error);
 }
}
