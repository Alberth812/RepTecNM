/**
 * Todas las constantes de negocio y de rate limiting viven aquí, en un solo
 * lugar, para que cada regla RF-AUTH-XXX tenga un único punto de verdad y sea
 * fácil de auditar / ajustar sin ir a buscar números mágicos por el código.
 *
 * Los valores marcados como "(no especificado por el spec)" son elecciones
 * razonables por defecto: el documento de requisitos pide el mecanismo pero
 * no siempre fija el número exacto. Ajusta libremente vía variables de
 * entorno si en el futuro se definen valores oficiales.
 */

const seconds = (n: number) => n * 1000;
const minutes = (n: number) => n * 60 * 1000;
const hours = (n: number) => n * 60 * 60 * 1000;
const days = (n: number) => n * 24 * 60 * 60 * 1000;

export const ROLES = {
 AFILIADO: "AFILIADO",
 ADMINISTRADOR: "ADMINISTRADOR",
} as const;

export const ADMIN_SUBTYPES = {
 GENERAL: "GENERAL",
 CONTENIDO: "CONTENIDO",
} as const;

export const MEMBERSHIP_STATUS = {
 NO_INICIADA: "NO_INICIADA",
 PENDIENTE_APROBACION: "PENDIENTE_APROBACION",
 REQUIERE_CORRECCION: "REQUIERE_CORRECCION",
 RECHAZADO: "RECHAZADO",
 ACTIVO: "ACTIVO",
 INACTIVO: "INACTIVO",
 SUSPENDIDO: "SUSPENDIDO",
 BAJA: "BAJA",
} as const;

export const MESSAGES = {
 // RF-AUTH-005
 EMAIL_NOT_AVAILABLE: "Este correo no está disponible para su registro",
 // RF-AUTH-011
 PASSWORD_RESET_UNIFORM:
 "Si existe una cuenta asociada a este correo, se enviará un correo electrónico para recuperar la contraseña.",
 // RF-AUTH-004 / RF-AUTH-020 (desafío inválido / expirado / agotado)
 CHALLENGE_INVALID: "El código ingresado es inválido o ha expirado. Solicita un nuevo código.",
 CHALLENGE_MAX_ATTEMPTS: "Se superó el número de intentos permitidos. Solicita un nuevo código.",
 // RF-AUTH-012
 EMAIL_CHANGE_COOLDOWN:
 "Ya cambiaste tu correo recientemente. Podrás volver a hacerlo después de algunos días.",
} as const;

export const AUTH_RULES = {
 // RF-AUTH-002 / RF-AUTH-018: vigencia del código de 6 dígitos.
 EMAIL_OTP_EXPIRES_IN_SECONDS: 15 * 60,
 EMAIL_OTP_LENGTH: 6,
 // RF-AUTH-020: intentos fallidos permitidos antes de invalidar el desafío.
 EMAIL_OTP_ALLOWED_ATTEMPTS: 5,

 // RF-AUTH-003 / RF-AUTH-004: intervalo mínimo entre reenvíos.
 RESEND_MIN_INTERVAL_MS: seconds(120),

 // RF-AUTH-018: máximo de códigos de verificación (signup o cambio de
 // correo) generados por cuenta antes de bloquear por 48h.
 EMAIL_OTP_MAX_PER_ACCOUNT_WINDOW_MS: hours(48),
 EMAIL_OTP_MAX_PER_ACCOUNT: 5,

 // RF-AUTH-019: tope de generación de desafíos por IP (no especificado por
 // el spec con un número exacto; se documenta y se deja configurable).
 EMAIL_OTP_MAX_PER_IP_WINDOW_MS: hours(1),
 EMAIL_OTP_MAX_PER_IP: 20,

 // RF-AUTH-011 / RF-AUTH-023: solicitudes de recuperación de contraseña.
 PASSWORD_RESET_MAX_PER_ACCOUNT_WINDOW_MS: days(7),
 PASSWORD_RESET_MAX_PER_ACCOUNT: 5,
 PASSWORD_RESET_LINK_EXPIRES_IN_SECONDS: 15 * 60,
 // Límite por IP (no especificado con número exacto por el spec).
 PASSWORD_RESET_MAX_PER_IP_WINDOW_MS: hours(1),
 PASSWORD_RESET_MAX_PER_IP: 10,

 // RF-AUTH-024: cambios de contraseña exitosos vía recuperación.
 PASSWORD_CHANGE_MAX_PER_ACCOUNT_WINDOW_MS: days(7),
 PASSWORD_CHANGE_MAX_PER_ACCOUNT: 2,

 // RF-AUTH-012: cooldown entre cambios de correo exitosos.
 EMAIL_CHANGE_COOLDOWN_MS: days(15),

 // RF-AUTH-017: registros por IP (no especificado con número exacto).
 SIGNUP_MAX_PER_IP_WINDOW_MS: hours(1),
 SIGNUP_MAX_PER_IP: 10,

 // RF-AUTH-025 / RF-AUTH-026: backoff progresivo de login por cuenta.
 // Umbrales de intentos fallidos consecutivos -> minutos de bloqueo.
 LOGIN_BACKOFF_TIERS: [
 { afterFailures: 5, lockMs: minutes(1) },
 { afterFailures: 10, lockMs: minutes(5) },
 { afterFailures: 15, lockMs: minutes(15) },
 { afterFailures: 20, lockMs: minutes(60) },
 ],
 // Límite adicional por IP (ataques distribuidos contra muchas cuentas).
 LOGIN_MAX_FAILURES_PER_IP_WINDOW_MS: minutes(15),
 LOGIN_MAX_FAILURES_PER_IP: 30,

 // RF-AUTH-008: expiración de sesión por inactividad.
 SESSION_INACTIVITY_EXPIRY_SECONDS: days(30) / 1000,

 // RF-AUTH-010: política de contraseña.
 PASSWORD_MIN_LENGTH: 8,
} as const;
