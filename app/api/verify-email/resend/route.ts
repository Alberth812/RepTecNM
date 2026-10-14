import { type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema/auth-schema";
import { resendVerificationSchema } from "@/lib/validation/schemas";
import { getClientIp } from "@/lib/http/client-ip";
import { ok, toErrorResponse } from "@/lib/http/responses";
import { ApiError } from "@/lib/errors";
import { AUTH_RULES } from "@/lib/constants";
import {
 enforceMinInterval,
 enforceRollingLimit,
 recordAuthEvent,
} from "@/lib/rate-limit/limiter";

/**
 * RF-AUTH-003: reenvío del código de verificación (respeta 120s desde el
 * último envío, RF-AUTH-004: el intervalo aplica también desde el primer
 * envío hecho en /api/register).
 * RF-AUTH-018: tope de 5 códigos por cuenta en una ventana de 48h.
 * RF-AUTH-019: tope adicional por IP.
 * RF-AUTH-022: cada nuevo envío invalida los anteriores; eso lo garantiza
 * better-auth internamente (un solo verification record vigente por
 * identifier).
 */
export async function POST(request: NextRequest) {
 try {
 const { email } = resendVerificationSchema.parse(await request.json());
 const ip = getClientIp(request);

 const [user] = await db
 .select()
 .from(users)
 .where(eq(users.email, email))
 .limit(1);
 if (!user) {
 throw ApiError.notFound("No existe una cuenta con ese correo.");
 }
 if (user.emailVerified) {
 throw ApiError.badRequest(
 "Este correo ya está verificado.",
 "ALREADY_VERIFIED",
 );
 }

 await enforceMinInterval({
 type: "EMAIL_VERIFICATION_OTP_SENT",
 dimension: { column: "userId", value: user.id },
 minIntervalMs: AUTH_RULES.RESEND_MIN_INTERVAL_MS,
 message: "Debes esperar antes de solicitar un nuevo código.",
 });

 await enforceRollingLimit({
 type: "EMAIL_VERIFICATION_OTP_SENT",
 dimension: { column: "userId", value: user.id },
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

 await auth.api.sendVerificationOTP({
 body: { email, type: "email-verification" },
 });
 await recordAuthEvent({
 type: "EMAIL_VERIFICATION_OTP_SENT",
 userId: user.id,
 email,
 ipAddress: ip,
 });

 return ok({
 message: "Se envió un nuevo código de verificación a tu correo.",
 });
 } catch (error) {
 return toErrorResponse(error);
 }
}
