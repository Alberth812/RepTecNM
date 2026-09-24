import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { afiliados, datosEmergencia } from "@/lib/db/schema/afiliados";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ folio: string }> }
) {
  try {
    const { folio } = await params;

    // 1. Buscar afiliado por folio (RF-CRED-003, RF-CRED-010)
    const [afiliado] = await db
      .select({
        id: afiliados.userId,
        nombres: afiliados.nombres,
        apellidoPaterno: afiliados.apellidoPaterno,
        apellidoMaterno: afiliados.apellidoMaterno,
        fotografiaArchivoId: afiliados.fotografiaArchivoId,
        membershipStatus: afiliados.membershipStatus,
        mostrarEnQr: afiliados.mostrarEnQr,
      })
      .from(afiliados)
      .where(eq(afiliados.folio, folio));

    if (!afiliado) {
      return NextResponse.json({ error: "Credencial no encontrada" }, { status: 404 });
    }

    let datosEmergenciaPublicos = null;

    // 2. Solo incluir datos de emergencia si el afiliado lo autorizó explícitamente (RF-CRED-008)
    if (afiliado.mostrarEnQr) {
      const [emergencia] = await db
        .select({
          nombreContacto: datosEmergencia.nombreContacto,
          parentesco: datosEmergencia.parentesco,
          parentescoOtro: datosEmergencia.parentescoOtro,
          telefono: datosEmergencia.telefono,
          tipoSanguineo: datosEmergencia.tipoSanguineo,
          alergiasCondicionesMedicas: datosEmergencia.alergiasCondicionesMedicas,
        })
        .from(datosEmergencia)
        .where(eq(datosEmergencia.afiliadoId, afiliado.id));
      
      datosEmergenciaPublicos = emergencia || null;
    }

    // 3. Responder con la estructura mínima y segura (RF-CRED-009)
    return NextResponse.json({
      afiliado: {
        nombreCompleto: `${afiliado.nombres} ${afiliado.apellidoPaterno} ${afiliado.apellidoMaterno}`.trim(),
        membershipStatus: afiliado.membershipStatus,
        fotografiaArchivoId: afiliado.fotografiaArchivoId,
        datosEmergencia: datosEmergenciaPublicos,
      },
    });
  } catch (error) {
    console.error("Error verificando folio:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
