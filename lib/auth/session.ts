import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "./auth";
import { db } from "@/lib/db/client";
import { administradores } from "@/lib/db/schema/administradores";
import { ApiError } from "@/lib/errors";
import { ROLES, ADMIN_SUBTYPES } from "@/lib/constants";
import { membershipStatusEnum } from "../db/schema/enums";

const values = membershipStatusEnum.enumValues;

const MembershipStatus = Object.fromEntries(
  values.map((value) => [value, value]),
) as Record<(typeof values)[number], (typeof values)[number]>;

type MembershipStatus = keyof typeof MembershipStatus;

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Exige una sesión activa; lanza 401 si no hay ninguna. */
export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) throw ApiError.unauthorized();
  return session;
}

/** Exige sesión de un AFILIADO. */
export async function requireAfiliado(
  membershipStatus?: MembershipStatus | MembershipStatus[],
) {
  const session = await requireSession();

  if (session.user.role !== ROLES.AFILIADO) {
    throw ApiError.forbidden(
      "Esta operación es solo para cuentas de afiliado.",
    );
  }

  const afiliado = await db.query.afiliados.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  if (!afiliado) {
    throw ApiError.forbidden(
      "La cuenta no tiene un perfil de afiliado asociado.",
    );
  }

  if (membershipStatus) {
    const allowedStatuses = Array.isArray(membershipStatus)
      ? membershipStatus
      : [membershipStatus];

    if (!allowedStatuses.includes(afiliado.membershipStatus)) {
      throw ApiError.unauthorized(
        "El estado de membresía de la cuenta no permite realizar esta operación.",
      );
    }
  }

  return {
    session,
    afiliado,
  };
}

/** Exige sesión de un ADMINISTRADOR y devuelve también su perfil (subtype/isRoot). */
export async function requireAdministrador() {
  const session = await requireSession();
  if (session.user.role !== ROLES.ADMINISTRADOR) {
    throw ApiError.forbidden("Esta operación es solo para administradores.");
  }

  const [profile] = await db
    .select()
    .from(administradores)
    .where(eq(administradores.userId, session.user.id))
    .limit(1);

  if (!profile) {
    // No debería pasar nunca (invariante de datos), pero si pasa es mejor
    // fallar explícito que dejar pasar una cuenta administradora sin perfil.
    throw ApiError.forbidden("Perfil de administrador no encontrado.");
  }

  return { session, profile };
}

export async function requireAdminGeneralv2() {
  const session = await getCurrentSession(); // <-- tu helper real de sesión

  if (!session?.user) {
    throw new NoAutenticadoError();
  }

  /* const admin = await db.query.administradores.findFirst({
    where: (administradores, { eq }) =>
      eq(administradores.userId, session.user.id),
  }); */

  const [admin] = await db
    .select()
    .from(administradores)
    .where(eq(administradores.userId, session.user.id))
    .limit(1);

  if (!admin) {
    throw new NoAutorizadoError("No tienes permisos de administrador.");
  }

  if (admin.subtype !== "GENERAL") {
    throw new NoAutorizadoError(
      "Esta acción requiere un administrador de tipo GENERAL.",
    );
  }

  return { admin };
}

export class NoAutenticadoError extends Error {
  constructor() {
    super("No autenticado.");
    this.name = "NoAutenticadoError";
  }
}

export class NoAutorizadoError extends Error {
  constructor(message = "No tienes permisos para esta acción.") {
    super(message);
    this.name = "NoAutorizadoError";
  }
}

/** RF-AUTH-013/014: exige específicamente subtipo GENERAL. */
export async function requireAdminGeneral() {
  const { session, profile } = await requireAdministrador();
  if (profile.subtype !== ADMIN_SUBTYPES.GENERAL) {
    throw ApiError.forbidden(
      "Esta operación requiere un administrador de tipo GENERAL.",
    );
  }
  return { session, profile };
}
