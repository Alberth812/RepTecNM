/**
 * RF-AUTH-010 — Política de contraseña.
 * Mínimo 8 caracteres, al menos una mayúscula, un número y un símbolo.
 *
 * Se usa en TODOS los puntos donde se establece una contraseña:
 *   - Registro público                  -> src/app/api/register/route.ts
 *   - Restablecimiento (OTP)            -> hooks.before "/email-otp/reset-password" en src/lib/auth.ts
 *   - Cambio autenticado                -> hooks.before "/change-password" en src/lib/auth.ts
 *   - Creación de cuentas ADMINISTRADOR -> src/app/api/admins/route.ts
 *   - Seed del administrador raíz       -> scripts/seed-root-admin.ts
 *
 * Mantenerlo en un único lugar evita que una de esas rutas quede
 * desincronizada con las demás.
 */

const MIN_LENGTH = 8;
const UPPERCASE_RE = /[A-ZÁÉÍÓÚÑ]/;
const NUMBER_RE = /[0-9]/;
// Cualquier carácter que no sea letra (con acentos), número o espacio.
const SYMBOL_RE = /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s]/;

export type PasswordPolicyResult =
  | { valid: true }
  | { valid: false; message: string };

export function validatePassword(password: string): PasswordPolicyResult {
  if (typeof password !== "string" || password.length < MIN_LENGTH) {
    return { valid: false, message: `La contraseña debe tener al menos ${MIN_LENGTH} caracteres.` };
  }
  if (!UPPERCASE_RE.test(password)) {
    return { valid: false, message: "La contraseña debe incluir al menos una letra mayúscula." };
  }
  if (!NUMBER_RE.test(password)) {
    return { valid: false, message: "La contraseña debe incluir al menos un número." };
  }
  if (!SYMBOL_RE.test(password)) {
    return { valid: false, message: "La contraseña debe incluir al menos un símbolo (p. ej. !, @, #, %)." };
  }
  return { valid: true };
}

export const PASSWORD_POLICY_HINT =
  "Mínimo 8 caracteres, con al menos una mayúscula, un número y un símbolo.";
