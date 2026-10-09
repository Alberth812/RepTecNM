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
        userId: afiliados.userId,
        folio: afiliados.folio,
        nombres: afiliados.nombres,
        apellidoPaterno: afiliados.apellidoPaterno,
        apellidoMaterno: afiliados.apellidoMaterno,
        membershipStatus: afiliados.membershipStatus,
        fotografiaArchivoId: afiliados.fotografiaArchivoId,
        createdAt: afiliados.createdAt,
      })
      .from(afiliados)
      .where(eq(afiliados.userId, session.user.id));

    if (!afiliado || afiliado.membershipStatus !== "ACTIVO") {
      return NextResponse.json(
        { error: "Credencial no disponible" },
        { status: 404 }
      );
    }

    // Obtener datos de emergencia
    const [emergencia] = await db
      .select()
      .from(datosEmergencia)
      .where(eq(datosEmergencia.afiliadoId, session.user.id));

    const nombreCompleto = `${afiliado.nombres || ""} ${
      afiliado.apellidoPaterno || ""
    } ${afiliado.apellidoMaterno || ""}`.trim();

    // Generar folio si no existe
    let folioFinal = afiliado.folio;
    if (!folioFinal) {
      // Generar folio temporal (en producción, usarías la función del script)
      const anio = new Date().getFullYear().toString().slice(-2);
      const mes = String(new Date().getMonth() + 1).padStart(2, "0");
      const dia = String(new Date().getDate()).padStart(2, "0");
      const iniciales = `${afiliado.nombres?.charAt(0)}${afiliado.apellidoPaterno?.charAt(0)}H`.toUpperCase();
      const aleatorio = Math.floor(1000 + Math.random() * 9000);
      folioFinal = `REP-AF${anio}${mes}${dia}-${iniciales}-${aleatorio}`;
      
      // Actualizar en BD
      await db
        .update(afiliados)
        .set({ folio: folioFinal })
        .where(eq(afiliados.userId, session.user.id));
    }

    return NextResponse.json({
      numeroAfiliado: folioFinal,
      folio: folioFinal,
      nombreCompleto: nombreCompleto || "Nombre no disponible",
      instituto: "Instituto Tecnológico", // Esto vendría de posgrados
      anioAprobacion: new Date(afiliado.createdAt).getFullYear(),
      fotografiaArchivoId: afiliado.fotografiaArchivoId,
      datosEmergencia: emergencia
        ? {
            tipoSanguineo: emergencia.tipoSanguineo || "N/A",
            alergiasCondiciones: emergencia.alergiasCondicionesMedicas || "Ninguna",
            nombreContacto: emergencia.nombreContacto || "N/A",
            parentesco: emergencia.parentesco || "N/A",
            telefonoContacto: emergencia.telefono || "N/A",
          }
        : null,
    });
  } catch (error) {
    console.error(" Error cargando credencial:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
