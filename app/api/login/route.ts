import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/client";

import { users } from "@/lib/db/schema/auth-schema";
import { afiliados } from "@/lib/db/schema/afiliados";
import { administradores } from "@/lib/db/schema/administradores";

import { ROLES } from "@/lib/constants";
import { ApiError } from "@/lib/errors";

import { getClientIp } from "@/lib/http/client-ip";
import { toErrorResponse } from "@/lib/http/responses";

import {
  assertLoginAllowed,
  recordLoginFailure,
  resetLoginFailures,
} from "@/lib/rate-limit/login-lockout";

import { loginSchema } from "@/lib/validation/schemas";

import {
  normalizeLoginError,
  normalizeLoginResponse,
} from "@/lib/api/normalize-login-error";

/**
 * Representación mínima de la respuesta de signInEmail.
 * No confiamos en el rol devuelto por la respuesta para autorizar.
 */

type BetterAuthLoginPayload = {
  user?: {
    id?: unknown;
  };
};

/**
 * Obtiene todos los encabezados Set-Cookie de una respuesta.
 *
 * getSetCookie() permite recuperar individualmente las cookies
 * en los runtimes modernos de Node.js.
 */
function getSetCookieValues(headers: Headers): string[] {
  const extendedHeaders = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof extendedHeaders.getSetCookie === "function") {
    return extendedHeaders.getSetCookie();
  }

  const cookie = headers.get("set-cookie");

  return cookie ? [cookie] : [];
}

/**
 * Construye el encabezado Cookie a partir de los Set-Cookie
 * que acaba de generar Better Auth.
 */

function getCookieHeader(headers: Headers): string {
  return getSetCookieValues(headers)
    .map((cookie) => cookie.split(";")[0]?.trim())
    .filter((cookie): cookie is string => Boolean(cookie))
    .join("; ");
}

/**
 * Revoca la sesión que acaba de crear Better Auth.
 *
 * Esto evita dejar sesiones válidas de usuarios que no
 * tienen autorización para acceder a la plataforma.
 */

async function revokeCreatedSession(response: Response, request: NextRequest) {
  const cookieHeader = getCookieHeader(response.headers);

  if (!cookieHeader) {
    throw new Error(
      "No fue posible recuperar la cookie de la sesión para revocarla.",
    );
  }

  const headers = new Headers(request.headers);

  // Sustituimos las cookies entrantes por las recién creadas.
  headers.set("cookie", cookieHeader);

  await auth.api.signOut({
    headers,
  });
}

/**
 * Copia las cookies generadas por Better Auth a la respuesta
 * que devolveremos al navegador.
 */
function copySetCookies(source: Headers, destination: Headers) {
  for (const cookie of getSetCookieValues(source)) {
    destination.append("set-cookie", cookie);
  }
}

export async function POST(request: NextRequest) {
  try {
    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_JSON",
            message: "Invalid or empty JSON body.",
          },
        },
        { status: 400 },
      );
    }

    const result = loginSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Datos inválidos.",
            issues: result.error.issues,
          },
        },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    const ip = getClientIp(request);

    // Verificar bloqueo progresivo.
    await assertLoginAllowed(email, ip);

    let response: Response;

    // -----------------------------------------------------
    // Autenticación con Better Auth
    // -----------------------------------------------------

    try {
      response = await auth.api.signInEmail({
        body: {
          email,
          password,
        },
        asResponse: true,
      });
    } catch (error) {
      const normalizedError = normalizeLoginError(error);

      if (normalizedError.code === "INVALID_CREDENTIALS") {
        await recordLoginFailure(email, ip);
      }

      throw normalizedError;
    }

    // -----------------------------------------------------
    // Normalización de errores de Better Auth
    // -----------------------------------------------------

    if (!response.ok) {
      const normalizedError = await normalizeLoginResponse(response);

      if (normalizedError.code === "INVALID_CREDENTIALS") {
        await recordLoginFailure(email, ip);
      }

      throw normalizedError;
    }

    // -----------------------------------------------------
    // Validación del perfil y autorización
    // -----------------------------------------------------

    let sessionAccepted = false;

    try {
      // Las credenciales fueron correctas.
      await resetLoginFailures(email);

      // Leer la respuesta sin consumir el cuerpo original.
      const payload = (await response.clone().json()) as BetterAuthLoginPayload;

      const userId = payload.user?.id;

      if (typeof userId !== "string" || !userId) {
        throw new ApiError(
          500,
          "INVALID_AUTH_RESPONSE",
          "No fue posible identificar al usuario autenticado.",
        );
      }

      // Consultar el usuario directamente en nuestra BD.
      const [account] = await db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!account) {
        throw ApiError.forbidden(
          "La cuenta no tiene un registro válido.",
          "ACCOUNT_PROFILE_NOT_FOUND",
        );
      }

      // =====================================================
      // ADMINISTRADOR
      // =====================================================

      if (account.role === ROLES.ADMINISTRADOR) {
        const [admin] = await db
          .select({
            subtype: administradores.subtype,
            isActive: administradores.isActive,
          })
          .from(administradores)
          .where(eq(administradores.userId, account.id))
          .limit(1);

        if (!admin) {
          throw ApiError.forbidden(
            "No se encontró el perfil de administrador.",
            "ADMIN_PROFILE_NOT_FOUND",
          );
        }

        // Un administrador inactivo no puede iniciar sesión.
        if (!admin.isActive) {
          throw ApiError.forbidden(
            "Tu cuenta de administrador está desactivada. Contacta al administrador general.",
            "ADMIN_INACTIVE",
          );
        }

        const nextResponse = NextResponse.json(
          {
            user: {
              id: account.id,
              email: account.email,
              role: ROLES.ADMINISTRADOR,
              subtype: admin.subtype,
            },
          },
          {
            headers: {
              "Cache-Control": "no-store",
            },
          },
        );

        copySetCookies(response.headers, nextResponse.headers);

        sessionAccepted = true;

        return nextResponse;
      }

      // =====================================================
      // AFILIADO
      // =====================================================

      if (account.role === ROLES.AFILIADO) {
        const [afiliado] = await db
          .select({
            membershipStatus: afiliados.membershipStatus,
          })
          .from(afiliados)
          .where(eq(afiliados.userId, account.id))
          .limit(1);

        if (!afiliado) {
          throw ApiError.forbidden(
            "No se encontró el perfil de afiliado.",
            "AFFILIATE_PROFILE_NOT_FOUND",
          );
        }

        // Un afiliado suspendido no puede iniciar sesión.
        if (afiliado.membershipStatus === "SUSPENDIDO") {
          throw ApiError.forbidden(
            "Tu membresía se encuentra suspendida. Contacta a la administración de REP TecNM.",
            "AFFILIATE_SUSPENDED",
          );
        }

        const nextResponse = NextResponse.json(
          {
            user: {
              id: account.id,
              email: account.email,
              role: ROLES.AFILIADO,
              membershipStatus: afiliado.membershipStatus,
            },
          },
          {
            headers: {
              "Cache-Control": "no-store",
            },
          },
        );

        copySetCookies(response.headers, nextResponse.headers);

        sessionAccepted = true;

        return nextResponse;
      }

      // =====================================================
      // ROL DESCONOCIDO
      // =====================================================

      throw ApiError.forbidden(
        "El tipo de cuenta no está autorizado.",
        "INVALID_ACCOUNT_ROLE",
      );
    } catch (error) {
      /*
       * Si la sesión fue creada pero el perfil no está autorizado,
       * o ocurrió un error durante su validación, revocamos la sesión.
       *
       * No devolvemos las cookies al navegador.
       */
      if (!sessionAccepted) {
        await revokeCreatedSession(response, request);
      }

      throw error;
    }
  } catch (error) {
    return toErrorResponse(error);
  }
}
