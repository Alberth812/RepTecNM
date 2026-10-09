import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { soporteTickets, soporteMensajes } from "@/lib/db/schema/soporte";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. DESENVOLVER LA PROMESA DE PARAMS (Obligatorio en Next.js 15+)
    const { id: ticketId } = await params;
    
    const headersList = await headers();
    const sessionData = await auth.api.getSession({ headers: headersList });
    if (!sessionData?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const user = sessionData.user;

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { contenido, esRespuestaOficial } = body;

    // 2. Validación más flexible: mínimo 2 caracteres
    if (!contenido || contenido.trim().length < 2) {
      return NextResponse.json({ error: "El contenido del mensaje es muy corto" }, { status: 400 });
    }

    const [ticket] = await db.select().from(soporteTickets).where(eq(soporteTickets.id, ticketId));
    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }

    const esAdmin = user.role === 'ADMINISTRADOR';
    if (!esAdmin && ticket.afiliadoId !== user.id) {
      return NextResponse.json({ error: "No tienes permiso para acceder a este ticket" }, { status: 403 });
    }

    const autorRol = esAdmin ? "ADMINISTRADOR" : "AFILIADO";

    const [mensaje] = await db.insert(soporteMensajes).values({
      ticketId,
      autorId: user.id,
      autorRol,
      contenido,
      esRespuestaOficial: esRespuestaOficial || false,
    }).returning();

    // Si es una respuesta oficial de un admin, marcamos el ticket como SOLUCIONADO automáticamente
    if (esRespuestaOficial && esAdmin) {
      await db.update(soporteTickets)
        .set({ estado: "SOLUCIONADO", resolvedAt: new Date() })
        .where(eq(soporteTickets.id, ticketId));
    }

    return NextResponse.json({ success: true, mensaje }, { status: 201 });
  } catch (error) {
    console.error("Error enviando mensaje:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
