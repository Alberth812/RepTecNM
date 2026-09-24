import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { soporteTickets, soporteMensajes } from "@/lib/db/schema/soporte";
import { getCurrentSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { contenido, esRespuestaOficial } = body;

    if (!contenido || contenido.trim().length < 5) {
      return NextResponse.json({ error: "El contenido del mensaje es muy corto" }, { status: 400 });
    }

    const [ticket] = await db.select().from(soporteTickets).where(eq(soporteTickets.id, params.id));
    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }

    const esAdmin = session.user.rol === 'ADMINISTRADOR' || session.user.roles?.includes('ADMINISTRADOR');
    if (!esAdmin && ticket.afiliadoId !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para acceder a este ticket" }, { status: 403 });
    }

    const autorRol = esAdmin ? "ADMINISTRADOR" : "AFILIADO";

    const [mensaje] = await db.insert(soporteMensajes).values({
      ticketId: params.id,
      autorId: session.user.id,
      autorRol,
      contenido,
      esRespuestaOficial: esRespuestaOficial || false,
    }).returning();

    // Si es una respuesta oficial de un admin, marcamos el ticket como SOLUCIONADO automáticamente
    if (esRespuestaOficial && esAdmin) {
      await db.update(soporteTickets)
        .set({ estado: "SOLUCIONADO", resolvedAt: new Date() })
        .where(eq(soporteTickets.id, params.id));
    }

    return NextResponse.json({ success: true, mensaje }, { status: 201 });
  } catch (error) {
    console.error("Error enviando mensaje:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
