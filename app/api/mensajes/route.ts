/**
 * API de Mensajería Interna con seguridad robusta
 * POST /api/mensajes - Enviar un nuevo mensaje
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { mensajes } from "@/lib/db/schema/mensajes";
import { users } from "@/lib/db/schema/auth-schema";
import { afiliados } from "@/lib/db/schema/afiliados";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { checkMessageRateLimit, checkDailyMessageLimit } from "@/lib/rate-limit/messages";
import { sanitizeHtml, sanitizeEmail } from "@/lib/utils/sanitize";

/**
 * Esquema de validación con reglas estrictas
 */
const enviarMensajeSchema = z.object({
  destinatarioId: z.string().uuid("ID de destinatario inválido"),
  nombreParaRespuesta: z
    .string()
    .min(2, "Nombre para respuesta es obligatorio")
    .max(100, "Nombre demasiado largo")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Nombre solo puede contener letras"),
  correoParaRespuesta: z
    .string()
    .email("Correo electrónico no válido")
    .max(255, "Correo demasiado largo"),
  telefonoParaRespuesta: z
    .string()
    .regex(/^\+?\d{10,12}$/, "Teléfono debe tener 10-12 dígitos (ej: 5512345678 o +525512345678)")
    .optional()
    .or(z.literal("")),
  motivo: z
    .string()
    .min(5, "El motivo es muy corto")
    .max(150, "El motivo es muy largo")
    .refine((val) => !/<script|javascript:|on\w+=/gi.test(val), "Motivo contiene contenido no permitido"),
  contenido: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(10000, "El mensaje es demasiado largo")
    .refine(
      (val) => {
        const palabras = val.trim().split(/\s+/).filter((p) => p.length > 0);
        return palabras.length <= 600;
      },
      { message: "El mensaje no puede exceder 600 palabras" }
    )
    .refine((val) => !/<script|javascript:|on\w+=/gi.test(val), "Mensaje contiene contenido no permitido"),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener sesión
    const session = await getCurrentSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2. Rate limiting por hora
    const hourlyLimit = checkMessageRateLimit(session.user.id);
    if (!hourlyLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Has alcanzado el límite de mensajes por hora. Intenta más tarde.",
          resetAt: new Date(hourlyLimit.resetAt).toISOString()
        },
        { status: 429 }
      );
    }

    // 3. Rate limiting por día
    const dailyLimit = checkDailyMessageLimit(session.user.id);
    if (!dailyLimit.allowed) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de mensajes por día. Intenta mañana." },
        { status: 429 }
      );
    }

    // 4. Parsear y validar el body
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

    // 5. Validar que el remitente tenga email verificado
    const remitente = await db
      .select({ emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!remitente[0]?.emailVerified) {
      return NextResponse.json(
        { error: "Debes verificar tu correo electrónico antes de enviar mensajes" },
        { status: 403 }
      );
    }

    // 6. Validar que el remitente sea afiliado ACTIVO
    const remitenteAfiliado = await db
      .select({ membershipStatus: afiliados.membershipStatus })
      .from(afiliados)
      .where(eq(afiliados.userId, session.user.id))
      .limit(1);

    if (!remitenteAfiliado[0] || remitenteAfiliado[0].membershipStatus !== "ACTIVO") {
      return NextResponse.json(
        { error: "Solo los afiliados activos pueden enviar mensajes" },
        { status: 403 }
      );
    }

    // 7. No permitir enviarse mensajes a uno mismo
    if (destinatarioId === session.user.id) {
      return NextResponse.json(
        { error: "No puedes enviarte mensajes a ti mismo" },
        { status: 400 }
      );
    }

    // 8. Validar que el destinatario exista y sea ACTIVO
    const destinatario = await db
      .select({ 
        id: users.id,
        emailVerified: users.emailVerified
      })
      .from(users)
      .where(eq(users.id, destinatarioId))
      .limit(1);

    if (!destinatario[0]) {
      return NextResponse.json(
        { error: "El destinatario no existe" },
        { status: 404 }
      );
    }

    const destinatarioAfiliado = await db
      .select({ membershipStatus: afiliados.membershipStatus })
      .from(afiliados)
      .where(eq(afiliados.userId, destinatarioId))
      .limit(1);

    if (!destinatarioAfiliado[0] || destinatarioAfiliado[0].membershipStatus !== "ACTIVO") {
      return NextResponse.json(
        { error: "No puedes enviar mensajes a este usuario" },
        { status: 403 }
      );
    }

    // 9. Sanitizar datos
    const nombreLimpio = sanitizeHtml(nombreParaRespuesta);
    const correoLimpio = sanitizeEmail(correoParaRespuesta);
    const motivoLimpio = sanitizeHtml(motivo);
    const contenidoLimpio = sanitizeHtml(contenido);

    // 10. Insertar el mensaje en la base de datos
    const [mensaje] = await db
      .insert(mensajes)
      .values({
        remitenteId: session.user.id,
        destinatarioId,
        nombreParaRespuesta: nombreLimpio,
        correoParaRespuesta: correoLimpio,
        telefonoParaRespuesta: telefonoParaRespuesta || null,
        motivo: motivoLimpio,
        contenido: contenidoLimpio,
        leido: false,
      })
      .returning();

    return NextResponse.json(
      { 
        success: true, 
        data: mensaje,
        rateLimit: {
          remaining: hourlyLimit.remaining,
          resetAt: new Date(hourlyLimit.resetAt).toISOString()
        }
      },
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
