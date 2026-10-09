import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { mensajes } from "@/lib/db/schema/mensajes";
import { users } from "@/lib/db/schema/auth-schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";

function sanitizeInput(text: string): string {
  if (!text) return "";
  return text
    .replace(/[<>\"'`;\\]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

// VALIDACIÓN CORREGIDA: destinatarioId ya NO exige UUID, acepta cualquier string válido
const enviarMensajeSchema = z.object({
  destinatarioId: z.string().min(1, "ID de destinatario requerido").max(255, "ID demasiado largo"),
  nombreParaRespuesta: z.string().min(2, "Nombre es obligatorio").max(100, "Nombre demasiado largo"),
  correoParaRespuesta: z.string().email("Correo no válido").max(255).optional().or(z.literal("")),
  telefonoParaRespuesta: z.string().regex(/^\d{10,12}$/, "Teléfono debe tener 10-12 dígitos").optional().or(z.literal("")),
  motivo: z.string().min(5, "El motivo es muy corto").max(150, "El motivo es muy largo"),
  contenido: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(2000, "El mensaje es demasiado largo"),
});

export async function POST(request: NextRequest) {
  try {
    const sessionData = await getCurrentSession();
    
    if (!sessionData || !sessionData.user) {
      return NextResponse.json({ error: "No autorizado. Debes iniciar sesión." }, { status: 401 });
    }

    const currentUserId = sessionData.user.id;
    const body = await request.json();
    
    const parsed = enviarMensajeSchema.safeParse(body);

    if (!parsed.success) {
      const errores = parsed.error.issues.map((i) => ({
        campo: i.path.join("."),
        mensaje: i.message,
      }));
      console.error(" Errores de validación en /api/mensajes:", errores);
      return NextResponse.json(
        { error: "Errores de validación", detalles: errores },
        { status: 400 }
      );
    }

    const {
      destinatarioId,
      nombreParaRespuesta,
      correoParaRespuesta,
      telefonoParaRespuesta,
      motivo,
      contenido,
    } = parsed.data;

    if (destinatarioId === currentUserId) {
      return NextResponse.json({ error: "No puedes enviarte mensajes a ti mismo" }, { status: 400 });
    }

    // CORRECCIÓN DRIZZLE: Usar db.select en lugar de db.query para evitar el bug "decoder"
    const destinatario = await db.select().from(users).where(eq(users.id, destinatarioId)).limit(1);

    if (!destinatario || destinatario.length === 0) {
      return NextResponse.json({ error: "Destinatario no encontrado" }, { status: 404 });
    }

    const [mensaje] = await db.insert(mensajes).values({
      remitenteId: currentUserId,
      destinatarioId,
      nombreParaRespuesta: sanitizeInput(nombreParaRespuesta),
      correoParaRespuesta: correoParaRespuesta ? sanitizeInput(correoParaRespuesta) : null,
      telefonoParaRespuesta: telefonoParaRespuesta ? sanitizeInput(telefonoParaRespuesta) : null,
      motivo: sanitizeInput(motivo),
      contenido: sanitizeInput(contenido),
      leido: false,
    }).returning();

    console.log(` Mensaje enviado de ${currentUserId} a ${destinatarioId}`);

    return NextResponse.json({
      success: true,
      data: mensaje,
      message: "Mensaje enviado correctamente",
    });
  } catch (error) {
    console.error(" Error en POST /api/mensajes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionData = await getCurrentSession();
    if (!sessionData || !sessionData.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const currentUserId = sessionData.user.id;
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo") || "recibidos"; // 'recibidos' o 'enviados'

    let query;
    if (tipo === "enviados") {
      query = db.select({
        id: mensajes.id,
        motivo: mensajes.motivo,
        contenido: mensajes.contenido,
        leido: mensajes.leido,
        createdAt: mensajes.createdAt,
        destinatarioNombre: users.name,
        destinatarioEmail: users.email,
      })
      .from(mensajes)
      .leftJoin(users, eq(mensajes.destinatarioId, users.id))
      .where(eq(mensajes.remitenteId, currentUserId))
      .orderBy(desc(mensajes.createdAt));
    } else {
      query = db.select({
        id: mensajes.id,
        motivo: mensajes.motivo,
        contenido: mensajes.contenido,
        leido: mensajes.leido,
        createdAt: mensajes.createdAt,
        remitenteNombre: users.name,
        remitenteEmail: users.email,
        nombreParaRespuesta: mensajes.nombreParaRespuesta,
        correoParaRespuesta: mensajes.correoParaRespuesta,
        telefonoParaRespuesta: mensajes.telefonoParaRespuesta,
      })
      .from(mensajes)
      .leftJoin(users, eq(mensajes.remitenteId, users.id))
      .where(eq(mensajes.destinatarioId, currentUserId))
      .orderBy(desc(mensajes.createdAt));
    }

    const mensajesList = await query;
    return NextResponse.json({ success: true, data: mensajesList });
  } catch (error) {
    console.error(" Error en GET /api/mensajes:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
