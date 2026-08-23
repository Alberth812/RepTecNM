import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

/**
 * Cliente de better-auth para uso en componentes de cliente ("use client").
 *
 * Solo lo usamos para lo que el propio better-auth expone de forma segura
 * para el navegador:
 *  - `emailOtp.verifyEmail`: verificar el código de 6 dígitos (no necesita
 *    pasar por nuestra REST API porque no tiene reglas de negocio extra).
 *  - `signOut`: cerrar sesión (POST /api/auth/sign-out, disponible siempre).
 *
 * Todo lo demás (registro, login, forgot/reset password, reenvío de OTP)
 * tiene reglas propias (rate limiting, mensajes uniformes, hooks de
 * dominio) y por eso pasa por nuestras rutas custom en vez de por este
 * cliente — ver lib/api/auth-api.ts.
 */
export const authClient = createAuthClient({
  // Si no se define, better-auth usa el mismo origen donde se sirve la app.
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [emailOTPClient()],
});

export const { signOut } = authClient;
