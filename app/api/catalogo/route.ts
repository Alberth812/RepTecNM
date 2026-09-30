/**
 * API del Catálogo Profesional de Afiliados
 * GET /api/catalogo - Lista afiliados ACTIVOS con filtros y facetas dinámicas
 *
 * Filtros: search, estado, tipoPosgrado, areaConocimiento[], tipoServicios[]
 * Paginación: page (default 1), limit (default 25)
 */
import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { afiliados, proyectosRelevantes } from "@/lib/db/schema/afiliados";
import { users } from "@/lib/db/schema/auth-schema";
import { posgrados } from "@/lib/db/schema/formacion-academica";
import { eq, ilike, or, and, sql, inArray, desc } from "drizzle-orm";
import { ok, toErrorResponse } from "@/lib/http/responses";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    // 1. Parámetros de filtro
    const search = sp.get("search") || "";
    const estado = sp.get("estado");
    const tipoPosgradoParam = sp.get("tipoPosgrado");
    const areas = sp.getAll("areaConocimiento");
    const servicios = sp.getAll("tipoServicios");
    const page = parseInt(sp.get("page") || "1");
    const limit = parseInt(sp.get("limit") || "25");
    const random = sp.get("random") !== "false";
    const offset = (page - 1) * limit;

    // 2. Condiciones base: solo ACTIVO + autoriza publicación
    const conditions: any[] = [
      eq(afiliados.membershipStatus, "ACTIVO"),
      eq(afiliados.autorizaPublicacion, true),
    ];

    // 3. Filtro por Estado
    if (estado) conditions.push(eq(afiliados.estadoResidencia, estado));

    // 4. Filtro por Tipo de Posgrado (relación 1:N con tabla posgrados)
    if (tipoPosgradoParam) {
      const tipos = tipoPosgradoParam.split(",").map((t) => t.toUpperCase());
      const rows = await db
        .select({ userId: posgrados.afiliadoId })
        .from(posgrados)
        .where(inArray(posgrados.tipoPosgrado, tipos as any));
      const ids = [...new Set(rows.map((r) => r.userId))];
      conditions.push(ids.length > 0 ? inArray(afiliados.userId, ids) : sql`1 = 0`);
    }

    // 5. Filtro por Áreas (operador && de PostgreSQL para arrays)
    if (areas.length > 0) {
      const arr = sql.raw(
        `ARRAY[${areas.map((a) => `'${a.replace(/'/g, "''")}'`).join(",")}]::text[]`
      );
      conditions.push(sql`${afiliados.areaConocimiento} && ${arr}`);
    }

    // 6. Filtro por Servicios (operador && de PostgreSQL para arrays)
    if (servicios.length > 0) {
      const arr = sql.raw(
        `ARRAY[${servicios.map((s) => `'${s.replace(/'/g, "''")}'`).join(",")}]::text[]`
      );
      conditions.push(sql`${afiliados.tipoServicios} && ${arr}`);
    }

    // 7. Búsqueda libre (nombre, apellido, perfil, palabras clave)
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

    // 8. Total para paginación
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(afiliados)
      .innerJoin(users, eq(afiliados.userId, users.id))
      .where(where);
    const total = Number(count);

    // 9. Consulta principal
    let query = db
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
      })
      .from(afiliados)
      .innerJoin(users, eq(afiliados.userId, users.id))
      .where(where);

    query = random && !hasFilters ? query.orderBy(sql`RANDOM()`) : query.orderBy(desc(afiliados.nombres));
    query = query.limit(limit).offset(offset);
    const resultados = await query;

    // 10. Proyectos relevantes de los afiliados encontrados
    const ids = resultados.map((r) => r.userId);
    const proyectosMap = new Map<string, any[]>();
    if (ids.length > 0) {
      const proys = await db.select().from(proyectosRelevantes).where(inArray(proyectosRelevantes.afiliadoId, ids));
      proys.forEach((p) => {
        if (!proyectosMap.has(p.afiliadoId)) proyectosMap.set(p.afiliadoId, []);
        proyectosMap.get(p.afiliadoId)!.push(p);
      });
    }

    // 11. Formatear afiliados con nombre completo
    const data = resultados.map((a) => ({
      ...a,
      nombreCompleto: `${a.nombres} ${a.apellidoPaterno} ${a.apellidoMaterno}`.trim(),
      proyectosRelevantes: proyectosMap.get(a.userId) || [],
    }));

    // 12. FACETAS DINÁMICAS: extrae valores únicos reales de la BD
    // Así los filtros siempre muestran solo opciones que existen de verdad
    const raw = await db.execute(sql`
      SELECT
        (SELECT COALESCE(array_agg(DISTINCT v ORDER BY v), '{}'::text[])
         FROM afiliados, unnest(area_conocimiento) AS v
         WHERE membership_status='ACTIVO' AND autoriza_publicacion=true
           AND v IS NOT NULL AND v!='') AS areas,
        (SELECT COALESCE(array_agg(DISTINCT v ORDER BY v), '{}'::text[])
         FROM afiliados, unnest(tipo_servicios) AS v
         WHERE membership_status='ACTIVO' AND autoriza_publicacion=true
           AND v IS NOT NULL AND v!='') AS servicios
    `);
    const row = (Array.isArray(raw) ? raw : (raw as any).rows)?.[0] as any || {};

    // 13. Respuesta con datos + paginación + facetas
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
