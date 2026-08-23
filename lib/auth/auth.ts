import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { users } from "@/lib/db/schema/auth-schema";
import { afiliados } from "@/lib/db/schema/afiliados";
import { AUTH_RULES } from "@/lib/constants";
import { sendEmail } from "@/lib/email/mailer";
import {
  changeEmailOtpEmail,
  passwordResetLinkEmail,
  verificationOtpEmail,
} from "@/lib/email/templates";

const APP_URL =
  process.env.APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: (process.env.TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    // Nuestras tablas usan nombres en plural (users, sessions, accounts,
    // verifications), tal como las generó better-auth para este proyecto.
    usePlural: true,
  }),

  advanced: {
    ipAddress: {
      // Mismo encabezado que usa lib/http/client-ip.ts, para que el
      // limitador propio y el de better-auth "vean" la misma IP detrás de
      // un proxy/balanceador confiable.
      ipAddressHeaders: [process.env.TRUSTED_IP_HEADER ?? "x-forwarded-for"],
    },
  },

  // ---------------------------------------------------------------------
  // RF-AUTH-008: la sesión expira automáticamente a los 30 días de
  // INACTIVIDAD. `expiresIn` es la vida total de la sesión; `updateAge` hace
  // que, mientras haya actividad, `expiresAt` se vaya corriendo hacia
  // adelante (como mucho una vez por día). Si el usuario deja de usar la
  // cuenta, la sesión sí expira 30 días después de la última actividad.
  // ---------------------------------------------------------------------
  session: {
    expiresIn: AUTH_RULES.SESSION_INACTIVITY_EXPIRY_SECONDS,
    updateAge: 60 * 60 * 24, // refresca como máximo una vez al día
  },

  user: {
    additionalFields: {
      // RF-AUTH-013/3.1: el rol nunca se acepta como input del cliente
      // (input:false); siempre se asigna server-side. El registro público
      // (RF-AUTH-001) siempre crea AFILIADO por el defaultValue; las cuentas
      // ADMINISTRADOR se crean vía src/app/api/admin/create (que hace un
      // UPDATE explícito después de crear la cuenta base) o vía
      // scripts/seed-root-admin.ts.
      role: {
        type: "string",
        input: false,
        defaultValue: "AFILIADO",
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    // RF-AUTH-001: "mientras el correo no esté verificado, la cuenta no
    // permite el inicio de sesión bajo ninguna circunstancia". Este flag es
    // lo que hace cumplir esa regla a nivel de better-auth (y, junto con
    // autoSignIn:false, evita que se cree una sesión en el propio registro).
    requireEmailVerification: true,
    autoSignIn: false,
    minPasswordLength: AUTH_RULES.PASSWORD_MIN_LENGTH,
    // RF-AUTH-010 completo (mayúscula+número+símbolo) se valida aparte con
    // zod en lib/validation/password.ts, porque better-auth solo controla
    // longitud mínima/máxima de forma nativa.

    // RF-AUTH-011: el link de recuperación es de un solo uso; al usarse con
    // éxito conviene cerrar cualquier otra sesión activa de la cuenta.
    revokeSessionsOnPasswordReset: true,

    resetPasswordTokenExpiresIn:
      AUTH_RULES.PASSWORD_RESET_LINK_EXPIRES_IN_SECONDS,
    sendResetPassword: async ({ user, token }) => {
      // Construimos nuestro propio enlace (incluyendo el correo, ver
      // src/app/api/password/reset/route.ts) en vez de depender del `url`
      // por defecto, porque este proyecto no tiene frontend: el enlace es
      // solo contenido informativo del correo para quien construya la UI
      // más adelante.
      const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;
      const { subject, text, html } = passwordResetLinkEmail(
        resetUrl,
        Math.round(AUTH_RULES.PASSWORD_RESET_LINK_EXPIRES_IN_SECONDS / 60),
      );
      await sendEmail({ to: user.email, subject, text, html });
    },
  },

  emailVerification: {
    // El envío inicial se dispara explícitamente desde
    // src/app/api/register/route.ts (para registrar también el evento de
    // auditoría RF-AUTH-018/019 y no depender de un side-effect implícito).
    sendOnSignUp: false,
    autoSignInAfterVerification: false,
  },

  plugins: [
    emailOTP({
      otpLength: AUTH_RULES.EMAIL_OTP_LENGTH,
      expiresIn: AUTH_RULES.EMAIL_OTP_EXPIRES_IN_SECONDS,
      // RF-AUTH-020: intentos fallidos permitidos antes de invalidar el
      // desafío (better-auth ya invalida y exige un nuevo código al
      // superarse, cumpliendo la regla sin código adicional).
      allowedAttempts: AUTH_RULES.EMAIL_OTP_ALLOWED_ATTEMPTS,
      // RF-AUTH-002: el registro público nunca debe autocrear una cuenta
      // "fantasma" vía OTP; el signup siempre pasa por /api/register.
      disableSignUp: true,
      // RF-AUTH-002/RF-AUTH-021/RF-AUTH-022: usar OTP en vez del enlace por
      // defecto para verificar correo en el signup.
      overrideDefaultEmailVerification: true,
      changeEmail: {
        enabled: true,
        // RF-AUTH-012 pide verificar la IDENTIDAD con la contraseña actual,
        // no con un OTP al correo actual; por eso NO activamos
        // verifyCurrentEmail (eso pediría además un código al correo viejo).
        // La verificación de contraseña ocurre en
        // src/app/api/account/change-email/request/route.ts antes de llamar
        // a auth.api.requestEmailChange.
        verifyCurrentEmail: false,
      },
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          //
          const { subject, text, html } = verificationOtpEmail(
            otp,
            Math.round(AUTH_RULES.EMAIL_OTP_EXPIRES_IN_SECONDS / 60),
          );
          await sendEmail({ to: email, subject, text, html });
          return;
        }
        if (type === "change-email") {
          // RF-AUTH-012: código de 6 dígitos enviado al NUEVO correo,
          // disparado por auth.api.requestEmailChangeEmailOTP.
          const { subject, text, html } = changeEmailOtpEmail(
            otp,
            Math.round(AUTH_RULES.EMAIL_OTP_EXPIRES_IN_SECONDS / 60),
          );
          await sendEmail({ to: email, subject, text, html });
          return;
        }
        if (type === "sign-in") {
          // No usado: el inicio de sesión sin contraseña está fuera del
          // alcance de RF-AUTH (ver README). Se deja el caso cubierto por
          // si en el futuro se decide habilitarlo.
          return;
        }
        // type === "forget-password": tampoco se usa (RF-AUTH-011 exige un
        // enlace, no un OTP); el flujo real vive en emailAndPassword.sendResetPassword.
      },
    }),
  ],

  // ---------------------------------------------------------------------
  // Efecto de dominio que debe ocurrir SIEMPRE que un correo se verifica con
  // éxito (RF-AUTH-002): crear el perfil de afiliado con membership_status =
  // NO_INICIADA. Se implementa como hook global (no solo en el wrapper de
  // reenvío) para que se cumpla sin importar el punto de entrada, y se
  // verifica releyendo el propio estado de `users` en vez de asumir la forma
  // exacta del contexto interno del hook: así es correcto sin importar los
  // detalles internos de la librería.
  // ---------------------------------------------------------------------
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/email-otp/verify-email") return;

      const email = (ctx.body as { email?: string } | undefined)?.email;
      if (!email) return;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (!user || !user.emailVerified || user.role !== "AFILIADO") return;

      await db
        .insert(afiliados)
        .values({ userId: user.id, membershipStatus: "NO_INICIADA" })
        .onConflictDoNothing({ target: afiliados.userId });
    }),
  },

  // ---------------------------------------------------------------------
  // RF-AUTH-016/017: límite base por IP para los endpoints propios de
  // better-auth que SÍ quedan expuestos directamente (ver bloqueo de rutas
  // "crudas" en src/app/api/auth/[...all]/route.ts para las que están
  // envueltas por una ruta propia con reglas más finas, persistidas en
  // Postgres). Estos customRules son una segunda capa de defensa: aplican
  // por IP y en memoria, muy baratos, para todo lo que llegue directo al
  // handler de better-auth.
  // ---------------------------------------------------------------------
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/get-session": false,
      "/email-otp/verify-email": { window: 60, max: 10 },
      "/email-otp/check-verification-otp": { window: 60, max: 10 },
      "/sign-out": false,
    },
  },
});

export type Auth = typeof auth;
