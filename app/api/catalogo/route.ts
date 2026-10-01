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

    const search = sp.get("search") || "";
    const estado = sp.get("estado");
    const tipoPosgradoParam = sp.get("tipoPosgrado");
    const areas = sp.getAll("areaConocimiento");
    const servicios = sp.getAll("tipoServicios");
    const page = parseInt(sp.get("page") || "1");
    const limit = parseInt(sp.get("limit") || "25");
    const random = sp.get("random") !== "false";
    const offset = (page - 1) * limit;

    const conditions: any[] = [
      eq(afiliados.membershipStatus, "ACTIVO"),
      eq(afiliados.autorizaPublicacion, true),
    ];

    if (estado) conditions.push(eq(afiliados.estadoResidencia, estado));

    if (tipoPosgradoParam) {
      const tipos = tipoPosgradoParam.split(",").map((t) => t.toUpperCase());
      const rows = await db.select({ userId: posgrados.afiliadoId }).from(posgrados).where(inArray(posgrados.tipoPosgrado, tipos as any));
      const ids = [...new Set(rows.map((r) => r.userId))];
      conditions.push(ids.length > 0 ? inArray(afiliados.userId, ids) : sql`1 = 0`);
    }

    if (areas.length > 0) {
      const arr = sql.raw(`ARRAY[${areas.map((a) => `'${a.replace(/'/g, "''")}'`).join(",")}]::text[]`);
      conditions.push(sql`${afiliados.areaConocimiento} && ${arr}`);
    }

    if (servicios.length > 0) {
      const arr = sql.raw(`ARRAY[${servicios.map((s) => `'${s.replace(/'/g, "''")}'`).join(",")}]::text[]`);
      conditions.push(sql`${afiliados.tipoServicios} && ${arr}`);
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

    // ✅ CORRECCIÓN: No reasignar 'let query', usar variables encadenadas
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
      })
      .from(afiliados)
      .innerJoin(users, eq(afiliados.userId, users.id))
      .where(where);

    const orderedQuery = random && !hasFilters 
      ? baseQuery.orderBy(sql`RANDOM()`) 
      : baseQuery.orderBy(desc(afiliados.nombres));

    const resultados = await orderedQuery.limit(limit).offset(offset);

    const ids = resultados.map((r) => r.userId);
    const proyectosMap = new Map<string, any[]>();
    if (ids.length > 0) {
      const proys = await db.select().from(proyectosRelevantes).where(inArray(proyectosRelevantes.afiliadoId, ids));
      proys.forEach((p) => {
        if (!proyectosMap.has(p.afiliadoId)) proyectosMap.set(p.afiliadoId, []);
        proyectosMap.get(p.afiliadoId)!.push(p);
      });
    }

    const data = resultados.map((a) => ({
      ...a,
      nombreCompleto: `${a.nombres} ${a.apellidoPaterno} ${a.apellidoMaterno}`.trim(),
      proyectosRelevantes: proyectosMap.get(a.userId) || [],
    }));

    const raw = await db.execute(sql`
      SELECT
        (SELECT COALESCE(array_agg(DISTINCT v ORDER BY v), '{}'::text[]) FROM afiliados, unnest(area_conocimiento) AS v WHERE membership_status='ACTIVO' AND autoriza_publicacion=true AND v IS NOT NULL AND v!='') AS areas,
        (SELECT COALESCE(array_agg(DISTINCT v ORDER BY v), '{}'::text[]) FROM afiliados, unnest(tipo_servicios) AS v WHERE membership_status='ACTIVO' AND autoriza_publicacion=true AND v IS NOT NULL AND v!='') AS servicios
    `);
    const row = (Array.isArray(raw) ? raw : (raw as any).rows)?.[0] as any || {};

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
