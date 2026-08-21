import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { requireAdministrador, errorToResponse } from "@/lib/permissions";

/**
 * DELETE /api/admins/[id] — RF-AUTH-014.
 *
 * Reglas:
 *  - Un administrador CONTENIDO puede ser eliminado por cualquier GENERAL.
 *  - Un administrador GENERAL solo puede ser eliminado por el raíz (is_root).
 *  - Nadie puede eliminar su propia cuenta.
 *  - El administrador raíz nunca se elimina desde la aplicación; su
 *    recuperación es un procedimiento fuera de la app (script/SQL con
 *    acceso a infraestructura).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { session, admin: requester } = await requireAdministrador();
    const { id: targetId } = await params;

    if (targetId === session.user.id) {
      return NextResponse.json({ error: "No puedes eliminar tu propia cuenta." }, { status: 400 });
    }

    const target = await db.query.administradores.findFirst({ where: { accountId: targetId } });
    if (!target) {
      return NextResponse.json({ error: "No se encontró esa cuenta de administrador." }, { status: 404 });
    }

    if (target.isRoot) {
      return NextResponse.json(
        { error: "El administrador raíz no puede eliminarse desde la aplicación." },
        { status: 403 },
      );
    }

    if (target.subtype === "GENERAL" && !requester.isRoot) {
      return NextResponse.json(
        { error: "Solo el administrador raíz puede eliminar a un administrador GENERAL." },
        { status: 403 },
      );
    }

    if (target.subtype === "CONTENIDO" && requester.subtype !== "GENERAL") {
      return NextResponse.json(
        { error: "Solo un administrador GENERAL puede eliminar administradores de CONTENIDO." },
        { status: 403 },
      );
    }

    // `administradores` cae en cascada al borrar `user` (FK onDelete: cascade).
    await db.delete(userTable).where(eq(userTable.id, targetId));

    return NextResponse.json({ message: "Cuenta de administrador eliminada." });
  } catch (err) {
    return errorToResponse(err);
  }
}
