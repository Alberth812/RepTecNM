import { type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema/auth-schema";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { ok, toErrorResponse } from "@/lib/http/responses";
import { ApiError } from "@/lib/errors";
import { AUTH_RULES } from "@/lib/constants";
import { countAuthEvents, recordAuthEvent } from "@/lib/rate-limit/limiter";

/**
 * RF-AUTH-011 (confirmación del enlace de recuperación) + RF-AUTH-024
 * (máximo 2 cambios de contraseña exitosos vía este mecanismo cada 7 días,
 * ventana móvil; solo cuentan los cambios que sí se completan).
 *
 * Recibe `email` además de `token` porque el enlace que enviamos en
 * lib/auth/auth.ts (sendResetPassword) incluye ambos como query params: así
 * podemos aplicar el límite por cuenta ANTES de consumir el token, sin
 * depender de la forma interna de los registros de verificación de
 * better-auth.
 */
export async function POST(request: NextRequest) {
  try {
    const body = resetPasswordSchema.parse(await request.json());

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (user) {
      const completedInWindow = await countAuthEvents(
        "PASSWORD_RESET_COMPLETED",
        { column: "userId", value: user.id },
        AUTH_RULES.PASSWORD_CHANGE_MAX_PER_ACCOUNT_WINDOW_MS,
      );
      if (completedInWindow >= AUTH_RULES.PASSWORD_CHANGE_MAX_PER_ACCOUNT) {
        throw ApiError.rateLimited(
          "Alcanzaste el máximo de cambios de contraseña permitidos esta semana. Intenta de nuevo más tarde.",
          Math.ceil(
            AUTH_RULES.PASSWORD_CHANGE_MAX_PER_ACCOUNT_WINDOW_MS / 1000,
          ),
          "PASSWORD_CHANGE_LIMIT",
        );
      }
    }

    // RF-AUTH-010 (mayúscula+número+símbolo) ya lo valida resetPasswordSchema
    // (usa el mismo passwordSchema del registro).
    await auth.api.resetPassword({
      body: { token: body.token, newPassword: body.newPassword },
    });

    if (user) {
      await recordAuthEvent({
        type: "PASSWORD_RESET_COMPLETED",
        userId: user.id,
        email: body.email,
      });
    }

    return ok({ message: "Tu contraseña se actualizó correctamente." });
  } catch (error) {
    return toErrorResponse(error);
  }
}
