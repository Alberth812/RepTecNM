import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { administradores } from "@/lib/db/schema/administradores";
import { afiliados } from "@/lib/db/schema/afiliados";
import { ok, toErrorResponse } from "@/lib/http/responses";
import { ROLES } from "@/lib/constants";

/**
 * No es parte explícita de RF-AUTH, pero es un endpoint natural para que
 * cualquier cliente obtenga, junto con la sesión, los datos de dominio que
 * NO viven en la tabla `users` de better-auth (subtipo/is_root para
 * administradores, membership_status para afiliados).
 */
export async function GET() {
  try {
    const session = await requireSession();

    if (session.user.role === ROLES.ADMINISTRADOR) {
      const [profile] = await db
        .select({
          subtype: administradores.subtype,
          isRoot: administradores.isRoot,
        })
        .from(administradores)
        .where(eq(administradores.userId, session.user.id))
        .limit(1);

      return ok({
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        subtype: profile?.subtype ?? null,
        isRoot: profile?.isRoot ?? false,
      });
    }

    const [profile] = await db
      .select({ membershipStatus: afiliados.membershipStatus, folio: afiliados.folio })
      .from(afiliados)
      .where(eq(afiliados.userId, session.user.id))
      .limit(1);

    return ok({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      folio: profile.folio,
      membershipStatus: profile?.membershipStatus ?? null,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
