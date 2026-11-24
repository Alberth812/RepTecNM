import { db } from "@/lib/db/client";
import { afiliados } from "@/lib/db/schema/afiliados";
import { eq } from "drizzle-orm";

// Duración de la membresía en días
export const MEMBRESIA_EXPIRA_EN_DIAS = 3;

// Días necesarios para permitir la renovación
export const PUEDE_RENOVAR_MEMBRESIA = MEMBRESIA_EXPIRA_EN_DIAS - 1;

/**
 * Calcula la fecha de expiración de una membresía.
 */
export function calcularFechaExpiracionMembresia(fechaInicio: Date): Date {
  const fechaExpiracion = new Date(fechaInicio);

  fechaExpiracion.setDate(fechaExpiracion.getDate() + MEMBRESIA_EXPIRA_EN_DIAS);

  return fechaExpiracion;
}

/**
 * Obtiene la fecha de expiración de la membresía de un afiliado.
 */
export async function obtenerFechaExpiracionMembresia(
  afiliadoId: string,
): Promise<Date | null> {
  const [afiliado] = await db
    .select({
      fechaInicioMembresia: afiliados.fechaInicioMembresia,
    })
    .from(afiliados)
    .where(eq(afiliados.userId, afiliadoId))
    .limit(1);

  if (!afiliado?.fechaInicioMembresia) {
    return null;
  }

  return calcularFechaExpiracionMembresia(afiliado.fechaInicioMembresia);
}

/**
 * Comprueba si un afiliado ya puede renovar su membresía.
 */
export async function puedeRenovarMembresia(
  afiliadoId: string,
): Promise<boolean> {
  const [afiliado] = await db
    .select({
      fechaInicioMembresia: afiliados.fechaInicioMembresia,
    })
    .from(afiliados)
    .where(eq(afiliados.userId, afiliadoId))
    .limit(1);

  if (!afiliado?.fechaInicioMembresia) {
    return false;
  }

  const fechaPermitidaRenovacion = new Date(afiliado.fechaInicioMembresia);

  fechaPermitidaRenovacion.setDate(
    fechaPermitidaRenovacion.getDate() + PUEDE_RENOVAR_MEMBRESIA,
  );

  return new Date() >= fechaPermitidaRenovacion;
}
