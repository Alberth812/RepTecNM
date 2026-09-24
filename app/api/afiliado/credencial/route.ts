import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { afiliados, datosEmergencia } from "@/lib/db/schema/afiliados";
import { getCurrentSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const [afiliado] = await db
      .select({
        folio: afiliados.folio,
        nombres: afiliados.nombres,
        apellidoPaterno: afiliados.apellidoPaterno,
        apellidoMaterno: afiliados.apellidoMaterno,
        membershipStatus: afiliados.membershipStatus,
      })
      .from(afiliados)
      .where(eq(afiliados.userId, session.user.id));

    if (!afiliado || !afiliado.folio) {
      return NextResponse.json({ error: "Credencial no encontrada" }, { status: 404 });
    }

    // Obtener datos de emergencia
    const [emergencia] = await db
      .select()
      .from(datosEmergencia)
      .where(eq(datosEmergencia.afiliadoId, session.user.id));

    const nombreCompleto = `${afiliado.nombres} ${afiliado.apellidoPaterno} ${afiliado.apellidoMaterno}`.trim();

    return NextResponse.json({
      numeroAfiliado: afiliado.folio,
      folio: afiliado.folio, // En producción, esto sería un hash diferente
      nombreCompleto,
      instituto: "Instituto Tecnológico", // Esto vendría del posgrado más reciente
      anioAprobacion: new Date().getFullYear(),
      datosEmergencia: emergencia
        ? {
            tipoSanguineo: emergencia.tipoSanguineo,
            alergiasCondiciones: emergencia.alergiasCondicionesMedicas || "",
            nombreContacto: emergencia.nombreContacto,
            parentesco: emergencia.parentesco,
            telefonoContacto: emergencia.telefono,
          }
        : undefined,
      mostrarEmergencia: emergencia?.mostrarEnQr || false,
    });
  } catch (error) {
    console.error("Error cargando credencial:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
