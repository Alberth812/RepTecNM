import { type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema/auth-schema";
import { registerSchema } from "@/lib/validation/schemas";
import { getClientIp } from "@/lib/http/client-ip";
import { ok, toErrorResponse } from "@/lib/http/responses";
import { ApiError } from "@/lib/errors";
import { MESSAGES, AUTH_RULES } from "@/lib/constants";
import { enforceRollingLimit, recordAuthEvent } from "@/lib/rate-limit/limiter";

/**
 * RF-AUTH-001: registro público, siempre crea rol AFILIADO (forzado
 * server-side en lib/auth/auth.ts, ver user.additionalFields.role).
 * RF-AUTH-002: dispara el envío del primer código de verificación.
 * RF-AUTH-005: mensaje exacto ante correo ya usado, sin filtrar si la cuenta
 * está verificada o no.
 * RF-AUTH-017: límite de intentos de registro por IP.
 */

export async function POST(request: NextRequest) {
 try {
 const body = registerSchema.parse(await request.json());
 const ip = getClientIp(request);

 await enforceRollingLimit({
 type: "SIGNUP_ATTEMPTED",
 dimension: { column: "ipAddress", value: ip },
 windowMs: AUTH_RULES.SIGNUP_MAX_PER_IP_WINDOW_MS,
 max: AUTH_RULES.SIGNUP_MAX_PER_IP,
 message:
 "Demasiados registros desde esta red. Intenta de nuevo más tarde.",
 });
 await recordAuthEvent({
 type: "SIGNUP_ATTEMPTED",
 email: body.email,
 ipAddress: ip,
 });

 // RF-AUTH-005: chequeo explícito para poder devolver el mensaje exacto
 // requerido, independientemente de si la cuenta existente está
 // verificada o no.
 const [existing] = await db
 .select({ id: users.id })
 .from(users)
 .where(eq(users.email, body.email))
 .limit(1);
 if (existing) {
 throw ApiError.conflict(
 MESSAGES.EMAIL_NOT_AVAILABLE,
 "EMAIL_NOT_AVAILABLE",
 );
 }

 // Nota importante: con requireEmailVerification=true y autoSignIn=false,
 // better-auth NO lanza un error ante un correo duplicado; por protección
 // anti-enumeración devuelve una respuesta "genérica" con un usuario
 // sintético (no persistido) que luce como un signup exitoso. Por eso no
 // confiamos en `result.user.id`: en vez de eso, releemos por correo
 // nuestra propia tabla `users` justo después de la llamada. Gracias a la
 // restricción UNIQUE sobre `email`, si existe una fila en este punto es,
 // sin ambigüedad, la cuenta real (la que creamos nosotros, o la de una
 // solicitud concurrente que ganó una carrera minúscula con el chequeo de
 // arriba); cualquiera de los dos casos es un resultado aceptable.
 await auth.api.signUpEmail({
 body: { name: body.name, email: body.email, password: body.password },
 });

 const [createdUser] = await db
 .select({ id: users.id })
 .from(users)
 .where(eq(users.email, body.email))
 .limit(1);
 if (!createdUser) {
 throw new Error("signUpEmail no creó la cuenta esperada.");
 }
 const createdUserId = createdUser.id;

 // RF-AUTH-002: primer envío del desafío de verificación (6 dígitos).
 await auth.api.sendVerificationOTP({
 body: { email: body.email, type: "email-verification" },
 });
 await recordAuthEvent({
 type: "EMAIL_VERIFICATION_OTP_SENT",
 userId: createdUserId,
 email: body.email,
 ipAddress: ip,
 });

 return ok(
 {
 message:
 "Registro exitoso. Revisa tu correo electrónico para verificar tu cuenta con el código de 6 dígitos.",
 email: body.email,
 },
 { status: 201 },
 );
 } catch (error) {
 return toErrorResponse(error);
 }
}
