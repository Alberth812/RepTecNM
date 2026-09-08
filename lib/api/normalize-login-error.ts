// @/lib/auth/normalize-login-error.ts

import { isAPIError } from "better-auth/api";
import { ApiError } from "@/lib/errors";

export function normalizeLoginError(error: unknown): ApiError {
  if (!isAPIError(error)) {
    return new ApiError(
      500,
      "INTERNAL_ERROR",
      "Ocurrió un error inesperado.",
    );
  }

  const code =
    (error.body as { code?: string } | undefined)?.code ??
    String(error.status);

  // No exponemos si el correo existe o no.
  if (
    code === "INVALID_EMAIL_OR_PASSWORD" ||
    code === "INVALID_PASSWORD" ||
    code === "USER_NOT_FOUND" ||
    code === "CREDENTIAL_ACCOUNT_NOT_FOUND"
  ) {
    return new ApiError(
      401,
      "INVALID_CREDENTIALS",
      "El correo electrónico o la contraseña son incorrectos.",
    );
  }

  if (
    code === "EMAIL_NOT_VERIFIED" ||
    /verif/i.test(error.message ?? "")
  ) {
    return new ApiError(
      403,
      "EMAIL_NOT_VERIFIED",
      "Debes verificar tu correo electrónico antes de iniciar sesión.",
    );
  }

  return new ApiError(
    typeof error.statusCode === "number" ? error.statusCode : 400,
    code ?? "AUTH_ERROR",
    "No se pudo iniciar sesión.",
  );
}