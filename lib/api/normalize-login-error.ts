import { isAPIError } from "better-auth/api";
import { ApiError } from "@/lib/errors";

const INVALID_CREDENTIAL_CODES = new Set([
  "INVALID_EMAIL_OR_PASSWORD",
  "INVALID_PASSWORD",
  "USER_NOT_FOUND",
  "CREDENTIAL_ACCOUNT_NOT_FOUND",
]);

interface BetterAuthErrorBody {
  code?: unknown;
  message?: unknown;
}

function getCode(body: unknown): string | undefined {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const code = (body as BetterAuthErrorBody).code;

  return typeof code === "string" ? code : undefined;
}

function normalizeCode(code: string | undefined): ApiError {
  if (code && INVALID_CREDENTIAL_CODES.has(code)) {
    return new ApiError(
      401,
      "INVALID_CREDENTIALS",
      "El correo electrónico o la contraseña son incorrectos.",
    );
  }

  if (code === "EMAIL_NOT_VERIFIED") {
    return new ApiError(
      403,
      "EMAIL_NOT_VERIFIED",
      "Debes verificar tu correo electrónico antes de iniciar sesión.",
    );
  }

  return new ApiError(401, "AUTH_ERROR", "No se pudo iniciar sesión.");
}

export function normalizeLoginError(error: unknown): ApiError {
  if (!isAPIError(error)) {
    return new ApiError(500, "INTERNAL_ERROR", "Ocurrió un error inesperado.");
  }

  const code = getCode(error.body);

  if (code && INVALID_CREDENTIAL_CODES.has(code)) {
    return new ApiError(
      401,
      "INVALID_CREDENTIALS",
      "El correo electrónico o la contraseña son incorrectos.",
    );
  }

  if (code === "EMAIL_NOT_VERIFIED" || /verif/i.test(error.message ?? "")) {
    return new ApiError(
      403,
      "EMAIL_NOT_VERIFIED",
      "Debes verificar tu correo electrónico antes de iniciar sesión.",
    );
  }

  return new ApiError(
    typeof error.statusCode === "number" ? error.statusCode : 400,
    "AUTH_ERROR",
    "No se pudo iniciar sesión.",
  );
}

export async function normalizeLoginResponse(
  response: Response,
): Promise<ApiError> {
  let body: unknown = null;

  try {
    body = await response.json();
  } catch {
    // Ignore empty/non-JSON Better Auth responses.
  }

  const code = getCode(body);

  if (code) {
    return normalizeCode(code);
  }

  return new ApiError(
    response.status,
    "AUTH_ERROR",
    "No se pudo iniciar sesión.",
  );
}
