import { z } from "zod";
import { AUTH_RULES } from "@/lib/constants";

/**
 * RF-AUTH-010: mínimo 8 caracteres, al menos una mayúscula, un número y un
 * símbolo. Se aplica tanto en registro como en cualquier cambio posterior
 * (creación de admin, reset de contraseña, etc.) — todos los flujos de este
 * proyecto que reciben una contraseña nueva importan este mismo schema, así
 * que la regla vive en un solo lugar.
 */
export const passwordSchema = z
 .string()
 .min(
 AUTH_RULES.PASSWORD_MIN_LENGTH,
 `La contraseña debe tener al menos ${AUTH_RULES.PASSWORD_MIN_LENGTH} caracteres`,
 )
 .refine(
 (v) => /[A-Z]/.test(v),
 "La contraseña debe incluir al menos una letra mayúscula",
 )
 .refine(
 (v) => /[0-9]/.test(v),
 "La contraseña debe incluir al menos un número",
 )
 .refine(
 (v) => /[^A-Za-z0-9]/.test(v),
 "La contraseña debe incluir al menos un símbolo (no letra ni número)",
 );

export function validatePassword(
 password: string,
): { ok: true } | { ok: false; message: string } {
 const result = passwordSchema.safeParse(password);
 if (result.success) return { ok: true };
 return {
 ok: false,
 message: result.error.issues[0]?.message ?? "Contraseña inválida",
 };
}
