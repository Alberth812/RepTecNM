import { type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdministrador } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema/auth-schema";
import { administradores } from "@/lib/db/schema/administradores";
import { ok, toErrorResponse } from "@/lib/http/responses";
import { ApiError } from "@/lib/errors";
import { ADMIN_SUBTYPES } from "@/lib/constants";

/**
 * RF-AUTH-014:
 *  - CONTENIDO puede ser eliminado por cualquier GENERAL.
 *  - GENERAL solo puede ser eliminado por el administrador raíz.
 *  - Nadie puede eliminar su propia cuenta.
 *  - El administrador raíz nunca se elimina desde la API (su recuperación es
 *    un procedimiento fuera de la aplicación, ver scripts/recover-root-admin.ts).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ adminId: string }> },
) {
  try {
    const { session, profile } = await requireAdministrador();
    const { adminId } = await params;

    if (profile.subtype !== ADMIN_SUBTYPES.GENERAL) {
      throw ApiError.forbidden(
        "Solo administradores de tipo GENERAL pueden eliminar cuentas de administrador.",
      );
    }

    if (adminId === session.user.id) {
      throw ApiError.forbidden(
        "Un administrador no puede eliminar su propia cuenta.",
      );
    }

    const [target] = await db
      .select()
      .from(administradores)
      .where(eq(administradores.userId, adminId))
      .limit(1);
    if (!target) {
      throw ApiError.notFound("No se encontró esa cuenta de administrador.");
    }

    if (target.isRoot) {
      throw ApiError.forbidden(
        "El administrador raíz no puede eliminarse desde la API; su recuperación es un procedimiento fuera de la aplicación.",
      );
    }

    if (target.subtype === ADMIN_SUBTYPES.GENERAL && !profile.isRoot) {
      throw ApiError.forbidden(
        "Solo el administrador raíz puede eliminar administradores de tipo GENERAL.",
      );
    }

    // Cascada onDelete en administradores/sesiones/accounts (ver auth-schema.ts).
    await db.delete(users).where(eq(users.id, adminId));

    return ok({ message: "Cuenta de administrador eliminada correctamente." });
  } catch (error) {
    return toErrorResponse(error);
  }
}
