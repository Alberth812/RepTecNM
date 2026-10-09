import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { afiliados } from "@/lib/db/schema/afiliados";
import { eq, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folio: string }> }
) {
  try {
    const { folio } = await params;

    console.log("[VERIFICAR] Buscando folio:", JSON.stringify(folio));

    if (!folio) {
      return NextResponse.json({ encontrado: false, folio: null });
    }

    // Consulta directa SIN relaciones (evita errores de db.query con 'with')
    const resultado = await db
      .select({
        userId: afiliados.userId,
        folio: afiliados.folio,
        nombres: afiliados.nombres,
        apellidoPaterno: afiliados.apellidoPaterno,
        apellidoMaterno: afiliados.apellidoMaterno,
        membershipStatus: afiliados.membershipStatus,
        fotografiaArchivoId: afiliados.fotografiaArchivoId,
        areaConocimiento: afiliados.areaConocimiento,
      })
      .from(afiliados)
      .where(eq(afiliados.folio, folio.trim()))
      .limit(1);

    console.log("[VERIFICAR] Resultado:", resultado.length, "registros encontrados");

    if (resultado.length === 0) {
      return NextResponse.json({ encontrado: false, folio });
    }

    const afiliado = resultado[0];
    const nombreCompleto = `${afiliado.nombres || ""} ${afiliado.apellidoPaterno || ""} ${afiliado.apellidoMaterno || ""}`.trim();

    console.log("[VERIFICAR] Afiliado encontrado:", nombreCompleto, "Estado:", afiliado.membershipStatus);

    return NextResponse.json({
      encontrado: true,
      folio: afiliado.folio,
      nombreCompleto,
      membershipStatus: afiliado.membershipStatus,
      fotografiaArchivoId: afiliado.fotografiaArchivoId,
      instituto: "Tecnológico Nacional de México",
      anioAprobacion: new Date().getFullYear(),
      areaConocimiento: Array.isArray(afiliado.areaConocimiento) ? afiliado.areaConocimiento : [],
    });
  } catch (error) {
    console.error("[VERIFICAR] Error:", error);
    return NextResponse.json({ 
      encontrado: false, 
      folio: null, 
      error: "Error interno del servidor" 
    });
  }
}
