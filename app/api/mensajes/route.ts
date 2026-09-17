/**
 * API de Mensajería Interna
 * POST /api/mensajes - Enviar un nuevo mensaje
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { mensajes } from "@/lib/db/schema/mensajes";
import { users } from "@/lib/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Esquema de validación con reglas estrictas:
 * - Nombre: OBLIGATORIO
 * - Correo: OBLIGATORIO
 * - Teléfono: OPCIONAL (10-12 dígitos para México)
 * - Mensaje: máximo 600 palabras
 */
const enviarMensajeSchema = z.object({
  destinatarioId: z.string().min(1, "Debes seleccionar un destinatario"),
  nombreParaRespuesta: z.string().min(2, "Nombre para respuesta es obligatorio").max(100),
  correoParaRespuesta: z.string().email("Correo electrónico no válido"),
  telefonoParaRespuesta: z
    .string()
    .regex(/^\+?\d{10,12}$/, "Teléfono debe tener 10-12 dígitos (ej: 5512345678 o +525512345678)")
    .optional()
    .or(z.literal("")),
  motivo: z.string().min(5, "El motivo es muy corto").max(150, "El motivo es muy largo"),
  contenido: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .refine(
      (val) => {
        const palabras = val.trim().split(/\s+/).filter((p) => p.length > 0);
        return palabras.length <= 600;
      },
      { message: "El mensaje no puede exceder 600 palabras" }
    ),
});

export async function POST(request: NextRequest) {
  try {
    const usuario = await getCurrentUser();
    if (!usuario) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = enviarMensajeSchema.safeParse(body);

    if (!parsed.success) {
      const errores = parsed.error.issues.map((i) => ({
        campo: i.path.join("."),
        mensaje: i.message,
      }));
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

    if (destinatarioId === usuario.id) {
      return NextResponse.json(
        { error: "No puedes enviarte mensajes a ti mismo" },
        { status: 400 }
      );
    }

    const destinatario = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, destinatarioId))
      .limit(1);

    if (destinatario.length === 0) {
      return NextResponse.json(
        { error: "El destinatario no existe" },
        { status: 404 }
      );
    }

    const [mensaje] = await db
      .insert(mensajes)
      .values({
        remitenteId: usuario.id,
        destinatarioId,
        nombreParaRespuesta,
        correoParaRespuesta: correoParaRespuesta,
        telefonoParaRespuesta: telefonoParaRespuesta || null,
        motivo,
        contenido,
        leido: false,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: mensaje },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/mensajes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
