import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { administradores, afiliados } from "@/db/schema";
import { auth } from "./auth";

/**
 * Helpers de autorización reutilizables. Siguen el patrón recomendado por
 * Better Auth: el middleware (src/middleware.ts) solo hace redirecciones
 * "optimistas" basadas en la existencia de la cookie de sesión; la
 * autorización real (¿quién es?, ¿qué rol/subtipo tiene?) siempre se
 * verifica aquí, del lado del servidor, con acceso a la base de datos.
 */

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export class UnauthorizedError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/** Exige una sesión activa. Lanza si no la hay. */
export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) {
    throw new UnauthorizedError("Debes iniciar sesión.", 401);
  }
  return session;
}

/** Exige una sesión activa con rol AFILIADO. */
export async function requireAfiliado() {
  const session = await requireSession();
  if (session.user.role !== "AFILIADO") {
    throw new UnauthorizedError("Esta acción es exclusiva para afiliados.", 403);
  }
  return session;
}

/** Exige una sesión activa con rol ADMINISTRADOR y devuelve su fila de `administradores`. */
export async function requireAdministrador() {
  const session = await requireSession();
  if (session.user.role !== "ADMINISTRADOR") {
    throw new UnauthorizedError("Esta acción es exclusiva para administradores.", 403);
  }

  const admin = await db.query.administradores.findFirst({
    where: { accountId: session.user.id },
  });

  if (!admin) {
    // No debería pasar nunca (invariante: todo user.role === ADMINISTRADOR
    // tiene una fila en administradores), pero se cubre por robustez.
    throw new UnauthorizedError("No se encontró el perfil de administrador.", 403);
  }

  return { session, admin };
}

/** Exige un administrador con subtipo GENERAL (RF-AUTH-013, RF-AUTH-014). */
export async function requireAdministradorGeneral() {
  const { session, admin } = await requireAdministrador();
  if (admin.subtype !== "GENERAL") {
    throw new UnauthorizedError(
      "Esta acción es exclusiva para administradores de subtipo GENERAL.",
      403,
    );
  }
  return { session, admin };
}

export async function getAfiliadoProfile(accountId: string) {
  return db.query.afiliados.findFirst({ where: { accountId } });
}

export async function getAdministradorProfile(accountId: string) {
  return db.query.administradores.findFirst({ where: { accountId } });
}

/** Utilidad para convertir UnauthorizedError (o cualquier error) en una Response JSON uniforme. */
export function errorToResponse(err: unknown) {
  if (err instanceof UnauthorizedError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return Response.json({ error: "Ocurrió un error inesperado." }, { status: 500 });
}
