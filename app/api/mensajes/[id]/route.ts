import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { mensajes } from "@/lib/db/schema/mensajes";
import { eq, and } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth/session"; // CORREGIDO

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Usar la función correcta que sí existe en tu proyecto
    const session = await getCurrentSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const usuario = session.user;
    
    // 2. Resolver el await de params (correcto en Next.js 15/16)
    const { id } = await params;
    const body = await request.json();
    const { accion } = body;

    if (!id || !accion) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // 3. Validar que el mensaje pertenece al usuario actual (destinatario)
    const [mensaje] = await db
      .select()
      .from(mensajes)
      .where(and(eq(mensajes.id, id), eq(mensajes.destinatarioId, usuario.id)));

    if (!mensaje) {
      return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });
    }

    // 4. Aplicar la acción (leido o eliminar)
    if (accion === "leido") {
      await db.update(mensajes).set({ leido: true }).where(eq(mensajes.id, id));
    } else if (accion === "eliminar") {
      // Soft delete: marca como eliminado para el destinatario
      await db.update(mensajes).set({ eliminadoParaDestinatario: true }).where(eq(mensajes.id, id));
    } else {
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar mensaje:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
