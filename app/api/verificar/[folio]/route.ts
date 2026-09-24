import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { afiliados } from "@/lib/db/schema/afiliados";
import { eq } from "drizzle-orm";
import { isValidFolioFormat } from "@/lib/utils/sanitize";

// Rate limiting simple en memoria para verificación
const verificationLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_VERIFICATIONS_PER_HOUR = 30;
const HOUR_MS = 60 * 60 * 1000;

function checkVerificationLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = verificationLimits.get(ip);

  if (!entry || now > entry.resetAt) {
    verificationLimits.set(ip, { count: 1, resetAt: now + HOUR_MS });
    return { allowed: true, remaining: MAX_VERIFICATIONS_PER_HOUR - 1 };
  }

  if (entry.count >= MAX_VERIFICATIONS_PER_HOUR) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_VERIFICATIONS_PER_HOUR - entry.count };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folio: string }> }
) {
  try {
    const { folio } = await params;

    // 1. Validar formato de folio
    if (!folio || !isValidFolioFormat(folio)) {
      return NextResponse.json(
        { error: "Formato de folio inválido" },
        { status: 400 }
      );
    }

    // 2. Rate limiting por IP
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    
    const limit = checkVerificationLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta más tarde." },
        { status: 429 }
      );
    }

    // 3. Consultar afiliado
    const resultado = await db
      .select({
        userId: afiliados.userId,
        folio: afiliados.folio,
        nombres: afiliados.nombres,
        apellidoPaterno: afiliados.apellidoPaterno,
        apellidoMaterno: afiliados.apellidoMaterno,
        membershipStatus: afiliados.membershipStatus,
        autorizaPublicacion: afiliados.autorizaPublicacion,
        areaConocimiento: afiliados.areaConocimiento,
      })
      .from(afiliados)
      .where(eq(afiliados.folio, folio))
      .limit(1);

    const afiliado = resultado[0];

    if (!afiliado) {
      return NextResponse.json({
        encontrado: false,
        folio,
      });
    }

    const nombreCompleto = `${afiliado.nombres} ${afiliado.apellidoPaterno} ${afiliado.apellidoMaterno}`.trim();

    return NextResponse.json({
      encontrado: true,
      folio: afiliado.folio,
      nombre: nombreCompleto,
      numero: afiliado.folio,
      posgrado: Array.isArray(afiliado.areaConocimiento) && afiliado.areaConocimiento.length > 0 
        ? afiliado.areaConocimiento.join(", ") 
        : "Profesional TecNM",
      instituto: "Tecnológico Nacional de México",
      estado: afiliado.membershipStatus,
      idAfiliado: afiliado.userId,
      contactoPublico: afiliado.autorizaPublicacion,
      rateLimit: {
        remaining: limit.remaining
      }
    });
  } catch (error) {
    console.error("Error en verificación de folio:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
