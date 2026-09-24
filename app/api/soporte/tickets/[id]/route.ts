import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { soporteTickets, soporteMensajes } from "@/lib/db/schema/soporte";
import { afiliados } from "@/lib/db/schema/afiliados";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { eq, asc } from "drizzle-orm";

// GET: Obtener detalle del ticket y sus mensajes
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    
    const headersList = await headers();
    const { user, error } = await auth.api.getSession({
      headers: headersList,
    });

    if (error || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Unimos con la tabla de afiliados para obtener los datos del usuario
    const [ticketData] = await db
      .select({
        id: soporteTickets.id,
        asunto: soporteTickets.asunto,
        estado: soporteTickets.estado,
        categoria: soporteTickets.categoria,
        createdAt: soporteTickets.createdAt,
        afiliadoId: soporteTickets.afiliadoId,
        afiliado: {
          nombres: afiliados.nombres,
          apellidoPaterno: afiliados.apellidoPaterno,
          apellidoMaterno: afiliados.apellidoMaterno,
          correoElectronico: afiliados.correoElectronico,
        }
      })
      .from(soporteTickets)
      .leftJoin(afiliados, eq(soporteTickets.afiliadoId, afiliados.userId))
      .where(eq(soporteTickets.id, ticketId));
    
    if (!ticketData) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }

    const esAdmin = user.role === 'ADMINISTRADOR';
    if (!esAdmin && ticketData.afiliadoId !== user.id) {
      return NextResponse.json({ error: "No tienes permiso para ver este ticket" }, { status: 403 });
    }

    const mensajes = await db.select().from(soporteMensajes)
      .where(eq(soporteMensajes.ticketId, ticketId))
      .orderBy(asc(soporteMensajes.createdAt));

    // Eliminamos afiliadoId de la respuesta para mantener la estructura limpia
    const { afiliadoId, ...ticketResponse } = ticketData;

    return NextResponse.json({ ticket: ticketResponse, mensajes });
  } catch (error) {
    console.error("Error obteniendo detalle del ticket:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PATCH: Actualizar estado del ticket (Solo Admins)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    
    const headersList = await headers();
    const { user, error } = await auth.api.getSession({
      headers: headersList,
    });

    if (error || !user || user.role !== 'ADMINISTRADOR') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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
      .where(eq(soporteTickets.id, ticketId))
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
