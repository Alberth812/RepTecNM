import { auth } from "@/lib/auth/auth";
import { getClientIp } from "@/lib/http/client-ip";
import { toErrorResponse } from "@/lib/http/responses";
import {
 assertLoginAllowed,
 recordLoginFailure,
 resetLoginFailures,
} from "@/lib/rate-limit/login-lockout";
import { loginSchema } from "@/lib/validation/schemas";
import {
 normalizeLoginError,
 normalizeLoginResponse,
} from "@/lib/api/normalize-login-error";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
 try {
 let rawBody: unknown;

 try {
 rawBody = await request.json();
 } catch {
 return NextResponse.json(
 {
 error: {
 code: "INVALID_JSON",
 message: "Invalid or empty JSON body.",
 },
 },
 { status: 400 },
 );
 }

 const result = loginSchema.safeParse(rawBody);

 if (!result.success) {
 return NextResponse.json(
 {
 error: {
 code: "VALIDATION_ERROR",
 message: "Datos inválidos.",
 issues: result.error.issues,
 },
 },
 { status: 400 },
 );
 }

 const { email, password } = result.data;
 const ip = getClientIp(request);
 await assertLoginAllowed(email, ip);

 let response: Response;

 try {
 response = await auth.api.signInEmail({
 body: {
 email,
 password,
 },
 asResponse: true,
 });
 } catch (error) {
 const normalizedError = normalizeLoginError(error);

 if (normalizedError.code === "INVALID_CREDENTIALS") {
 await recordLoginFailure(email, ip);
 }

 throw normalizedError;
 }

 /*
 * Better Auth may return authentication errors as a Response
 * rather than throwing when `asResponse: true` is used.
 *
 * Do not return the raw error response. Normalize it first so
 * the frontend always receives our API error contract.
 */
 if (!response.ok) {
 // NORMALIZAR LA RESPUESTA
 const normalizedError = await normalizeLoginResponse(response);

 if (normalizedError.code === "INVALID_CREDENTIALS") {
 await recordLoginFailure(email, ip);
 }

 throw normalizedError;
 }

 // Successful login: clear the account's failed-login state.
 await resetLoginFailures(email);

 return response;
 } catch (error) {
 return toErrorResponse(error);
 }
}
