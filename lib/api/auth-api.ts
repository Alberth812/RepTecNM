import type { z } from "zod";
import { postJson } from "./fetch-json";
import type {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/schemas";
import type { AdminSubtype, MembershipStatus } from "@/lib/auth/auth-types";

// Los tipos de input se infieren directamente de los esquemas de zod que ya
// existen en el proyecto (@/lib/validation/schemas), para no duplicar reglas
// de validación entre el backend y el frontend.
type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export interface MessageResponse {
  message: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

/** RF-AUTH-001/002/005/017: POST /api/register */
export function registerRequest(input: RegisterInput) {
  return postJson<RegisterResponse>("/api/register", input);
}

/** RF-AUTH-003/004/018/019/022: POST /api/verify-email/resend */
export function resendVerificationRequest(input: ResendVerificationInput) {
  return postJson<MessageResponse>("/api/verify-email/resend", input);
}

export type LoginAffiliateUser = {
  id: string;
  email: string;
  role: "AFILIADO";
  membershipStatus: MembershipStatus;
};

export type LoginAdminUser = {
  id: string;
  email: string;
  role: "ADMINISTRADOR";
  subtype: AdminSubtype;
};

export type LoginUser = LoginAffiliateUser | LoginAdminUser;

export interface LoginResponse {
  user: LoginUser;
}

/** Único punto de entrada soportado para iniciar sesión: POST /api/login */
export function loginRequest(input: LoginInput) {
  return postJson<LoginResponse>("/api/login", input);
}

/** RF-AUTH-011/023: POST /api/password/forgot (mensaje siempre uniforme) */
export function forgotPasswordRequest(input: ForgotPasswordInput) {
  return postJson<MessageResponse>("/api/password/forgot", input);
}

/** RF-AUTH-011/024: POST /api/password/reset */
export function resetPasswordRequest(input: ResetPasswordInput) {
  return postJson<MessageResponse>("/api/password/reset", input);
}
