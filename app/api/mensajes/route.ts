import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { mensajes } from "@/lib/db/schema/mensajes";
import { users } from "@/lib/db/schema/auth-schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth/session";
import { z } from "zod";
import { requireAfiliadoActivo } from "@/lib/auth/guards";

// Esquema para enviar mensajes (se mantiene igual)
const enviarMensajeSchema = z.object({
 destinatarioId: z.string().min(1, "Debes seleccionar un destinatario"),
 nombreParaRespuesta: z.string().min(2, "Nombre para respuesta es obligatorio").max(100),
 correoParaRespuesta: z.string().email("Correo electrónico no válido"),
 telefonoParaRespuesta: z.string().regex(/^\+?\d{10,12}$/, "Teléfono debe tener 10-12 dígitos").optional().or(z.literal("")),
 motivo: z.string().min(5, "El motivo es muy corto").max(150, "El motivo es muy largo"),
 contenido: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").refine((val) => {
 const palabras = val.trim().split(/\s+/).filter((p) => p.length > 0);
 return palabras.length <= 600;
 }, { message: "El mensaje no puede exceder 600 palabras" }),
});

export async function POST(request: NextRequest) {
  await requireAfiliadoActivo();
 try {
 const session = await getCurrentSession();
 if (!session || !session.user) {
 return NextResponse.json({ error: "No autorizado" }, { status: 401 });
 }

 const body = await request.json();
 const parsed = enviarMensajeSchema.safeParse(body);

 if (!parsed.success) {
 return NextResponse.json({ 
 error: "Errores de validación", 
 detalles: parsed.error.issues.map((i) => ({ campo: i.path.join("."), mensaje: i.message })) 
 }, { status: 400 });
 }

 const { destinatarioId, nombreParaRespuesta, correoParaRespuesta, telefonoParaRespuesta, motivo, contenido } = parsed.data;

 if (destinatarioId === session.user.id) {
 return NextResponse.json({ error: "No puedes enviarte mensajes a ti mismo" }, { status: 400 });
 }

 const destinatario = await db.select({ id: users.id }).from(users).where(eq(users.id, destinatarioId)).limit(1);
 if (destinatario.length === 0) {
 return NextResponse.json({ error: "El destinatario no existe" }, { status: 404 });
 }

 const [mensaje] = await db.insert(mensajes).values({
 remitenteId: session.user.id,
 destinatarioId,
 nombreParaRespuesta,
 correoParaRespuesta,
 telefonoParaRespuesta: telefonoParaRespuesta || null,
 motivo,
 contenido,
 leido: false,
 }).returning();

 return NextResponse.json({ success: true, data: mensaje }, { status: 201 });
 } catch (error) {
 console.error("Error enviando mensaje:", error);
 return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
 }
}

export async function GET(request: NextRequest) {
  await requireAfiliadoActivo();
 try {
 const session = await getCurrentSession();
 if (!session || !session.user) {
 return NextResponse.json({ error: "No autorizado" }, { status: 401 });
 }

 const { searchParams } = new URL(request.url);
 const tipo = searchParams.get("tipo") || "recibidos";
 const soloNoLeidos = searchParams.get("noLeidos") === "true";

 const condiciones = [
 tipo === "recibidos" 
 ? eq(mensajes.destinatarioId, session.user.id)
 : eq(mensajes.remitenteId, session.user.id),
 ];

 if (tipo === "recibidos") {
 condiciones.push(eq(mensajes.eliminadoParaDestinatario, false));
 if (soloNoLeidos) {
 condiciones.push(eq(mensajes.leido, false));
 }
 }

 // 1. Obtener mensajes con datos del remitente (JOIN con users)
 const resultados = await db
 .select({
 id: mensajes.id,
 motivo: mensajes.motivo,
 contenido: mensajes.contenido,
 leido: mensajes.leido,
 createdAt: mensajes.createdAt,
 remitenteId: mensajes.remitenteId,
 destinatarioId: mensajes.destinatarioId,
 nombreParaRespuesta: mensajes.nombreParaRespuesta,
 correoParaRespuesta: mensajes.correoParaRespuesta,
 telefonoParaRespuesta: mensajes.telefonoParaRespuesta,
 remitenteNombre: users.name,
 })
 .from(mensajes)
 .innerJoin(users, eq(mensajes.remitenteId, users.id))
 .where(and(...condiciones))
 .orderBy(desc(mensajes.createdAt))
 .limit(100);

 // 2. Obtener nombres de destinatarios para la vista de "enviados" (evita N+1 queries)
 const userIds = [...new Set(resultados.map(r => r.destinatarioId).filter(Boolean) as string[])];
 let destinatariosMap: Record<string, string> = {};
 
 if (userIds.length > 0) {
 const destUsers = await db
 .select({ id: users.id, name: users.name })
 .from(users)
 .where(inArray(users.id, userIds));
 
 destinatariosMap = Object.fromEntries(destUsers.map(u => [u.id, u.name || "Desconocido"]));
 }

 // 3. Formatear la respuesta para que coincida con el tipo Mensaje del frontend
 const mensajesFormateados = resultados.map(r => ({
 id: r.id,
 motivo: r.motivo,
 contenido: r.contenido,
 leido: r.leido,
 createdAt: r.createdAt.toISOString(),
 nombreRemitente: r.remitenteNombre || "Desconocido",
 nombreDestinatario: destinatariosMap[r.destinatarioId] || "Desconocido",
 datosContacto: r.nombreParaRespuesta ? {
 nombre: r.nombreParaRespuesta,
 email: r.correoParaRespuesta || undefined,
 telefono: r.telefonoParaRespuesta || undefined,
 } : null,
 }));

 return NextResponse.json({ data: mensajesFormateados });
 } catch (error) {
 console.error("Error cargando mensajes:", error);
 return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
 }
}
