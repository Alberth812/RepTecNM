// @/api/password/change
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { passwordSchema } from "@/lib/validation/password";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
 INVALID_PASSWORD: "La contraseña actual es incorrecta.",
 CREDENTIAL_ACCOUNT_NOT_FOUND:
 "Esta cuenta no tiene una contraseña configurada.",
 SESSION_EXPIRED: "Tu sesión ha expirado. Inicia sesión nuevamente.",
};

function getErrorCode(error: unknown): string | undefined {
 if (
 typeof error === "object" &&
 error !== null &&
 "body" in error &&
 typeof error.body === "object" &&
 error.body !== null &&
 "code" in error.body &&
 typeof error.body.code === "string"
 ) {
 return error.body.code;
 }

 if (
 typeof error === "object" &&
 error !== null &&
 "code" in error &&
 typeof error.code === "string"
 ) {
 return error.code;
 }

 return undefined;
}

export async function PATCH(request: Request) {
 // 1. Verificar sesión
 const session = await auth.api.getSession({
 headers: request.headers,
 });

 if (!session?.user) {
 return NextResponse.json(
 {
 code: "UNAUTHORIZED",
 message: "No estás autenticado.",
 },
 { status: 401 },
 );
 }

 // 2. Parsear body
 let body: unknown;

 try {
 body = await request.json();
 } catch {
 return NextResponse.json(
 {
 code: "INVALID_BODY",
 message: "El cuerpo de la solicitud no es válido.",
 },
 { status: 400 },
 );
 }

 if (
 typeof body !== "object" ||
 body === null ||
 !("currentPassword" in body) ||
 !("newPassword" in body) ||
 typeof body.currentPassword !== "string" ||
 typeof body.newPassword !== "string"
 ) {
 return NextResponse.json(
 {
 code: "INVALID_BODY",
 message:
 "Debes proporcionar la contraseña actual y la nueva contraseña.",
 },
 { status: 400 },
 );
 }

 const { currentPassword, newPassword } = body;

 // 3. Validar contraseña actual
 if (!currentPassword.trim()) {
 return NextResponse.json(
 {
 code: "CURRENT_PASSWORD_REQUIRED",
 message: "Debes proporcionar tu contraseña actual.",
 },
 { status: 400 },
 );
 }

 // 4. Validar nueva contraseña usando el schema centralizado
 const passwordResult = passwordSchema.safeParse(newPassword);

 if (!passwordResult.success) {
 return NextResponse.json(
 {
 code: "INVALID_NEW_PASSWORD",
 message:
 passwordResult.error.issues[0]?.message ??
 "La nueva contraseña no cumple los requisitos de seguridad.",
 },
 { status: 400 },
 );
 }

 // 5. Cambiar contraseña mediante Better Auth
 try {
 await auth.api.changePassword({
 headers: request.headers,
 body: {
 currentPassword,
 newPassword: passwordResult.data,
 revokeOtherSessions: true,
 },
 });

 return NextResponse.json({
 success: true,
 message: "Contraseña actualizada correctamente.",
 });
 } catch (error) {
 const code = getErrorCode(error);

 return NextResponse.json(
 {
 code: code ?? "PASSWORD_CHANGE_FAILED",
 message:
 (code && AUTH_ERROR_MESSAGES[code]) ??
 "No se pudo actualizar la contraseña.",
 },
 { status: 400 },
 );
 }
}
