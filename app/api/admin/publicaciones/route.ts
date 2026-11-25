import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { publicaciones, users } from "@/lib/db/schema";
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

    const conditions = estado ? [eq(publicaciones.estado, estado as any)] : [];
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalRows] = await Promise.all([
      db.select({
        id: publicaciones.id,
        titulo: publicaciones.titulo,
        resumen: publicaciones.resumen,
        tipo: publicaciones.tipo,
        estado: publicaciones.estado,
        fechaCreacion: publicaciones.fechaCreacion,
        autorNombre: users.name,
        autorEmail: users.email,
      })
      .from(publicaciones)
      .leftJoin(users, eq(publicaciones.autorId, users.id))
      .where(where)
      .orderBy(desc(publicaciones.fechaCreacion))
      .limit(limit)
      .offset(offset),
      db.select({ count: publicaciones.id }).from(publicaciones).where(where),
    ]);

    return NextResponse.json({
      data: rows,
      pagination: { page, limit, total: totalRows.length, totalPages: Math.ceil(totalRows.length / limit) },
    });
  } catch (error) {
    console.error("[GET /api/admin/publicaciones]", error);
    return NextResponse.json({ error: "Error al obtener publicaciones" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminGeneral();
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    await db.delete(publicaciones).where(eq(publicaciones.id, id));
    return NextResponse.json({ message: "Publicación eliminada" });
  } catch (error) {
    console.error("[DELETE /api/admin/publicaciones]", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
