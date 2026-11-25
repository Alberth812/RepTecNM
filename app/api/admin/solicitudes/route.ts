import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { solicitudes } from "@/lib/db/schema/solicitudes";
import { afiliados } from "@/lib/db/schema/afiliados";
import { eq, desc, isNull, sql } from "drizzle-orm";
import { requireAdminGeneral } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdminGeneral();
    const searchParams = request.nextUrl.searchParams;
    const estado = searchParams.get("estado");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    let condition;
    if (estado === "PENDIENTE") {
      condition = isNull(solicitudes.revisionDecision);
    } else if (estado) {
      condition = eq(solicitudes.revisionDecision, estado as any);
    }

    const [rows, totalRows] = await Promise.all([
      db.select({
        id: solicitudes.id,
        afiliadoId: solicitudes.afiliadoId,
        revisionDecision: solicitudes.revisionDecision,
        revisionObservaciones: solicitudes.revisionObservaciones,
        createdAt: solicitudes.createdAt,
        datos: solicitudes.datos,
        fotografiaArchivoId: solicitudes.fotografiaArchivoId,
        comprobanteArchivoId: solicitudes.comprobanteMembresiaArchivoId,
        membershipStatus: afiliados.membershipStatus,
        folio: afiliados.folio,
      })
      .from(solicitudes)
      .leftJoin(afiliados, eq(solicitudes.afiliadoId, afiliados.userId))
      .where(condition ? condition : undefined)
      .orderBy(desc(solicitudes.createdAt))
      .limit(limit)
      .offset(offset),
      db.select({ count: solicitudes.id })
        .from(solicitudes)
        .where(condition ? condition : undefined),
    ]);

    const data = rows.map((row) => {
      const d = (row.datos ?? {}) as Record<string, unknown>;
      return {
        id: row.id,
        afiliadoId: row.afiliadoId,
        estado: row.revisionDecision || "PENDIENTE",
        observaciones: row.revisionObservaciones,
        fechaSolicitud: row.createdAt,
        folio: row.folio,
        membershipStatus: row.membershipStatus,
        nombres: (d.nombres as string) ?? null,
        apellidoPaterno: (d.apellido_paterno as string) ?? null,
        apellidoMaterno: (d.apellido_materno as string) ?? null,
        correo: (d.correo_electronico as string) ?? null,
        fotografiaArchivoId: row.fotografiaArchivoId,
        comprobanteArchivoId: row.comprobanteArchivoId,
        datos: d,
      };
    });

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: totalRows[0]?.count ?? 0,
        totalPages: Math.ceil((totalRows[0]?.count ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/solicitudes]", error);
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 });
  }
}
