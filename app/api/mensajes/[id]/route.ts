/**
 * API para operaciones sobre un mensaje específico
 * 
 * PATCH /api/mensajes/[id] - Marcar un mensaje como leído
 * 
 * Solo el destinatario puede marcar un mensaje como leído
 */
import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { mensajes } from "@/lib/db/schema/mensajes";
import { eq, and } from "drizzle-orm";
import { ok, toErrorResponse } from "@/lib/http/responses";
import { ApiError } from "@/lib/errors";

/**
 * PATCH: Marcar un mensaje como leído
 * 
 * Solo funciona si el usuario autenticado es el destinatario del mensaje
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación y obtener sesión del usuario
    const session = await requireSession();
    const { id } = await params;

    // Actualizar el mensaje: marcar como leído
    // Solo si el usuario actual es el destinatario (seguridad)
    const result = await db
      .update(mensajes)
      .set({ leido: true })
      .where(
        and(
          eq(mensajes.id, id),
          eq(mensajes.destinatarioId, session.user.id)
        )
      );

    if (!result) {
      throw ApiError.notFound("Mensaje no encontrado o no tienes permiso");
    }

    return ok({ message: "Mensaje marcado como leído" });
  } catch (error) {
    return toErrorResponse(error);
  }
}
