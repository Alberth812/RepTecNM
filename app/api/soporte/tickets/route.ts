import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { soporteTickets, soporteMensajes } from "@/lib/db/schema/soporte";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const sessionData = await auth.api.getSession({ headers: headersList });
    if (!sessionData?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const user = sessionData.user;

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { asunto, descripcion, categoria } = body;

    if (!asunto || !descripcion) {
      return NextResponse.json({ error: "Asunto y descripción son obligatorios" }, { status: 400 });
    }

    const [ticket] = await db.insert(soporteTickets).values({
      afiliadoId: user.id,
      asunto,
      descripcion,
      categoria: categoria || "OTRO",
      estado: "PENDIENTE",
    }).returning();

    // Crear el primer mensaje del hilo
    await db.insert(soporteMensajes).values({
      ticketId: ticket.id,
      autorId: user.id,
      autorRol: "AFILIADO",
      contenido: descripcion,
      esRespuestaOficial: false,
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error) {
    console.error("Error creando ticket:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const headersList = await headers();
    const sessionData = await auth.api.getSession({ headers: headersList });
    if (!sessionData?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const user = sessionData.user;

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const esAdmin = user.role === 'ADMINISTRADOR';

    if (esAdmin) {
      // Los admins ven todos los tickets
      const tickets = await db.select().from(soporteTickets).orderBy(desc(soporteTickets.createdAt));
      return NextResponse.json(tickets);
    } else {
      // Los afiliados solo ven los suyos
      const tickets = await db.select().from(soporteTickets)
        .where(eq(soporteTickets.afiliadoId, user.id))
        .orderBy(desc(soporteTickets.createdAt));
      return NextResponse.json(tickets);
    }
  } catch (error) {
    console.error("Error obteniendo tickets:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
