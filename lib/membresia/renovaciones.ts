// @/lib/membresia/renovaciones.ts

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/lib/db/client";
import { afiliados } from "@/lib/db/schema/afiliados";
import { archivos } from "@/lib/db/schema/archivo";
import { users } from "@/lib/db/schema/auth-schema";
import { renovacionesMembresia } from "@/lib/db/schema/renovaciones";
import { getFileUrl } from "@/lib/storage/index"; // TODO: ajusta a tu módulo S3 real
import {
  PUEDE_RENOVAR_MEMBRESIA,
  calcularFechaExpiracionMembresia,
} from "@/lib/utils/expiracion-membresia"; // TODO: ajusta al archivo donde ya tenías esto

// ---------------------------------------------------------------------------
// Errores de dominio
// ---------------------------------------------------------------------------

export class RenovacionConflictError extends Error {
  constructor(
    message = "La renovación ya fue procesada por otro administrador.",
  ) {
    super(message);
    this.name = "RenovacionConflictError";
  }
}

/** Detecta una violación de unique constraint de Postgres (23505). */
export function esViolacionDeUnicidad(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

// ---------------------------------------------------------------------------
// Estado derivado — lógica PURA (sin DB). Es la única fuente de verdad:
// la usan tanto el endpoint de estado del afiliado como la validación del
// envío, así nunca se desincronizan.
// ---------------------------------------------------------------------------

export type MembershipStatus = "NO_INICIADA" | "ACTIVO" | "INACTIVO";
export type EstadoRenovacionRow = "PENDIENTE" | "APROBADA" | "RECHAZADA";

export type EstadoComponenteRenovacion =
  | "PENDIENTE"
  | "APROBADA"
  | "RECHAZADA_REENVIO"
  | "PUEDE_INICIAR"
  | "SIN_ACCION";

interface AfiliadoParaEstado {
  membershipStatus: MembershipStatus;
  fechaInicioMembresia: Date | null;
}

interface UltimaRenovacionParaEstado {
  estado: EstadoRenovacionRow;
}

export function puedeRenovarMembresiaDesde(fechaInicio: Date | null): boolean {
  if (!fechaInicio) return false;
  const fechaPermitida = new Date(fechaInicio);
  fechaPermitida.setDate(fechaPermitida.getDate() + PUEDE_RENOVAR_MEMBRESIA);
  return new Date() >= fechaPermitida;
}

export function calcularEstadoRenovacion(
  afiliado: AfiliadoParaEstado,
  ultimaRenovacion: UltimaRenovacionParaEstado | null,
): { estado: EstadoComponenteRenovacion; puedeIniciar: boolean } {
  const puedeRenovar = puedeRenovarMembresiaDesde(
    afiliado.fechaInicioMembresia,
  );

  // 1) Pendiente de revisión: bloquea cualquier otro envío.
  if (ultimaRenovacion?.estado === "PENDIENTE") {
    return { estado: "PENDIENTE", puedeIniciar: false };
  }

  // 2) Aprobada Y seguimos dentro del ciclo que esa aprobación generó (aún
  //    no toca volver a renovar). Si ya se reabrió la ventana de renovación
  //    (puedeRenovar === true) tratamos esa aprobación como "del ciclo
  //    anterior" y dejamos caer a las reglas de abajo: si no hiciéramos
  //    esto, un afiliado que ya renovó una vez quedaría bloqueado para
  //    siempre sin poder volver a renovar en el siguiente ciclo.
  if (
    ultimaRenovacion?.estado === "APROBADA" &&
    afiliado.membershipStatus === "ACTIVO" &&
    !puedeRenovar
  ) {
    return { estado: "APROBADA", puedeIniciar: false };
  }

  const ultimoIntentoFueRechazo = ultimaRenovacion?.estado === "RECHAZADA";

  // 3) Inactiva: siempre puede iniciar.
  if (afiliado.membershipStatus === "INACTIVO") {
    return {
      estado: ultimoIntentoFueRechazo ? "RECHAZADA_REENVIO" : "PUEDE_INICIAR",
      puedeIniciar: true,
    };
  }

  // 4) Activa y próxima a vencer: puede iniciar (incluye reenvío post-rechazo).
  if (afiliado.membershipStatus === "ACTIVO" && puedeRenovar) {
    return {
      estado: ultimoIntentoFueRechazo ? "RECHAZADA_REENVIO" : "PUEDE_INICIAR",
      puedeIniciar: true,
    };
  }

  // 5) Activa, no próxima a vencer (o NO_INICIADA): sin acción. Nota: esto
  //    también cubre correctamente a afiliados NO_INICIADA, que no deben
  //    poder "renovar" algo que nunca empezó.
  return { estado: "SIN_ACCION", puedeIniciar: false };
}

// ---------------------------------------------------------------------------
// Estado completo de un afiliado (con DB)
// ---------------------------------------------------------------------------

export interface EstadoRenovacionAfiliado {
  membershipStatus: MembershipStatus;
  fechaInicioMembresia: Date | null;
  fechaExpiracion: Date | null;
  estadoComponente: EstadoComponenteRenovacion;
  puedeIniciarRenovacion: boolean;
  ultimaRenovacion: {
    id: string;
    estado: EstadoRenovacionRow;
    observaciones: string | null;
    createdAt: Date;
    procesadoAt: Date | null;
  } | null;
}

export async function obtenerEstadoRenovacionAfiliado(
  afiliadoId: string,
): Promise<EstadoRenovacionAfiliado | null> {
  const [afiliado] = await db
    .select({
      membershipStatus: afiliados.membershipStatus,
      fechaInicioMembresia: afiliados.fechaInicioMembresia,
    })
    .from(afiliados)
    .where(eq(afiliados.userId, afiliadoId))
    .limit(1);

  if (!afiliado) return null;

  const [ultimaRenovacion] = await db
    .select({
      id: renovacionesMembresia.id,
      estado: renovacionesMembresia.estado,
      observaciones: renovacionesMembresia.observaciones,
      createdAt: renovacionesMembresia.createdAt,
      procesadoAt: renovacionesMembresia.procesadoAt,
    })
    .from(renovacionesMembresia)
    .where(eq(renovacionesMembresia.afiliadoId, afiliadoId))
    .orderBy(desc(renovacionesMembresia.createdAt))
    .limit(1);

  const { estado, puedeIniciar } = calcularEstadoRenovacion(
    afiliado as AfiliadoParaEstado,
    ultimaRenovacion ?? null,
  );

  return {
    membershipStatus: afiliado.membershipStatus as MembershipStatus,
    fechaInicioMembresia: afiliado.fechaInicioMembresia,
    fechaExpiracion: afiliado.fechaInicioMembresia
      ? calcularFechaExpiracionMembresia(afiliado.fechaInicioMembresia)
      : null,
    estadoComponente: estado,
    puedeIniciarRenovacion: puedeIniciar,
    ultimaRenovacion: ultimaRenovacion ?? null,
  };
}

// ---------------------------------------------------------------------------
// Crear solicitud (afiliado)
// ---------------------------------------------------------------------------

interface ArchivoSubido {
  bucket: string;
  objectKey: string;
  originalName: string;
  contentType: string;
  size: number;
}

export async function crearSolicitudRenovacion(
  afiliadoId: string,
  archivoSubido: ArchivoSubido,
) {
  return db.transaction(async (tx) => {
    const [afiliadoActual] = await tx
      .select({ fechaInicioMembresia: afiliados.fechaInicioMembresia })
      .from(afiliados)
      .where(eq(afiliados.userId, afiliadoId))
      .limit(1);

    const [archivo] = await tx
      .insert(archivos)
      .values({
        bucket: archivoSubido.bucket,
        objectKey: archivoSubido.objectKey,
        originalName: archivoSubido.originalName,
        contentType: archivoSubido.contentType,
        size: archivoSubido.size,
      })
      .returning();

    // Si otra solicitud PENDIENTE se coló en paralelo, este insert falla
    // por el índice único parcial (código 23505) y la transacción completa
    // se revierte (incluyendo el archivo insertado arriba).
    const [renovacion] = await tx
      .insert(renovacionesMembresia)
      .values({
        afiliadoId,
        comprobanteArchivoId: archivo.id,
        estado: "PENDIENTE",
        fechaInicioMembresiaPrevia:
          afiliadoActual?.fechaInicioMembresia ?? null,
      })
      .returning();

    return renovacion;
  });
}

// ---------------------------------------------------------------------------
// Aprobar (admin) — transaccional, condicional, con reactivación de
// membresía y cálculo de nueva fecha de inicio.
// ---------------------------------------------------------------------------

export async function aprobarRenovacion(renovacionId: string, adminId: string) {
  return db.transaction(async (tx) => {
    // Update condicional: solo si sigue PENDIENTE. Si otro admin ya la
    // procesó, no regresa fila.
    const [renovacionActualizada] = await tx
      .update(renovacionesMembresia)
      .set({
        estado: "APROBADA",
        procesadoPorAdminId: adminId,
        procesadoAt: new Date(),
      })
      .where(
        and(
          eq(renovacionesMembresia.id, renovacionId),
          eq(renovacionesMembresia.estado, "PENDIENTE"),
        ),
      )
      .returning({
        id: renovacionesMembresia.id,
        afiliadoId: renovacionesMembresia.afiliadoId,
      });

    if (!renovacionActualizada) {
      throw new RenovacionConflictError();
    }

    // Lock de la fila del afiliado para evitar que otra operación concurrente
    // la modifique mientras calculamos la nueva fecha.
    const [afiliado] = await tx
      .select({ fechaInicioMembresia: afiliados.fechaInicioMembresia })
      .from(afiliados)
      .where(eq(afiliados.userId, renovacionActualizada.afiliadoId))
      .for("update");

    if (!afiliado?.fechaInicioMembresia) {
      throw new Error(
        "El afiliado no tiene una fecha de inicio de membresía registrada.",
      );
    }

    const fechaExpiracionAnterior = calcularFechaExpiracionMembresia(
      afiliado.fechaInicioMembresia,
    );
    // fechaInicioMembresia = MAX(ahora, expiración anterior)
    const nuevaFechaInicio = new Date(
      Math.max(Date.now(), fechaExpiracionAnterior.getTime()),
    );

    await tx
      .update(afiliados)
      .set({
        fechaInicioMembresia: nuevaFechaInicio,
        membershipStatus: "ACTIVO",
      })
      .where(eq(afiliados.userId, renovacionActualizada.afiliadoId));

    await tx
      .update(renovacionesMembresia)
      .set({
        fechaInicioMembresiaPrevia: afiliado.fechaInicioMembresia,
        fechaInicioMembresiaAplicada: nuevaFechaInicio,
      })
      .where(eq(renovacionesMembresia.id, renovacionId));

    return { nuevaFechaInicio };
  });
}

// ---------------------------------------------------------------------------
// Rechazar (admin) — también condicional + 409 por simetría/seguridad.
// ---------------------------------------------------------------------------

export async function rechazarRenovacion(
  renovacionId: string,
  adminId: string,
  observaciones?: string,
) {
  const [actualizada] = await db
    .update(renovacionesMembresia)
    .set({
      estado: "RECHAZADA",
      observaciones: observaciones?.trim() || null,
      procesadoPorAdminId: adminId,
      procesadoAt: new Date(),
    })
    .where(
      and(
        eq(renovacionesMembresia.id, renovacionId),
        eq(renovacionesMembresia.estado, "PENDIENTE"),
      ),
    )
    .returning({ id: renovacionesMembresia.id });

  if (!actualizada) {
    throw new RenovacionConflictError();
  }
}

// ---------------------------------------------------------------------------
// Listado paginado de pendientes (admin)
// ---------------------------------------------------------------------------

export interface ListarRenovacionesParams {
  page?: number;
  pageSize?: number;
  q?: string;
  orderDir?: "asc" | "desc";
}

export async function listarRenovacionesPendientes({
  page = 1,
  pageSize = 20,
  q,
  orderDir = "desc",
}: ListarRenovacionesParams) {
  const paginaSegura = Math.max(1, page);
  const tamanoSeguro = Math.min(Math.max(1, pageSize), 100);
  const offset = (paginaSegura - 1) * tamanoSeguro;

  const termino = q?.trim();
  const condicionBusqueda = termino
    ? or(
        ilike(afiliados.folio, `%${termino}%`), // TODO: ajusta si "folio" vive en otro lugar
        ilike(afiliados.nombres, `%${termino}%`),
        ilike(afiliados.apellidoPaterno, `%${termino}%`),
        ilike(afiliados.apellidoMaterno, `%${termino}%`),
        ilike(users.email, `%${termino}%`),
      )
    : undefined;

  const condicion = condicionBusqueda
    ? and(eq(renovacionesMembresia.estado, "PENDIENTE"), condicionBusqueda)
    : eq(renovacionesMembresia.estado, "PENDIENTE");

  const filas = await db
    .select({
      renovacionId: renovacionesMembresia.id,
      solicitadoAt: renovacionesMembresia.createdAt,
      afiliadoId: afiliados.userId,
      folio: afiliados.folio, // TODO: ajusta si aplica
      email: users.email,
      nombres: afiliados.nombres,
      apellidoPaterno: afiliados.apellidoPaterno,
      apellidoMaterno: afiliados.apellidoMaterno,
      fechaInicioMembresia: afiliados.fechaInicioMembresia,
      membershipStatus: afiliados.membershipStatus,
      total: sql<number>`count(*) over()`,
    })
    .from(renovacionesMembresia)
    .innerJoin(
      afiliados,
      eq(afiliados.userId, renovacionesMembresia.afiliadoId),
    )
    .innerJoin(users, eq(users.id, afiliados.userId))
    .where(condicion)
    .orderBy(
      orderDir === "asc"
        ? renovacionesMembresia.createdAt
        : desc(renovacionesMembresia.createdAt),
    )
    .limit(tamanoSeguro)
    .offset(offset);

  const total = filas[0]?.total ?? 0;

  const data = filas.map((fila) => ({
    renovacionId: fila.renovacionId,
    solicitadoAt: fila.solicitadoAt,
    afiliado: {
      id: fila.afiliadoId,
      folio: fila.folio,
      email: fila.email,
      nombreCompleto: [fila.nombres, fila.apellidoPaterno, fila.apellidoMaterno]
        .filter(Boolean)
        .join(" "),
      fechaInicioMembresia: fila.fechaInicioMembresia,
      fechaExpiracion: fila.fechaInicioMembresia
        ? calcularFechaExpiracionMembresia(fila.fechaInicioMembresia)
        : null,
      membershipStatus: fila.membershipStatus,
    },
  }));

  return {
    data,
    pagination: {
      page: paginaSegura,
      pageSize: tamanoSeguro,
      total,
      totalPages: Math.max(1, Math.ceil(total / tamanoSeguro)),
    },
  };
}

// ---------------------------------------------------------------------------
// Historial completo de un afiliado (para auditoría en la vista de admin)
// ---------------------------------------------------------------------------

const adminUsers = alias(users, "admin_users");

export async function obtenerHistorialRenovaciones(afiliadoId: string) {
  return db
    .select({
      id: renovacionesMembresia.id,
      estado: renovacionesMembresia.estado,
      observaciones: renovacionesMembresia.observaciones,
      createdAt: renovacionesMembresia.createdAt,
      procesadoAt: renovacionesMembresia.procesadoAt,
      fechaInicioMembresiaPrevia:
        renovacionesMembresia.fechaInicioMembresiaPrevia,
      fechaInicioMembresiaAplicada:
        renovacionesMembresia.fechaInicioMembresiaAplicada,
      comprobanteArchivoId: renovacionesMembresia.comprobanteArchivoId,
      procesadoPorEmail: adminUsers.email,
    })
    .from(renovacionesMembresia)
    .leftJoin(
      adminUsers,
      eq(adminUsers.id, renovacionesMembresia.procesadoPorAdminId),
    )
    .where(eq(renovacionesMembresia.afiliadoId, afiliadoId))
    .orderBy(desc(renovacionesMembresia.createdAt));
}

// ---------------------------------------------------------------------------
// URL firmada del comprobante (para que el admin lo vea)
// ---------------------------------------------------------------------------

export async function obtenerUrlComprobanteRenovacion(renovacionId: string) {
  const [fila] = await db
    .select({ objectKey: archivos.objectKey })
    .from(renovacionesMembresia)
    .innerJoin(
      archivos,
      eq(archivos.id, renovacionesMembresia.comprobanteArchivoId),
    )
    .where(eq(renovacionesMembresia.id, renovacionId))
    .limit(1);

  if (!fila) return null;

  return getFileUrl("afiliados", fila.objectKey);
}
