import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { afiliados, user as userTable } from "@/db/schema";
import { sendOtpEmail, sendChangeEmailOtp } from "./email";
import { validatePassword } from "./password-policy";
import { checkAndConsume } from "./rate-limit";

// /email-otp/send-verification-otp
// before → Ocurre antes de que el sistema genere el código o intente enviarlo por correo.
// after  → Ocurre después de que el código OTP ya fue generado y enviado.

// /email-otp/verify-otp
// before → Ocurre antes de comparar el código ingresado con el de la base de datos.
// after  → Ocurre después de que Better Auth verificó si el código es correcto y ya autenticó o verificó al usuario

/**
 * after significa: "El endpoint terminó de ejecutarse (bien o mal)".
 * Para asegurar el éxito, tienes que validar el estatus o contenido de ctx.context.returned
 * (o verificar si se creó ctx.context.newSession en el caso del login/verificación).
 */

const FIFTEEN_MINUTES_SECONDS = 15 * 60;
const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;
const ONE_DAY_SECONDS = 24 * 60 * 60;
const RESEND_COOLDOWN_SECONDS = 120;
const PASSWORD_RESET_MAX_REQUESTS = 5;
const PASSWORD_RESET_WINDOW_SECONDS = 7 * 24 * 60 * 60;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    // Se le pasan las tablas planas (no el objeto `relations`), tal como
    // pide la documentación del adaptador de Drizzle.
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  // --- RF-AUTH-001 / RF-AUTH-006 / RF-AUTH-010 ---
  emailAndPassword: {
    enabled: true,
    // Mientras email_verified = FALSE, la cuenta no puede iniciar sesión
    // "bajo ninguna circunstancia" (RF-AUTH-001).
    requireEmailVerification: true,
    minPasswordLength: 8, // defensa en profundidad; la política completa vive en password-policy.ts
    maxPasswordLength: 128,
    autoSignIn: false,
    // RF-AUTH-011: al restablecer contraseña por OTP no se revocan sesiones
    // automáticamente en este archivo -- el propio flujo de reset ya exige
    // el OTP vigente, así que se deja en false para no forzar relogin en
    // otros dispositivos salvo que el negocio lo requiera explícitamente.
    revokeSessionsOnPasswordReset: false,
  },

  // Con `overrideDefaultEmailVerification` (abajo, en el plugin) el sistema
  // usa el código OTP en vez del enlace por defecto, así que no hace falta
  // implementar `sendVerificationEmail` aquí. `sendOnSignUp` queda sin
  // definir para heredar el comportamiento de `requireEmailVerification`
  // (true), que dispara el envío automático del primer código al registrarse.
  emailVerification: {
    expiresIn: FIFTEEN_MINUTES_SECONDS,
  },

  // RF-AUTH-008: sesión con expiración deslizante por inactividad. Cada vez
  // que se usa la sesión y ya pasó `updateAge`, su vencimiento se recorre a
  // "ahora + expiresIn". 30 días sin uso -> expira y exige reautenticación.
  session: {
    expiresIn: THIRTY_DAYS_SECONDS,
    updateAge: ONE_DAY_SECONDS,
  },

  // Campos propios del dominio añadidos a la tabla `user` de Better Auth.
  user: {
    additionalFields: {
      role: {
        type: "string",
        // Nunca se acepta desde el cliente: el registro público SIEMPRE crea
        // AFILIADO (RF-AUTH-001); ADMINISTRADOR solo se crea vía scripts/
        // seed-root-admin.ts o POST /api/admins (inserción directa en BD).
        input: false,
        defaultValue: "AFILIADO",
        returned: true,
      },
      emailVerifiedAt: {
        type: "date",
        input: false,
        required: false,
        returned: true,
      },
    },
  },

  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: FIFTEEN_MINUTES_SECONDS,
      // RF-AUTH-003: cada reenvío genera un código nuevo e invalida el anterior.
      resendStrategy: "rotate",
      // RF-AUTH-004: si el máximo de intentos se agota, el OTP queda inválido
      // y hay que pedir uno nuevo (comportamiento por defecto del plugin).
      allowedAttempts: 5,
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: true,
      changeEmail: {
        enabled: true,
      },
      async sendVerificationOTP({ email, otp, type }) {
        if (
          type === "sign-in" ||
          type === "email-verification" ||
          type === "forget-password"
        ) {
          await sendOtpEmail({ to: email, otp, type });
        } else {
          // Cualquier otro `type` que el plugin use internamente (p. ej. el
          // flujo de cambio de correo, RF-AUTH-012) cae aquí.
          await sendChangeEmailOtp({ to: email, otp });
        }
      },
    }),

    // Debe ser el último plugin: hace que las respuestas de auth.api.* que
    // se llaman desde Server Actions / Route Handlers seteen la cookie de
    // sesión automáticamente usando el helper `cookies()` de Next.js.
    nextCookies(),
  ],

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // --- RF-AUTH-010: política de contraseña en TODOS los puntos donde
      // el usuario puede fijar/cambiar su propia contraseña a través del
      // motor de Better Auth. (El registro público y la creación de
      // administradores se validan además en sus propias rutas, antes de
      // siquiera llegar aquí -- ver src/app/api/register y src/app/api/admins.)

      //console.log("path = ", ctx.path);

      if (
        ctx.path === "/sign-up/email" ||
        ctx.path === "/email-otp/reset-password"
      ) {
        const password = (ctx.body as Record<string, unknown> | undefined)
          ?.password;
        if (typeof password === "string") {
          const check = validatePassword(password);
          if (!check.valid) {
            throw new APIError("BAD_REQUEST", { message: check.message });
          }
        }
      }

      if (ctx.path === "/change-password") {
        const newPassword = (ctx.body as Record<string, unknown> | undefined)
          ?.newPassword;
        if (typeof newPassword === "string") {
          const check = validatePassword(newPassword);
          if (!check.valid) {
            throw new APIError("BAD_REQUEST", { message: check.message });
          }
        }
      }

      // --- RF-AUTH-003: 120s de enfriamiento entre reenvíos del código de
      // verificación de correo. Se aplica aquí (y no solo en el cliente)
      // para que la regla se cumpla sin importar quién llame al endpoint.
      if (ctx.path === "/email-otp/send-verification-otp") {
        const body = ctx.body as { email?: string; type?: string } | undefined;

        console.log("Aqui", body);

        if (body?.type === "email-verification" && body.email) {
          const result = await checkAndConsume(
            `otp-resend:email-verification:${body.email}`,
            {
              cooldownSeconds: RESEND_COOLDOWN_SECONDS,
            },
          );
          if (!result.allowed) {
            throw new APIError("TOO_MANY_REQUESTS", {
              message: `Debes esperar ${result.retryAfterSeconds}s antes de solicitar un nuevo código.`,
              code: "RETRY_AFTER_SECONDS",
              retryAfterSeconds: result.retryAfterSeconds,
            });
          }
        }
      }

      // --- RF-AUTH-011: recuperación de contraseña.
      // Reglas: no se genera/envía el OTP si la cuenta no existe, no está
      // verificada, o está RECHAZADO/SUSPENDIDO; y como máximo 5 solicitudes
      // en una ventana de 7 días. TODO esto se decide aquí, en un único
      // punto que protege el endpoint sin importar si lo invoca nuestro
      // wrapper (src/app/api/password/forgot) o alguien pega directamente
      // a /api/auth/email-otp/request-password-reset.
      //
      // Importante: el wrapper siempre responde con el mismo mensaje
      // genérico pase lo que pase aquí (atrapa el error de este hook), así
      // que no perdemos la protección anti-enumeración de RF-AUTH-011 al
      // rechazar la solicitud con un error interno.
      if (ctx.path === "/email-otp/request-password-reset") {
        const body = ctx.body as { email?: string } | undefined;
        const email = body?.email;
        if (!email) return;

        const existingUser = await db.query.user.findFirst({
          where: { email },
        });

        let eligible = false;
        if (existingUser?.emailVerified) {
          if (existingUser.role === "AFILIADO") {
            const afiliado = await db.query.afiliados.findFirst({
              where: { accountId: existingUser.id },
            });
            const status = afiliado?.membershipStatus;
            eligible = status !== "RECHAZADO" && status !== "SUSPENDIDO";
          } else {
            eligible = true;
          }
        }

        // El contador se consume siempre (exista o no la cuenta) para no
        // filtrar su existencia a través de "nunca se limita".
        const rl = await checkAndConsume(`password-reset:${email}`, {
          maxInWindow: PASSWORD_RESET_MAX_REQUESTS,
          windowSeconds: PASSWORD_RESET_WINDOW_SECONDS,
        });

        if (!eligible || !rl.allowed) {
          throw new APIError("BAD_REQUEST", {
            message: "No se pudo procesar la solicitud.",
          });
        }
      }
    }),

    after: createAuthMiddleware(async (ctx) => {
      // --- RF-AUTH-002: al verificar el correo con éxito, se crea el
      // perfil de afiliado (membership_status = NO_INICIADA por default de
      // columna) y se marca emailVerifiedAt.
      if (ctx.path === "/email-otp/verify-email") {
        const body = ctx.body as { email?: string } | undefined;

        console.log("body del hook after", body);

        const email = body?.email;
        if (!email) return;

        const verifiedUser = await db.query.user.findFirst({
          where: { email },
        });
        // Se comprueba emailVerified === true por robustez: si el intento
        // de verificación falló (OTP incorrecto/expirado), no se crea nada.
        if (!verifiedUser || !verifiedUser.emailVerified) return;

        await db
          .update(userTable)
          .set({ emailVerifiedAt: new Date() })
          .where(eq(userTable.id, verifiedUser.id));

        if (verifiedUser.role === "AFILIADO") {
          await db
            .insert(afiliados)
            .values({ accountId: verifiedUser.id })
            .onConflictDoNothing();
        }
      }
    }),
  },
});

export type Auth = typeof auth;
