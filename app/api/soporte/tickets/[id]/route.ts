import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { soporteTickets, soporteMensajes } from "@/lib/db/schema/soporte";
import { getCurrentSession, requireAdministrador } from "@/lib/auth/session";
import { eq, asc } from "drizzle-orm";

// GET: Obtener detalle del ticket y sus mensajes
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const [ticket] = await db.select().from(soporteTickets).where(eq(soporteTickets.id, params.id));
    
    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }

    const esAdmin = session.user.rol === 'ADMINISTRADOR' || session.user.roles?.includes('ADMINISTRADOR');
    if (!esAdmin && ticket.afiliadoId !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para ver este ticket" }, { status: 403 });
    }

    const mensajes = await db.select().from(soporteMensajes)
      .where(eq(soporteMensajes.ticketId, params.id))
      .orderBy(asc(soporteMensajes.createdAt));

    return NextResponse.json({ ticket, mensajes });
  } catch (error) {
    console.error("Error obteniendo detalle del ticket:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PATCH: Actualizar estado del ticket (Solo Admins)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdministrador();
    const body = await req.json();
    const { estado, adminAsignadoId } = body;

    const estadosValidos = ["PENDIENTE", "ATENDIDO", "SOLUCIONADO", "CERRADO"];
    if (estado && !estadosValidos.includes(estado)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
    }

    const updateData: any = {};
    if (estado) updateData.estado = estado;
    if (adminAsignadoId) updateData.adminAsignadoId = adminAsignadoId;
    if (estado === "SOLUCIONADO" || estado === "CERRADO") {
      updateData.resolvedAt = new Date();
    }

    const [updated] = await db.update(soporteTickets)
      .set(updateData)
      .where(eq(soporteTickets.id, params.id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error("Error actualizando ticket:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
