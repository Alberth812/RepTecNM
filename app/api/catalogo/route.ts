/**
 * API del Catálogo Profesional de Afiliados
 * GET /api/catalogo - Obtener lista de afiliados ACTIVOS con filtros avanzados
 * 
 * Filtros disponibles:
 * - search: Búsqueda libre por nombre, apellido o perfil profesional
 * - estado: Estado de residencia (texto exacto)
 * - tipoPosgrado: Tipo de posgrado (maestria, doctorado) - consulta tabla relacionada
 * - areaConocimiento: Áreas de conocimiento (array, superposición)
 * - tipoServicios: Tipos de servicios profesionales (array, superposición)
 * - page: Número de página (default: 1)
 * - limit: Resultados por página (default: 25)
 * - random: Orden aleatorio si no hay filtros activos (default: true)
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
    const searchParams = request.nextUrl.searchParams;
    
    // 1. Obtener parámetros de filtro de la URL
    const search = searchParams.get("search") || "";
    const estado = searchParams.get("estado");
    const tipoPosgradoParam = searchParams.get("tipoPosgrado"); // "maestria,doctorado" o "maestria"
    const areas = searchParams.getAll("areaConocimiento");
    const servicios = searchParams.getAll("tipoServicios");
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const random = searchParams.get("random") !== "false";
    const offset = (page - 1) * limit;

    // 2. Condiciones base obligatorias: solo afiliados ACTIVOS que autoricen publicación
    const baseConditions = [
      eq(afiliados.membershipStatus, "ACTIVO"),
      eq(afiliados.autorizaPublicacion, true),
    ];

    // 3. Filtro por Estado de Residencia (campo directo en tabla afiliados)
    if (estado) {
      baseConditions.push(eq(afiliados.estadoResidencia, estado));
    }

    // 4. Filtro por Tipo de Posgrado (Relación 1:N con tabla posgrados)
    // Necesitamos consultar la tabla posgrados para encontrar afiliados con ese tipo
    if (tipoPosgradoParam) {
      const tiposSolicitados = tipoPosgradoParam.split(",").map(t => t.toUpperCase());
      const afiliadosConPosgrado = await db
        .select({ userId: posgrados.afiliadoId })
        .from(posgrados)
        .where(inArray(posgrados.tipoPosgrado, tiposSolicitados as any));
      
      const userIds = [...new Set(afiliadosConPosgrado.map(r => r.userId))];
      if (userIds.length > 0) {
        baseConditions.push(inArray(afiliados.userId, userIds));
      } else {
        baseConditions.push(sql`1 = 0`); // Fuerza resultado vacío si nadie cumple
      }
    }

    // 5. Filtro por Áreas de Conocimiento (Superposición de arreglos en PostgreSQL)
    // Usa el operador && de PostgreSQL para encontrar coincidencias en arrays
    if (areas.length > 0) {
      const areaArray = sql.raw(`ARRAY[${areas.map(a => `'${a.replace(/'/g, "''")}'`).join(',')}]::text[]`);
      baseConditions.push(sql`${afiliados.areaConocimiento} && ${areaArray}`);
    }

    // 6. Filtro por Tipos de Servicios (Superposición de arreglos en PostgreSQL)
    if (servicios.length > 0) {
      const servicioArray = sql.raw(`ARRAY[${servicios.map(s => `'${s.replace(/'/g, "''")}'`).join(',')}]::text[]`);
      baseConditions.push(sql`${afiliados.tipoServicios} && ${servicioArray}`);
    }

    // 7. Filtro por Búsqueda Libre (nombre, apellido, perfil profesional, palabras clave)
    let searchCondition = undefined;
    if (search) {
      const searchTerm = `%${search}%`;
      searchCondition = or(
        ilike(afiliados.nombres, searchTerm),
        ilike(afiliados.apellidoPaterno, searchTerm),
        ilike(afiliados.apellidoMaterno, searchTerm),
        ilike(afiliados.perfilProfesional, searchTerm),
        sql`${afiliados.palabrasClave}::text ILIKE ${searchTerm}`
      );
    }

    // 8. Evaluar si hay filtros activos para determinar el ordenamiento
    const hasActiveFilters = Boolean(
      search || estado || tipoPosgradoParam || areas.length > 0 || servicios.length > 0
    );

    // 9. Obtener total de resultados para la paginación
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(afiliados)
      .innerJoin(users, eq(afiliados.userId, users.id))
      .where(searchCondition ? and(...baseConditions, searchCondition) : and(...baseConditions));
    
    const total = parseInt(countResult[0].count.toString());

    // 10. Construir la consulta principal con los campos necesarios
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
      .where(searchCondition ? and(...baseConditions, searchCondition) : and(...baseConditions));

    // 11. Lógica de ordenamiento: aleatorio si no hay filtros, alfabético si los hay
    if (random && !hasActiveFilters) {
      query = query.orderBy(sql`RANDOM()`);
    } else {
      query = query.orderBy(desc(afiliados.nombres));
    }

    query = query.limit(limit).offset(offset);
    const resultados = await query;

    // 12. Obtener proyectos relevantes para los afiliados retornados
    const afiliadosIds = resultados.map(r => r.userId);
    let proyectosMap = new Map();
    if (afiliadosIds.length > 0) {
      const proyectos = await db
        .select()
        .from(proyectosRelevantes)
        .where(inArray(proyectosRelevantes.afiliadoId, afiliadosIds));
      
      proyectos.forEach(p => {
        if (!proyectosMap.has(p.afiliadoId)) {
          proyectosMap.set(p.afiliadoId, []);
        }
        proyectosMap.get(p.afiliadoId).push(p);
      });
    }

    // 13. Formatear respuesta final con nombre completo y proyectos
    const afiliadosConProyectos = resultados.map(afiliado => ({
      ...afiliado,
      nombreCompleto: `${afiliado.nombres} ${afiliado.apellidoPaterno} ${afiliado.apellidoMaterno}`.trim(),
      proyectosRelevantes: proyectosMap.get(afiliado.userId) || [],
    }));

    // 14. Retornar respuesta exitosa con paginación
    return ok({
      data: afiliadosConProyectos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error en GET /api/catalogo:", error);
    return toErrorResponse(error);
  }
}
