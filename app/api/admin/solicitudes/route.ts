import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { solicitudes, afiliados } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
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

    const conditions = estado ? [eq(solicitudes.estado, estado as any)] : [];
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalRows] = await Promise.all([
      db.select({
        id: solicitudes.id,
        estado: solicitudes.estado,
        fechaSolicitud: solicitudes.fechaSolicitud,
        folio: afiliados.folio,
        nombres: afiliados.nombres,
        apellidoPaterno: afiliados.apellidoPaterno,
        apellidoMaterno: afiliados.apellidoMaterno,
        correo: afiliados.correo,
      })
      .from(solicitudes)
      .leftJoin(afiliados, eq(solicitudes.afiliadoId, afiliados.userId))
      .where(where)
      .orderBy(desc(solicitudes.fechaSolicitud))
      .limit(limit)
      .offset(offset),
      db.select({ count: solicitudes.id }).from(solicitudes).where(where),
    ]);

    return NextResponse.json({
      data: rows,
      pagination: { page, limit, total: totalRows.length, totalPages: Math.ceil(totalRows.length / limit) },
    });
  } catch (error) {
    console.error("[GET /api/admin/solicitudes]", error);
    return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 });
  }
}
