import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { mensajes } from "@/lib/db/schema/mensajes"; // Ajusta la ruta si tu schema está en otro lado
import { getCurrentSession } from "@/lib/auth/session"; // Ajusta según tu auth

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    
    // Opcional: Si quieres que solo usuarios logueados envíen, descomenta esto:
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Debes iniciar sesión para enviar mensajes" }, { status: 401 });
    // }

    const body = await request.json();
    const { destinatarioId, nombreRemitente, datosContacto, motivo, cuerpo } = body;

    if (!destinatarioId || !nombreRemitente || !datosContacto.correo || !motivo || !cuerpo) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Insertar en la base de datos
    // Nota: Ajusta los nombres de las columnas si tu schema de 'mensajes' es ligeramente distinto
    await db.insert(mensajes).values({
      remitenteId: session?.user?.id || "anonimo", // O el ID real si está logueado
      destinatarioId: destinatarioId,
      nombreRemitente: nombreRemitente,
      datosContacto: datosContacto, // Asumiendo que es un campo JSON o similar en tu schema
      motivo: motivo,
      cuerpo: cuerpo,
      leido: false,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
