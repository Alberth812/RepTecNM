import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { soporteTickets, soporteMensajes } from "@/lib/db/schema/soporte";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

// ESQUEMA DE VALIDACIÓN ZOD
const crearTicketSchema = z.object({
 asunto: z.string().min(5, "El asunto debe tener al menos 5 caracteres").max(150, "El asunto es demasiado largo"),
 descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(2000, "La descripción es demasiado larga"),
 categoria: z.enum(["TECNICO", "ADMINISTRATIVO", "PAGO", "OTRO"]).optional().default("OTRO"),
});

export async function POST(req: NextRequest) {
 try {
 const headersList = await headers();
 const sessionData = await auth.api.getSession({ headers: headersList });
 
 if (!sessionData?.user) {
 return NextResponse.json({ error: "No autorizado" }, { status: 401 });
 }
 const user = sessionData.user;

 const body = await req.json();
 
 // Validación estricta con Zod
 const parsed = crearTicketSchema.safeParse(body);
 if (!parsed.success) {
 return NextResponse.json({ 
 error: "Errores de validación", 
 detalles: parsed.error.issues.map((i) => ({ campo: i.path.join("."), mensaje: i.message })) 
 }, { status: 400 });
 }

 const { asunto, descripcion, categoria } = parsed.data;

 const [ticket] = await db.insert(soporteTickets).values({
 afiliadoId: user.id,
 asunto,
 descripcion,
 categoria,
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
 
 if (!sessionData?.user) {
 return NextResponse.json({ error: "No autorizado" }, { status: 401 });
 }
 const user = sessionData.user;

 const esAdmin = user.role === 'ADMINISTRADOR';

 const tickets = await db.select()
 .from(soporteTickets)
 .where(esAdmin ? undefined : eq(soporteTickets.afiliadoId, user.id))
 .orderBy(desc(soporteTickets.createdAt));

 return NextResponse.json({ success: true, data: tickets });
 } catch (error) {
 console.error("Error obteniendo tickets:", error);
 return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
 }
}
