import { type NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { isAPIError } from "better-auth/api";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/client";
import { administradores } from "@/lib/db/schema/administradores";
import { loginSchema } from "@/lib/validation/schemas";
import { getClientIp } from "@/lib/http/client-ip";
import { toErrorResponse } from "@/lib/http/responses";
import { ROLES } from "@/lib/constants";
import {
  assertLoginAllowed,
  recordLoginFailure,
  resetLoginFailures,
} from "@/lib/rate-limit/login-lockout";

/**
 * Punto de entrada ÚNICO para iniciar sesión (el endpoint crudo
 * /api/auth/sign-in/email está bloqueado, ver app/api/auth/[...all]).
 *
 * RF-AUTH-001 (bloqueo de cuentas no verificadas) lo aplica better-auth
 * internamente vía emailAndPassword.requireEmailVerification.
 * RF-AUTH-013: mensaje de bienvenida específico para administradores.
 * RF-AUTH-025/026: backoff progresivo combinando cuenta + IP.
 */
export async function POST(request: NextRequest) {
  try {
    const body = loginSchema.parse(await request.json());
    const ip = getClientIp(request);

    await assertLoginAllowed(body.email, ip);

    let response: Response;
    try {
      response = await auth.api.signInEmail({
        body: { email: body.email, password: body.password },
        asResponse: true,
      });
    } catch (error) {
      // No contamos como "intento fallido" de fuerza bruta los rechazos que
      // no dependen de la contraseña (p. ej. correo no verificado): el
      // objetivo de RF-AUTH-025/026 es frenar adivinanza de contraseñas, no
      // penalizar a un usuario legítimo que aún no verificó su correo.
      const isCredentialFailure =
        !isAPIError(error) ||
        (error.status !== "FORBIDDEN" && !/verif/i.test(error.message ?? ""));

      if (isCredentialFailure) {
        await recordLoginFailure(body.email, ip);
      }
      throw error;
    }

    await resetLoginFailures(body.email);

    const data = (await response.json().catch(() => null)) as {
      user?: { id: string; email: string; role?: string };
    } | null;

    let extra: Record<string, unknown> = {};
    if (data?.user?.role === ROLES.ADMINISTRADOR) {
      const [profile] = await db
        .select({ subtype: administradores.subtype })
        .from(administradores)
        .where(eq(administradores.userId, data.user.id))
        .limit(1);

      if (profile) {
        // RF-AUTH-013, texto exacto del requisito.
        extra = {
          message: `Bienvenido ${data.user.email}. Eres administrador. Tu tipo es ${profile.subtype}`,
        };
      }
    }

    const headers = new Headers({ "content-type": "application/json" });
    for (const cookie of response.headers.getSetCookie()) {
      headers.append("set-cookie", cookie);
    }

    return new NextResponse(JSON.stringify({ ...data, ...extra }), {
      status: response.status,
      headers,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
