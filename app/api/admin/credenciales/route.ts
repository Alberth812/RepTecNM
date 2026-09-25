import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { afiliados, datosEmergencia } from "@/lib/db/schema/afiliados";
import { users } from "@/lib/db/schema/auth-schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { eq, ilike, or, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const headersList = await headers();
    const { user, error } = await auth.api.getSession({ headers: headersList });

    if (error || !user || user.role !== "ADMINISTRADOR") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const estado = searchParams.get("estado") || "";

    // Construir condiciones de búsqueda
    const conditions = [];

    if (query) {
      // Buscar por nombre completo o folio
      const searchCondition = or(
        ilike(afiliados.nombres, `%${query}%`),
        ilike(afiliados.apellidoPaterno, `%${query}%`),
        ilike(afiliados.apellidoMaterno, `%${query}%`),
        ilike(afiliados.folio, `%${query}%`)
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    if (estado) {
      conditions.push(eq(afiliados.membershipStatus, estado as any));
    }

    // Ejecutar consulta
    const afiliadosResult = await db
      .select({
        userId: afiliados.userId,
        nombres: afiliados.nombres,
        apellidoPaterno: afiliados.apellidoPaterno,
        apellidoMaterno: afiliados.apellidoMaterno,
        folio: afiliados.folio,
        membershipStatus: afiliados.membershipStatus,
        fotografiaArchivoId: afiliados.fotografiaArchivoId,
        email: users.email,
      })
      .from(afiliados)
      .leftJoin(users, eq(afiliados.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(50);

    // Obtener datos de emergencia para cada afiliado
    const afiliadosConEmergencia = await Promise.all(
      afiliadosResult.map(async (afiliado) => {
        const [emergencia] = await db
          .select()
          .from(datosEmergencia)
          .where(eq(datosEmergencia.afiliadoId, afiliado.userId));

        return {
          ...afiliado,
          nombreCompleto: `${afiliado.nombres || ""} ${afiliado.apellidoPaterno || ""} ${afiliado.apellidoMaterno || ""}`.trim(),
          datosEmergencia: emergencia || null,
        };
      })
    );

    return NextResponse.json(afiliadosConEmergencia);
  } catch (error) {
    console.error("Error buscando afiliados:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
