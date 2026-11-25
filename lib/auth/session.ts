// @/lib/auth/session.ts

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { auth } from "./auth";
import { db } from "@/lib/db/client";

import { afiliados } from "@/lib/db/schema/afiliados";
import { administradores } from "@/lib/db/schema/administradores";

import { ApiError } from "@/lib/errors";

import { ROLES, ADMIN_SUBTYPES } from "@/lib/constants";

import type { AdminSubtype, MembershipStatus } from "@/lib/auth/auth-types";

// ============================================================
// SESSION
// ============================================================

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

/**
 * Exige una sesión activa.
 */
export async function requireSession() {
  const session = await getCurrentSession();

  if (!session) {
    throw ApiError.unauthorized();
  }

  return session;
}

// ============================================================
// REQUIRE AFILIADO
// ============================================================

/**
 * Exige una sesión perteneciente a un afiliado.
 *
 * Si se proporciona membershipStatus, comprueba que el estado
 * actual esté dentro de los estados permitidos.
 *
 * SUSPENDIDO se considera un estado de bloqueo global.
 */
export async function requireAfiliado(
  membershipStatus?: MembershipStatus | readonly MembershipStatus[],
) {
  const session = await requireSession();

  if (session.user.role !== ROLES.AFILIADO) {
    throw ApiError.forbidden(
      "Esta operación es solo para cuentas de afiliado.",
      "AFFILIATE_REQUIRED",
    );
  }

  const [afiliado] = await db
    .select()
    .from(afiliados)
    .where(eq(afiliados.userId, session.user.id))
    .limit(1);

  if (!afiliado) {
    throw ApiError.forbidden(
      "La cuenta no tiene un perfil de afiliado asociado.",
      "AFFILIATE_PROFILE_NOT_FOUND",
    );
  }

  if (afiliado.membershipStatus === "SUSPENDIDO") {
    throw ApiError.forbidden(
      "La membresía se encuentra suspendida.",
      "AFFILIATE_SUSPENDED",
    );
  }

  if (membershipStatus) {
    const allowedStatuses = Array.isArray(membershipStatus)
      ? membershipStatus
      : [membershipStatus];

    if (!allowedStatuses.includes(afiliado.membershipStatus)) {
      throw ApiError.forbidden(
        "El estado de membresía no permite realizar esta operación.",
        "MEMBERSHIP_STATUS_NOT_ALLOWED",
      );
    }
  }

  return {
    session,
    afiliado,
  };
}

// ============================================================
// REQUIRE ADMINISTRADOR
// ============================================================

/**
 * Exige una sesión perteneciente a un administrador activo.
 *
 * Devuelve también su perfil:
 * - subtype
 * - isActive
 * - isRoot
 */
export async function requireAdministrador() {
  const session = await requireSession();

  if (session.user.role !== ROLES.ADMINISTRADOR) {
    throw ApiError.forbidden(
      "Esta operación es solo para administradores.",
      "ADMIN_REQUIRED",
    );
  }

  const [profile] = await db
    .select()
    .from(administradores)
    .where(eq(administradores.userId, session.user.id))
    .limit(1);

  if (!profile) {
    throw ApiError.forbidden(
      "Perfil de administrador no encontrado.",
      "ADMIN_PROFILE_NOT_FOUND",
    );
  }

  if (!profile.isActive) {
    throw ApiError.forbidden(
      "La cuenta de administrador está desactivada.",
      "ADMIN_INACTIVE",
    );
  }

  return {
    session,
    profile,
  };
}

// ============================================================
// REQUIRE ADMINISTRADOR GENERAL
// ============================================================

/**
 * Exige que el usuario sea administrador activo de tipo GENERAL.
 */
export async function requireAdminGeneral() {
  const { session, profile } = await requireAdministrador();

  if (profile.subtype !== ADMIN_SUBTYPES.GENERAL) {
    throw ApiError.forbidden(
      "Esta operación requiere un administrador de tipo GENERAL.",
      "ADMIN_GENERAL_REQUIRED",
    );
  }

  return {
    session,
    profile,
  };
}

/**
 * Exige un subtipo específico de administrador.
 *
 * También puedes utilizarlo para exigir CONTENIDO.
 */
export async function requireAdminSubtype(subtype: AdminSubtype) {
  const { session, profile } = await requireAdministrador();

  if (profile.subtype !== subtype) {
    throw ApiError.forbidden(
      `Esta operación requiere un administrador de tipo ${subtype}.`,
      "ADMIN_SUBTYPE_REQUIRED",
    );
  }

  return {
    session,
    profile,
  };
}

// ============================================================
// IDENTIFICACIÓN DEL USUARIO ACTUAL
// ============================================================

/**
 * Identifica al usuario autenticado y obtiene su perfil.
 *
 * A diferencia de requireSession(), esta función no lanza
 * un error cuando no existe una sesión. Devuelve un resultado
 * que permite decidir qué mostrar en un layout.
 */

export type CurrentActor =
  | {
      kind: "ANONYMOUS";
    }
  | {
      kind: "AFILIADO";
      session: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>;
      profile: NonNullable<
        Awaited<ReturnType<typeof db.query.afiliados.findFirst>>
      >;
    }
  | {
      kind: "ADMINISTRADOR";
      session: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>;
      profile: NonNullable<
        Awaited<ReturnType<typeof db.query.administradores.findFirst>>
      >;
    }
  | {
      kind: "ADMIN_INACTIVE";
      session: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>;
      profile: NonNullable<
        Awaited<ReturnType<typeof db.query.administradores.findFirst>>
      >;
    }
  | {
      kind: "INVALID_PROFILE";
      session: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>;
      role: string;
    }
  | {
      kind: "UNKNOWN_ROLE";
      session: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>;
      role: string;
    };

export async function getCurrentActor(): Promise<CurrentActor> {
  const session = await getCurrentSession();

  if (!session) {
    return {
      kind: "ANONYMOUS",
    };
  }

  // ----------------------------------------------------------
  // AFILIADO
  // ----------------------------------------------------------

  if (session.user.role === ROLES.AFILIADO) {
    //
    const [profile] = await db
      .select()
      .from(afiliados)
      .where(eq(afiliados.userId, session.user.id))
      .limit(1);

    if (!profile) {
      return {
        kind: "INVALID_PROFILE",
        session,
        role: session.user.role,
      };
    }

    return {
      kind: "AFILIADO",
      session,
      profile,
    };
  }

  // ----------------------------------------------------------
  // ADMINISTRADOR
  // ----------------------------------------------------------

  if (session.user.role === ROLES.ADMINISTRADOR) {
    //
    const [profile] = await db
      .select()
      .from(administradores)
      .where(eq(administradores.userId, session.user.id))
      .limit(1);

    if (!profile) {
      return {
        kind: "INVALID_PROFILE",
        session,
        role: session.user.role,
      };
    }

    if (!profile.isActive) {
      return {
        kind: "ADMIN_INACTIVE",
        session,
        profile,
      };
    }

    return {
      kind: "ADMINISTRADOR",
      session,
      profile,
    };
  }

  // ----------------------------------------------------------
  // ROL DESCONOCIDO
  // ----------------------------------------------------------

  return {
    kind: "UNKNOWN_ROLE",
    session,
    role: session.user.role,
  };
}

// ============================================================
// RESULTADOS DE AUTORIZACIÓN PARA LAYOUTS
// ============================================================

export type PageAccessDenied = {
  allowed: false;

  reason:
    | "UNAUTHENTICATED"
    | "WRONG_ROLE"
    | "INVALID_PROFILE"
    | "UNKNOWN_ROLE"
    | "ADMIN_INACTIVE"
    | "ADMIN_SUBTYPE"
    | "AFFILIATE_SUSPENDED"
    | "MEMBERSHIP_STATUS";

  redirectHref: string;
  redirectLabel: string;
  description: string;

  membershipStatus?: MembershipStatus;
};

export type PageAccess<T> =
  | {
      allowed: true;
      data: T;
    }
  | PageAccessDenied;

/**
 * Helper interno para construir resultados de acceso denegado.
 */
function denyPageAccess(
  reason: PageAccessDenied["reason"],
  options: Omit<PageAccessDenied, "allowed" | "reason">,
): PageAccessDenied {
  return {
    allowed: false,
    reason,
    ...options,
  };
}

// ============================================================
// GUARD DE PÁGINAS PARA AFILIADOS
// ============================================================

/**
 * Permite el acceso a afiliados.
 *
 * Sin parámetros:
 *   Acepta cualquier estado excepto SUSPENDIDO.
 *
 * Con parámetros:
 *   Acepta únicamente los estados indicados.
 *
 * Ejemplos:
 *   getAfiliadoPageAccess()
 *   getAfiliadoPageAccess(["ACTIVO"])
 *   getAfiliadoPageAccess(["ACTIVO", "INACTIVO"])
 */
export async function getAfiliadoPageAccess(
  allowedStatuses?: readonly MembershipStatus[],
): Promise<PageAccess<Extract<CurrentActor, { kind: "AFILIADO" }>>> {
  const actor = await getCurrentActor();

  // No autenticado.
  if (actor.kind === "ANONYMOUS") {
    return denyPageAccess("UNAUTHENTICATED", {
      redirectHref: "/login",
      redirectLabel: "Iniciar sesión",
      description: "Necesitas iniciar sesión para acceder a esta página.",
    });
  }

  // Es administrador activo.
  if (actor.kind === "ADMINISTRADOR") {
    return denyPageAccess("WRONG_ROLE", {
      redirectHref: "/admin/inicio",
      redirectLabel: "Regresar al inicio",
      description: "Esta sección está disponible únicamente para afiliados.",
    });
  }

  // Administrador inactivo.
  if (actor.kind === "ADMIN_INACTIVE") {
    return denyPageAccess("ADMIN_INACTIVE", {
      redirectHref: "/login",
      redirectLabel: "Iniciar sesión",
      description: "La cuenta de administrador está desactivada.",
    });
  }

  // Perfil inexistente.
  if (actor.kind === "INVALID_PROFILE") {
    return denyPageAccess("INVALID_PROFILE", {
      redirectHref: "/",
      redirectLabel: "Regresar a inicio",
      description: "No se encontró un perfil asociado a tu cuenta.",
    });
  }

  // Rol desconocido.
  if (actor.kind === "UNKNOWN_ROLE") {
    return denyPageAccess("UNKNOWN_ROLE", {
      redirectHref: "/",
      redirectLabel: "Regresar a inicio",
      description: "El tipo de cuenta no está autorizado.",
    });
  }

  // A partir de aquí necesariamente es un afiliado.

  // La suspensión es un bloqueo global.
  if (actor.profile.membershipStatus === "SUSPENDIDO") {
    return denyPageAccess("AFFILIATE_SUSPENDED", {
      redirectHref: "/",
      redirectLabel: "Regresar a inicio",
      description: "Tu membresía se encuentra suspendida.",
      membershipStatus: actor.profile.membershipStatus,
    });
  }

  // Validar estados permitidos.
  if (
    allowedStatuses &&
    !allowedStatuses.includes(actor.profile.membershipStatus)
  ) {
    return denyPageAccess("MEMBERSHIP_STATUS", {
      redirectHref: "/afiliado/inicio",
      redirectLabel: "Regresar al dashboard",
      description: "Tu estado de membresía no permite acceder a esta página.",
      membershipStatus: actor.profile.membershipStatus,
    });
  }

  return {
    allowed: true,
    data: actor,
  };
}

// ============================================================
// GUARD DE PÁGINAS PARA ADMINISTRADORES
// ============================================================

/**
 * Permite el acceso a administradores activos.
 *
 * Sin parámetros:
 *   Acepta GENERAL y CONTENIDO.
 *
 * Con parámetro:
 *   Exige el subtipo indicado.
 *
 * Ejemplos:
 *   getAdministradorPageAccess()
 *   getAdministradorPageAccess("GENERAL")
 *   getAdministradorPageAccess("CONTENIDO")
 */
export async function getAdministradorPageAccess(
  requiredSubtype?: AdminSubtype,
): Promise<PageAccess<Extract<CurrentActor, { kind: "ADMINISTRADOR" }>>> {
  const actor = await getCurrentActor();

  // No autenticado.
  if (actor.kind === "ANONYMOUS") {
    return denyPageAccess("UNAUTHENTICATED", {
      redirectHref: "/login",
      redirectLabel: "Iniciar sesión",
      description: "Necesitas iniciar sesión para acceder a esta página.",
    });
  }

  // Es afiliado.
  if (actor.kind === "AFILIADO") {
    return denyPageAccess("WRONG_ROLE", {
      redirectHref: "/afiliado/inicio",
      redirectLabel: "Regresar al dashboard",
      description:
        "Esta sección está disponible únicamente para administradores.",
    });
  }

  // Administrador inactivo.
  if (actor.kind === "ADMIN_INACTIVE") {
    return denyPageAccess("ADMIN_INACTIVE", {
      redirectHref: "/login",
      redirectLabel: "Iniciar sesión",
      description: "Tu cuenta de administrador está desactivada.",
    });
  }

  // Perfil inexistente.
  if (actor.kind === "INVALID_PROFILE") {
    return denyPageAccess("INVALID_PROFILE", {
      redirectHref: "/",
      redirectLabel: "Regresar a inicio",
      description: "No se encontró un perfil asociado a tu cuenta.",
    });
  }

  // Rol desconocido.
  if (actor.kind === "UNKNOWN_ROLE") {
    return denyPageAccess("UNKNOWN_ROLE", {
      redirectHref: "/",
      redirectLabel: "Regresar a inicio",
      description: "El tipo de cuenta no está autorizado.",
    });
  }

  // A partir de aquí necesariamente es un administrador activo.

  // Validar subtipo, si se especificó.
  if (requiredSubtype && actor.profile.subtype !== requiredSubtype) {
    return denyPageAccess("ADMIN_SUBTYPE", {
      redirectHref: "/admin/inicio",
      redirectLabel: "Regresar al inicio",
      description: `Esta sección requiere un administrador de tipo ${requiredSubtype}.`,
    });
  }

  return {
    allowed: true,
    data: actor,
  };
}

// ============================================================
// GUARD ESPECÍFICO PARA ADMINISTRADORES GENERALES
// ============================================================

export async function getAdminGeneralPageAccess() {
  return getAdministradorPageAccess(ADMIN_SUBTYPES.GENERAL);
}

// ============================================================
// COMPATIBILIDAD CON LA UTILIDAD ANTERIOR
// ============================================================

/**
 * Compatibilidad temporal con requireAdminGeneralv2.
 *
 * Se recomienda utilizar directamente requireAdminGeneral().
 */
/*export async function requireAdminGeneralv2() {
  const { session, profile } = await requireAdminGeneral();

  return {
    session,
    admin: profile,
  };
}*/

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
