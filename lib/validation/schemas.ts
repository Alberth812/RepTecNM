import { z } from "zod";
import { passwordSchema } from "./password";
import { ADMIN_SUBTYPES } from "@/lib/constants";

export const emailSchema = z
 .string()
 .min(1, "El correo es obligatorio")
 .trim()
 .toLowerCase()
 .pipe(z.email("Correo inválido"));

export const otpSchema = z
 .string()
 .trim()
 .regex(/^\d{6}$/, "El código debe tener 6 dígitos");

export const registerSchema = z.object({
 name: z.string().trim().min(1, "El nombre es requerido").max(200),
 email: emailSchema,
 password: passwordSchema,
});

export const loginSchema = z.object({
 email: emailSchema,
 password: z.string().min(1, "La contraseña es requerida"),
});

export const resendVerificationSchema = z.object({
 email: emailSchema,
});

export const forgotPasswordSchema = z.object({
 email: emailSchema,
});

export const resetPasswordSchema = z.object({
 email: emailSchema,
 token: z.string().min(1, "Token requerido"),
 newPassword: passwordSchema,
});

export const changeEmailRequestSchema = z.object({
 currentPassword: z.string().min(1, "La contraseña actual es requerida"),
 newEmail: emailSchema,
});

export const changeEmailConfirmSchema = z.object({
 newEmail: emailSchema,
 otp: otpSchema,
});

export const createAdminSchema = z.object({
 name: z.string().trim().min(1, "El nombre es requerido").max(200),
 email: emailSchema,
 password: passwordSchema,
 subtype: z.enum([ADMIN_SUBTYPES.GENERAL, ADMIN_SUBTYPES.CONTENIDO]),
});
