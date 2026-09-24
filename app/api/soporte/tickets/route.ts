import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { soporteTickets, soporteMensajes } from "@/lib/db/schema/soporte";
import { getCurrentSession, requireAfiliado } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAfiliado(["ACTIVO"]);
    const body = await req.json();
    const { asunto, descripcion, categoria } = body;

    if (!asunto || !descripcion) {
      return NextResponse.json({ error: "Asunto y descripción son obligatorios" }, { status: 400 });
    }

    const [ticket] = await db.insert(soporteTickets).values({
      afiliadoId: session.user.id,
      asunto,
      descripcion,
      categoria: categoria || "OTRO",
      estado: "PENDIENTE",
    }).returning();

    // Crear el primer mensaje del hilo con la descripción inicial
    await db.insert(soporteMensajes).values({
      ticketId: ticket.id,
      autorId: session.user.id,
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
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    // Ajusta 'rol' o 'roles' según cómo esté estructurado tu objeto de sesión
    const esAdmin = session.user.rol === 'ADMINISTRADOR' || session.user.roles?.includes('ADMINISTRADOR');

    if (esAdmin) {
      const tickets = await db.select().from(soporteTickets).orderBy(desc(soporteTickets.createdAt));
      return NextResponse.json(tickets);
    } else {
      const tickets = await db.select().from(soporteTickets)
        .where(eq(soporteTickets.afiliadoId, session.user.id))
        .orderBy(desc(soporteTickets.createdAt));
      return NextResponse.json(tickets);
    }
  } catch (error) {
    console.error("Error obteniendo tickets:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
