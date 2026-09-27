// app/api/admin/deactivate/route.ts

import { type NextRequest } from "next/server";
import { requireAdminGeneral } from "@/lib/auth/session";
import { toggleAdminStatusSchema } from "@/lib/validation/admin-management";
import {
  deactivateAdminRecord,
  getAdminByUserId,
} from "@/lib/admins/queries/admins";
import { ok, toErrorResponse } from "@/lib/http/responses";
import { ApiError } from "@/lib/errors";

/**
 * RF-AUTH-013: solo un ADMINISTRADOR GENERAL puede desactivar a otro
 * administrador (GENERAL o CONTENIDO), nunca a sí mismo. El administrador
 * raíz (isRoot=true) nunca puede desactivarse. `isRoot` nunca se acepta
 * desde el payload y solo se modifica administradores.isActive.
 *
 * Al desactivar se revocan (eliminan) todas las sesiones de Better Auth
 * del administrador objetivo, en la misma transacción que el cambio de
 * isActive (ver deactivateAdminRecord).
 */
export async function POST(request: NextRequest) {
  try {
    const { session } = await requireAdminGeneral();
    const { userId } = toggleAdminStatusSchema.parse(await request.json());

    if (userId === session.user.id) {
      throw ApiError.forbidden(
        "No puedes desactivar tu propia cuenta de administrador.",
        "CANNOT_MODIFY_SELF",
      );
    }

    const target = await getAdminByUserId(userId);
    if (!target) {
      throw ApiError.notFound("El administrador indicado no existe.");
    }

    if (target.isRoot) {
      throw ApiError.forbidden(
        "El administrador raíz no puede ser desactivado.",
        "ROOT_ADMIN_PROTECTED",
      );
    }

    const updated = await deactivateAdminRecord(userId);
    if (!updated) {
      throw ApiError.notFound("El administrador indicado no existe.");
    }

    return ok({
      admin: {
        userId: updated.userId,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
