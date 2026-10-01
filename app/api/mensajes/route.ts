import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { mensajes } from "@/lib/db/schema/mensajes";
import { z } from "zod";

const enviarMensajeSchema = z.object({
  destinatarioId: z.string().min(1, "Debes seleccionar un destinatario"),
  motivo: z.string().min(5, "El motivo es obligatorio").max(120),
  contenido: z.string().min(10, "El mensaje es muy corto").max(2000),
  // Campos opcionales de contacto que guardaremos en un JSON o ignoraremos si tu schema no los tiene
  datosContacto: z.object({
    correo: z.string().email().optional(),
    telefono: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = enviarMensajeSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Errores de validación", 
        detalles: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) 
      }, { status: 400 });
    }

    const { destinatarioId, motivo, contenido, datosContacto } = parsed.data;

    // Insertamos usando EXACTAMENTE los campos que existen en tu schema de Drizzle
    await db.insert(mensajes).values({
      nombreParaRespuesta: "Anónimo",
      remitenteId: "anonimo", // O el ID real del usuario si implementas auth aquí
      destinatarioId: destinatarioId,
      motivo: motivo,
      contenido: contenido,
      leido: false,
    });

    return NextResponse.json({ success: true, message: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
