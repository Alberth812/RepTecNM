import { type NextRequest } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { isAPIError } from "better-auth/api";
import { auth } from "@/lib/auth/auth";
import { requireAfiliado } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema/auth-schema";
import { afiliados } from "@/lib/db/schema/afiliados";
import { changeEmailRequestSchema } from "@/lib/validation/schemas";
import { getClientIp } from "@/lib/http/client-ip";
import { ok, toErrorResponse } from "@/lib/http/responses";
import { ApiError } from "@/lib/errors";
import { AUTH_RULES, MESSAGES } from "@/lib/constants";
import {
  enforceMinInterval,
  enforceRollingLimit,
  recordAuthEvent,
} from "@/lib/rate-limit/limiter";

/**
 * RF-AUTH-012: cambio de correo autogestionado. La identidad se confirma con
 * la CONTRASEÑA ACTUAL (no con un OTP al correo actual: por eso el plugin se
 * configuró con changeEmail.verifyCurrentEmail = false en lib/auth/auth.ts),
 * y el nuevo correo se confirma con un código de 6 dígitos en la ruta
 * /confirm. También aplica el cooldown de 15 días entre cambios exitosos.
 *
 * RF-AUTH-018 aclara explícitamente que el tope de 5 códigos/48h es
 * compartido entre "verificación en signup" y "cambiar correo": por eso este
 * endpoint reutiliza el mismo tipo de evento EMAIL_VERIFICATION_OTP_SENT y la
 * misma dimensión (cuenta) que /api/verify-email/resend.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAfiliado();
    const body = changeEmailRequestSchema.parse(await request.json());
    const ip = getClientIp(request);

    // 1) Verificar la contraseña actual con el endpoint dedicado de
    // better-auth para esto (server-only, requiere sesión, nunca se expone
    // por HTTP): reutiliza exactamente la misma verificación que usa el
    // login normal, sin depender de detalles internos de hashing ni crear
    // ningún efecto secundario (a diferencia de intentar un sign-in).
    const headersList = await headers();
    try {
      await auth.api.verifyPassword({
        headers: headersList,
        body: { password: body.currentPassword },
      });
    } catch (error) {
      if (isAPIError(error)) {
        throw ApiError.unauthorized(
          "La contraseña actual es incorrecta.",
          "INVALID_PASSWORD",
        );
      }
      throw error;
    }

    // 2) El nuevo correo no debe pertenecer a otra cuenta.
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, body.newEmail))
      .limit(1);
    if (existing) {
      throw ApiError.conflict(
        MESSAGES.EMAIL_NOT_AVAILABLE,
        "EMAIL_NOT_AVAILABLE",
      );
    }

    // 3) Cooldown de 15 días desde el último cambio exitoso.
    const [afiliado] = await db
      .select({ lastEmailChangeAt: afiliados.lastEmailChangeAt })
      .from(afiliados)
      .where(eq(afiliados.userId, session.user.id))
      .limit(1);

    if (afiliado?.lastEmailChangeAt) {
      const elapsed = Date.now() - afiliado.lastEmailChangeAt.getTime();
      if (elapsed < AUTH_RULES.EMAIL_CHANGE_COOLDOWN_MS) {
        const retryAfterSeconds = Math.ceil(
          (AUTH_RULES.EMAIL_CHANGE_COOLDOWN_MS - elapsed) / 1000,
        );
        throw ApiError.rateLimited(
          MESSAGES.EMAIL_CHANGE_COOLDOWN,
          retryAfterSeconds,
          "EMAIL_CHANGE_COOLDOWN",
        );
      }
    }

    // 4) Mismos límites de generación de código que la verificación de signup.
    await enforceMinInterval({
      type: "EMAIL_VERIFICATION_OTP_SENT",
      dimension: { column: "userId", value: session.user.id },
      minIntervalMs: AUTH_RULES.RESEND_MIN_INTERVAL_MS,
      message: "Debes esperar antes de solicitar un nuevo código.",
    });
    await enforceRollingLimit({
      type: "EMAIL_VERIFICATION_OTP_SENT",
      dimension: { column: "userId", value: session.user.id },
      windowMs: AUTH_RULES.EMAIL_OTP_MAX_PER_ACCOUNT_WINDOW_MS,
      max: AUTH_RULES.EMAIL_OTP_MAX_PER_ACCOUNT,
      message:
        "Se alcanzó el máximo de códigos generados para esta cuenta. Intenta de nuevo en 48 horas.",
    });
    await enforceRollingLimit({
      type: "EMAIL_VERIFICATION_OTP_SENT",
      dimension: { column: "ipAddress", value: ip },
      windowMs: AUTH_RULES.EMAIL_OTP_MAX_PER_IP_WINDOW_MS,
      max: AUTH_RULES.EMAIL_OTP_MAX_PER_IP,
      message:
        "Demasiadas solicitudes de código desde esta red. Intenta de nuevo más tarde.",
    });

    await auth.api.requestEmailChangeEmailOTP({
      headers: headersList,
      body: { newEmail: body.newEmail },
    });

    await recordAuthEvent({
      type: "EMAIL_VERIFICATION_OTP_SENT",
      userId: session.user.id,
      email: body.newEmail,
      ipAddress: ip,
    });

    return ok({
      message: "Se envió un código de confirmación a tu nuevo correo.",
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
