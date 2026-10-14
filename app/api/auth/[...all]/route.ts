import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";

/**
 * Varios endpoints de better-auth implementan la MECÁNICA (hashing, OTPs,
 * tokens, sesiones) pero no todas las REGLAS DE NEGOCIO de RF-AUTH (cooldowns
 * de 120s, topes de 5/48h, 5/7días, 2/7días, backoff progresivo, mensajes
 * exactos, etc.). Para esos casos, este proyecto implementa una ruta propia
 * que llama a `auth.api.*` internamente (ver src/app/api/**) y aplica esas
 * reglas antes/después. Las llamadas `auth.api.*` hechas desde nuestro propio
 * código NO pasan por este catch-all (van directo a la librería), así que
 * bloquear aquí el acceso HTTP "crudo" a esos mismos endpoints obliga a
 * cualquier cliente externo a pasar por la ruta propia correspondiente, sin
 * afectar en nada nuestras propias llamadas server-side.
 *
 * Endpoint crudo bloqueado -> Usar en su lugar
 * /sign-up/email -> POST /api/register
 * /sign-in/email -> POST /api/login
 * /sign-in/email-otp -> (no soportado, ver README)
 * /request-password-reset -> POST /api/password/forgot
 * /forget-password/email-otp -> (no soportado: reset es por enlace)
 * /reset-password -> POST /api/password/reset
 * /email-otp/send-verification-otp -> POST /api/verify-email/resend
 * /email-otp/request-password-reset -> (no soportado: reset es por enlace)
 * /email-otp/reset-password -> (no soportado: reset es por enlace)
 * /email-otp/request-email-change -> POST /api/account/change-email/request
 * /email-otp/change-email -> POST /api/account/change-email/confirm
 */
const BLOCKED_RAW_PATHS = new Set([
 "/sign-up/email",
 "/sign-in/email",
 "/sign-in/email-otp",
 "/request-password-reset",
 "/forget-password/email-otp",
 "/reset-password",
 "/email-otp/send-verification-otp",
 "/email-otp/request-password-reset",
 "/email-otp/reset-password",
 "/email-otp/request-email-change",
 "/email-otp/change-email",
]);

const { GET: rawGET, POST: rawPOST } = toNextJsHandler(auth);

function isBlocked(request: NextRequest): boolean {
 const prefix = "/api/auth";
 const path = request.nextUrl.pathname.startsWith(prefix)
 ? request.nextUrl.pathname.slice(prefix.length)
 : request.nextUrl.pathname;
 return BLOCKED_RAW_PATHS.has(path);
}

function blockedResponse() {
 return NextResponse.json(
 {
 error: {
 code: "NOT_FOUND",
 message:
 "Este endpoint no está expuesto directamente. Consulta la documentación de la API (README) para la ruta equivalente.",
 },
 },
 { status: 404 },
 );
}

export async function GET(request: NextRequest) {
 if (isBlocked(request)) return blockedResponse();
 return rawGET(request);
}

export async function POST(request: NextRequest) {
 if (isBlocked(request)) return blockedResponse();
 return rawPOST(request);
}
