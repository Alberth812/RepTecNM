import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { soporteTickets, soporteMensajes } from "@/lib/db/schema/soporte";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";

// ESQUEMA DE VALIDACIÓN ZOD
const crearMensajeSchema = z.object({
 contenido: z.string().min(2, "El mensaje debe tener al menos 2 caracteres").max(2000, "El mensaje es demasiado largo"),
 esRespuestaOficial: z.boolean().optional().default(false),
});

export async function POST(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 // 1. DESENVOLVER LA PROMESA DE PARAMS (Obligatorio en Next.js 15+)
 const { id: ticketId } = await params;
 
 const headersList = await headers();
 const sessionData = await auth.api.getSession({ headers: headersList });
 
 if (!sessionData?.user) {
 return NextResponse.json({ error: "No autorizado" }, { status: 401 });
 }
 const user = sessionData.user;

 const body = await req.json();
 
 // Validación estricta con Zod
 const parsed = crearMensajeSchema.safeParse(body);
 if (!parsed.success) {
 return NextResponse.json({ 
 error: "Errores de validación", 
 detalles: parsed.error.issues.map((i) => ({ campo: i.path.join("."), mensaje: i.message })) 
 }, { status: 400 });
 }

 const { contenido, esRespuestaOficial } = parsed.data;

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
 esRespuestaOficial: esRespuestaOficial,
 }).returning();

 // Actualizar estado del ticket a "EN_PROGRESO" si era "PENDIENTE" y responde un admin
 if (esAdmin && ticket.estado === "PENDIENTE") {
 await db.update(soporteTickets)
 .set({ estado: "EN_PROGRESO" })
 .where(eq(soporteTickets.id, ticketId));
 }

 return NextResponse.json({ success: true, mensaje }, { status: 201 });
 } catch (error) {
 console.error("Error creando mensaje en ticket:", error);
 return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
 }
}
