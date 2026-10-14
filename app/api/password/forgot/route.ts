import { type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema/auth-schema";
import { afiliados } from "@/lib/db/schema/afiliados";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { getClientIp } from "@/lib/http/client-ip";
import { ok, toErrorResponse } from "@/lib/http/responses";
import { AUTH_RULES, MESSAGES, ROLES } from "@/lib/constants";
import {
 countAuthEvents,
 enforceRollingLimit,
 recordAuthEvent,
} from "@/lib/rate-limit/limiter";

const BLOCKED_MEMBERSHIP_STATUSES = new Set(["RECHAZADO", "SUSPENDIDO"]);

/**
 * RF-AUTH-011: recuperación de contraseña por enlace de un solo uso.
 * Siempre responde el mismo mensaje uniforme, exista o no la cuenta, para no
 * revelar su existencia/estado A TRAVÉS DE ESTE FLUJO (el propio spec aclara
 * que esto no es una garantía anti-enumeración general: RF-AUTH-005 sí puede
 * revelar correos en uso desde el registro).
 *
 * RF-AUTH-023: el límite por IP se aplica siempre, exista o no el correo; el
 * límite de 5 solicitudes/7 días por cuenta, en cambio, se mantiene oculto
 * detrás del mensaje uniforme (revelarlo con un 429 distinto filtraría que
 * la cuenta existe).
 */
export async function POST(request: NextRequest) {
 try {
 const { email } = forgotPasswordSchema.parse(await request.json());
 const ip = getClientIp(request);

 // IP: aplica siempre, independientemente de si el correo existe.
 await enforceRollingLimit({
 type: "PASSWORD_RESET_REQUESTED",
 dimension: { column: "ipAddress", value: ip },
 windowMs: AUTH_RULES.PASSWORD_RESET_MAX_PER_IP_WINDOW_MS,
 max: AUTH_RULES.PASSWORD_RESET_MAX_PER_IP,
 message:
 "Demasiadas solicitudes desde esta red. Intenta de nuevo más tarde.",
 });

 const [user] = await db
 .select()
 .from(users)
 .where(eq(users.email, email))
 .limit(1);

 let eligible = false;
 if (user && user.emailVerified) {
 if (user.role === ROLES.AFILIADO) {
 const [afiliado] = await db
 .select({ membershipStatus: afiliados.membershipStatus })
 .from(afiliados)
 .where(eq(afiliados.userId, user.id))
 .limit(1);
 eligible =
 !afiliado ||
 !BLOCKED_MEMBERSHIP_STATUSES.has(afiliado.membershipStatus);
 } else {
 // Administradores no tienen membership_status; solo se exige correo
 // verificado, lo cual ya es siempre cierto para ellos (RF-AUTH-013).
 eligible = true;
 }
 }

 if (eligible && user) {
 const attemptsInWindow = await countAuthEvents(
 "PASSWORD_RESET_REQUESTED",
 { column: "userId", value: user.id },
 AUTH_RULES.PASSWORD_RESET_MAX_PER_ACCOUNT_WINDOW_MS,
 );

 if (attemptsInWindow < AUTH_RULES.PASSWORD_RESET_MAX_PER_ACCOUNT) {
 await auth.api.requestPasswordReset({ body: { email } });
 await recordAuthEvent({
 type: "PASSWORD_RESET_REQUESTED",
 userId: user.id,
 email,
 ipAddress: ip,
 });
 }
 // Si ya alcanzó el tope de 5/7 días, no se envía correo ni se registra
 // un nuevo evento (para no extender artificialmente la ventana), pero
 // igual respondemos el mensaje uniforme más abajo.
 } else {
 // Cuenta inexistente / no verificada / RECHAZADO / SUSPENDIDO: no se
 // envía nada, pero sí dejamos rastro para el límite por IP.
 await recordAuthEvent({
 type: "PASSWORD_RESET_REQUESTED",
 email,
 ipAddress: ip,
 });
 }

 return ok({ message: MESSAGES.PASSWORD_RESET_UNIFORM });
 } catch (error) {
 return toErrorResponse(error);
 }
}
