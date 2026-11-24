// app/api/admin/estadisticas/afiliados/route.ts

import { NextRequest, NextResponse } from "next/server";

import {
  and,
  asc,
  count,
  eq,
  gte,
  inArray,
  lte,
  lt,
  sql,
  type SQL,
} from "drizzle-orm";

import { db } from "@/lib/db/client";

import { afiliados, proyectosRelevantes } from "@/lib/db/schema/afiliados";

import {
  afiliadosDashboardFiltersSchema,
  CURRENT_YEAR,
  MEMBERSHIP_STATUS_VALUES,
  membershipStatusLabel,
  type DistributionItem,
  type MembershipStatus,
} from "@/lib/estadisticas/afiliados-dashboard";

import { requireAdminGeneral } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cuenta las apariciones de valores individuales.
 *
 * Los valores vacíos se agrupan como "Sin especificar".
 */
function countScalarValues(
  values: Array<string | null | undefined>,
): DistributionItem[] {
  const counts = new Map<string, number>();

  for (const rawValue of values) {
    const value = rawValue?.trim() || "Sin especificar";

    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "es"));
}

/**
 * Normaliza las opciones "Otro (especifique)" y similares.
 *
 * Por ejemplo:
 * "Otro (especifique)" -> "Otro"
 *
 * No se consideran los textos capturados en los campos
 * areaConocimientoOtro, tipoServiciosOtro, etc.
 */
function normalizeOption(value: string): string {
  const normalized = value.trim();

  if (normalized.toLocaleLowerCase("es-MX").includes("otro")) {
    return "Otro";
  }

  return normalized;
}

/**
 * Cuenta opciones de columnas PostgreSQL text[].
 *
 * Cada afiliado se contabiliza una sola vez por opción,
 * incluso si accidentalmente tiene valores duplicados.
 *
 * Un afiliado puede aparecer en varias opciones diferentes.
 */
function countArrayValues<T>(
  rows: T[],
  getter: (row: T) => string[] | null,
): DistributionItem[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const values = new Set(
      (getter(row) ?? [])
        .filter(
          (value): value is string =>
            typeof value === "string" && value.trim() !== "",
        )
        .map(normalizeOption),
    );

    for (const value of values) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "es"));
}

/**
 * Distribución de estados de membresía.
 *
 * Se incluyen todos los estados aunque tengan cero afiliados.
 */
function buildMembershipDistribution(
  rows: Array<{
    label: MembershipStatus;
    value: number;
  }>,
): DistributionItem[] {
  const counts = new Map(rows.map((row) => [row.label, row.value]));

  return MEMBERSHIP_STATUS_VALUES.map((status) => ({
    label: membershipStatusLabel(status),
    value: counts.get(status) ?? 0,
  }));
}

/**
 * Obtiene las diez ciudades con mayor número de afiliados.
 *
 * Se distingue entre ciudades que tienen el mismo nombre
 * pero pertenecen a estados diferentes.
 */
function buildTopCities(
  rows: Array<{
    ciudadResidencia: string | null;
    estadoResidencia: string | null;
  }>,
) {
  const cities = new Map<
    string,
    {
      label: string;
      estado: string;
      value: number;
    }
  >();

  for (const row of rows) {
    const city = row.ciudadResidencia?.trim();

    if (!city) continue;

    const state = row.estadoResidencia?.trim() || "Sin especificar";

    const key = `${city.toLocaleLowerCase("es-MX")}|${state.toLocaleLowerCase("es-MX")}`;

    const current = cities.get(key);

    if (current) {
      current.value++;
    } else {
      cities.set(key, {
        label: city,
        estado: state,
        value: 1,
      });
    }
  }

  return [...cities.values()]
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "es"))
    .slice(0, 10);
}

/**
 * Extrae el status de un error generado por los guards.
 */
function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof Response) {
    return error.status;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    // Solamente los administradores generales pueden consultar
    // las estadísticas de los afiliados.
    await requireAdminGeneral();

    // ---------------------------------------------------------
    // Validación de filtros
    // ---------------------------------------------------------

    const searchParams = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );

    const parsedFilters =
      afiliadosDashboardFiltersSchema.safeParse(searchParams);

    if (!parsedFilters.success) {
      return NextResponse.json(
        {
          error: "Los filtros proporcionados no son válidos.",
          issues: parsedFilters.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    const filters = parsedFilters.data;

    // ---------------------------------------------------------
    // Construcción dinámica de condiciones SQL
    // ---------------------------------------------------------

    const conditions: SQL[] = [];

    if (filters.anioDesde !== undefined) {
      conditions.push(
        gte(afiliados.createdAt, new Date(Date.UTC(filters.anioDesde, 0, 1))),
      );
    }

    if (filters.anioHasta !== undefined) {
      // Límite superior exclusivo: 1 de enero del siguiente año.
      conditions.push(
        lt(
          afiliados.createdAt,
          new Date(Date.UTC(filters.anioHasta + 1, 0, 1)),
        ),
      );
    }

    if (filters.estadoResidencia) {
      conditions.push(eq(afiliados.estadoResidencia, filters.estadoResidencia));
    }

    if (filters.genero) {
      conditions.push(eq(afiliados.genero, filters.genero));
    }

    if (filters.membershipStatus) {
      conditions.push(eq(afiliados.membershipStatus, filters.membershipStatus));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // ---------------------------------------------------------
    // Consultas SQL
    // ---------------------------------------------------------

    /**
     * Resumen general.
     *
     * Los contadores condicionales se calculan directamente
     * en PostgreSQL para evitar traer todos los registros
     * únicamente para contar.
     */
    const overviewQuery = db
      .select({
        total: count(),

        activos: sql<number>`
          count(*) FILTER (
            WHERE ${afiliados.membershipStatus} = 'ACTIVO'
          )::int
        `,

        inactivos: sql<number>`
          count(*) FILTER (
            WHERE ${afiliados.membershipStatus} = 'INACTIVO'
          )::int
        `,

        suspendidos: sql<number>`
          count(*) FILTER (
            WHERE ${afiliados.membershipStatus} = 'SUSPENDIDO'
          )::int
        `,

        autorizanPublicacion: sql<number>`
          count(*) FILTER (
            WHERE ${afiliados.autorizaPublicacion} = true
          )::int
        `,

        conFotografia: sql<number>`
          count(*) FILTER (
            WHERE ${afiliados.fotografiaArchivoId} IS NOT NULL
          )::int
        `,

        conPerfilProfesional: sql<number>`
          count(*) FILTER (
            WHERE NULLIF(
              BTRIM(${afiliados.perfilProfesional}),
              ''
            ) IS NOT NULL
          )::int
        `,
      })
      .from(afiliados)
      .where(where);

    /**
     * Distribución de membresías agrupada en SQL.
     */
    const membershipQuery = db
      .select({
        label: afiliados.membershipStatus,
        value: count(),
      })
      .from(afiliados)
      .where(where)
      .groupBy(afiliados.membershipStatus)
      .orderBy(asc(afiliados.membershipStatus));

    /**
     * Datos necesarios para las distribuciones multivaluadas.
     *
     * No se consultan nombres, correos, teléfonos ni otra
     * información personal innecesaria para el dashboard.
     */
    const affiliateRowsQuery = db
      .select({
        userId: afiliados.userId,

        genero: afiliados.genero,

        estadoResidencia: afiliados.estadoResidencia,
        ciudadResidencia: afiliados.ciudadResidencia,

        areaConocimiento: afiliados.areaConocimiento,
        tipoServicios: afiliados.tipoServicios,
        sectores: afiliados.sectores,

        modalidadServicios: afiliados.modalidadServicios,
        interesadoEn: afiliados.interesadoEn,
        disponibilidadGeografica: afiliados.disponibilidadGeografica,
      })
      .from(afiliados)
      .where(where);

    /**
     * Altas de afiliados agrupadas por año.
     *
     * Utiliza createdAt y respeta todos los filtros.
     */
    const registrationYearExpression = sql<number>`
      EXTRACT(YEAR FROM ${afiliados.createdAt})::int
    `;

    const registrationsQuery = db
      .select({
        year: registrationYearExpression,
        value: count(),
      })
      .from(afiliados)
      .where(where)
      .groupBy(registrationYearExpression)
      .orderBy(asc(registrationYearExpression));

    const [overviewRows, membershipRows, affiliateRows, registrationRows] =
      await Promise.all([
        overviewQuery,
        membershipQuery,
        affiliateRowsQuery,
        registrationsQuery,
      ]);

    const overview = overviewRows[0];

    const userIds = affiliateRows.map((row) => row.userId);

    // ---------------------------------------------------------
    // Estadísticas de proyectos relevantes
    // ---------------------------------------------------------

    let projectCountRows: Array<{
      afiliadoId: string;
      value: number;
    }> = [];

    let projectYearRows: Array<{
      year: number;
      value: number;
    }> = [];

    if (userIds.length > 0) {
      const [counts, years] = await Promise.all([
        /**
         * Proyectos por afiliado.
         *
         * Permite calcular el total, el promedio y cuántos
         * afiliados tienen por lo menos un proyecto.
         */
        db
          .select({
            afiliadoId: proyectosRelevantes.afiliadoId,
            value: count(),
          })
          .from(proyectosRelevantes)
          .where(inArray(proyectosRelevantes.afiliadoId, userIds))
          .groupBy(proyectosRelevantes.afiliadoId),

        /**
         * Proyectos agrupados por año.
         *
         * Se omiten registros con años fuera del rango
         * permitido para evitar distorsionar la gráfica.
         */
        db
          .select({
            year: proyectosRelevantes.anio,
            value: count(),
          })
          .from(proyectosRelevantes)
          .where(
            and(
              inArray(proyectosRelevantes.afiliadoId, userIds),
              gte(proyectosRelevantes.anio, 1965),
              lte(proyectosRelevantes.anio, CURRENT_YEAR),
            ),
          )
          .groupBy(proyectosRelevantes.anio)
          .orderBy(asc(proyectosRelevantes.anio)),
      ]);

      projectCountRows = counts;
      projectYearRows = years;
    }

    // ---------------------------------------------------------
    // Procesamiento de estadísticas
    // ---------------------------------------------------------

    const total = overview?.total ?? 0;

    const totalProyectos = projectCountRows.reduce(
      (acc, row) => acc + row.value,
      0,
    );

    const afiliadosConProyecto = projectCountRows.length;

    const promedioProyectosPorAfiliado =
      total > 0 ? Math.round((totalProyectos / total) * 10) / 10 : 0;

    const porcentajeActivos =
      total > 0
        ? Math.round(((overview?.activos ?? 0) / total) * 1000) / 10
        : 0;

    const porcentajePublicacion =
      total > 0
        ? Math.round(((overview?.autorizanPublicacion ?? 0) / total) * 1000) /
          10
        : 0;

    const distributions = {
      membershipStatus: buildMembershipDistribution(membershipRows),

      genero: countScalarValues(affiliateRows.map((row) => row.genero)),

      estados: countScalarValues(
        affiliateRows.map((row) => row.estadoResidencia),
      ),

      areasConocimiento: countArrayValues(
        affiliateRows,
        (row) => row.areaConocimiento,
      ),

      tiposServicios: countArrayValues(
        affiliateRows,
        (row) => row.tipoServicios,
      ),

      sectores: countArrayValues(affiliateRows, (row) => row.sectores),

      modalidades: countArrayValues(
        affiliateRows,
        (row) => row.modalidadServicios,
      ),

      interesadosEn: countArrayValues(affiliateRows, (row) => row.interesadoEn),

      disponibilidadGeografica: countArrayValues(
        affiliateRows,
        (row) => row.disponibilidadGeografica,
      ),
    };

    const topCities = buildTopCities(
      affiliateRows.map((row) => ({
        ciudadResidencia: row.ciudadResidencia,
        estadoResidencia: row.estadoResidencia,
      })),
    );

    // ---------------------------------------------------------
    // Respuesta
    // ---------------------------------------------------------

    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),

        filters,

        summary: {
          total,

          activos: overview?.activos ?? 0,
          inactivos: overview?.inactivos ?? 0,
          suspendidos: overview?.suspendidos ?? 0,

          autorizanPublicacion: overview?.autorizanPublicacion ?? 0,

          conFotografia: overview?.conFotografia ?? 0,

          conPerfilProfesional: overview?.conPerfilProfesional ?? 0,

          totalProyectos,
          afiliadosConProyecto,
          promedioProyectosPorAfiliado,

          porcentajeActivos,
          porcentajePublicacion,
        },

        distributions,

        registrationsByYear: registrationRows,

        projectsByYear: projectYearRows,

        topCities,
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    // Permite conservar las respuestas de autorización
    // que eventualmente lancen los guards como Response.
    if (error instanceof Response) {
      return error;
    }

    const status = getErrorStatus(error);

    if (status === 401) {
      return NextResponse.json(
        { error: "No has iniciado sesión." },
        { status: 401 },
      );
    }

    if (status === 403) {
      return NextResponse.json(
        {
          error: "No tienes permisos para consultar estas estadísticas.",
        },
        { status: 403 },
      );
    }

    console.error("[GET /api/admin/estadisticas/afiliados]", error);

    return NextResponse.json(
      {
        error: "Ocurrió un error al obtener las estadísticas de los afiliados.",
      },
      { status: 500 },
    );
  }
}
