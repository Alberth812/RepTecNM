import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { mensajes } from "@/lib/db/schema/mensajes";
import { eq, and } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth/session";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionData = await getCurrentSession();
    if (!sessionData || !sessionData.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.json();
    const { accion } = body;

    // Verificar que el mensaje exista y pertenezca al usuario actual
    const [mensaje] = await db.select().from(mensajes).where(
      and(eq(mensajes.id, id), eq(mensajes.destinatarioId, sessionData.user.id))
    );

    if (!mensaje) {
      return NextResponse.json({ error: "Mensaje no encontrado o no tienes permiso" }, { status: 404 });
    }

    if (accion === "leido") {
      await db.update(mensajes).set({ leido: true }).where(eq(mensajes.id, id));
    } else if (accion === "eliminar") {
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
