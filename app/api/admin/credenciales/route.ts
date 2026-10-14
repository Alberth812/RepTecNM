import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { afiliados, datosEmergencia } from "@/lib/db/schema/afiliados";
import { users } from "@/lib/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
 try {
 const session = await getCurrentSession();
 if (!session || !session.user) {
 return NextResponse.json({ error: "No autorizado" }, { status: 401 });
 }

 const { searchParams } = new URL(request.url);
 const q = searchParams.get("q");
 const estado = searchParams.get("estado");

 // 1. Consulta con LEFT JOIN a users para obtener el email correctamente
 const resultados = await db
 .select({
 userId: afiliados.userId,
 folio: afiliados.folio,
 nombres: afiliados.nombres,
 apellidoPaterno: afiliados.apellidoPaterno,
 apellidoMaterno: afiliados.apellidoMaterno,
 membershipStatus: afiliados.membershipStatus,
 fotografiaArchivoId: afiliados.fotografiaArchivoId,
 email: users.email, // Ahora sí funciona porque viene de la tabla users
 })
 .from(afiliados)
 .leftJoin(users, eq(afiliados.userId, users.id));

 // 2. Filtrado en memoria (más seguro y evita errores complejos de Drizzle con filtros opcionales)
 let filtrados = resultados;

 if (estado) {
 filtrados = filtrados.filter(a => a.membershipStatus === estado);
 }

 if (q) {
 const queryLower = q.toLowerCase();
 filtrados = filtrados.filter(a => 
 a.nombres?.toLowerCase().includes(queryLower) ||
 a.apellidoPaterno?.toLowerCase().includes(queryLower) ||
 a.apellidoMaterno?.toLowerCase().includes(queryLower) ||
 a.folio?.toLowerCase().includes(queryLower) ||
 a.email?.toLowerCase().includes(queryLower)
 );
 }

 // 3. Para cada afiliado, obtener sus datos de emergencia
 const afiliadosConEmergencia = await Promise.all(
 filtrados.map(async (a) => {
 const [emergencia] = await db
 .select()
 .from(datosEmergencia)
 .where(eq(datosEmergencia.afiliadoId, a.userId));

 const nombreCompleto = `${a.nombres || ""} ${a.apellidoPaterno || ""} ${a.apellidoMaterno || ""}`.trim();

 return {
 userId: a.userId,
 nombreCompleto,
 folio: a.folio,
 membershipStatus: a.membershipStatus,
 fotografiaArchivoId: a.fotografiaArchivoId,
 email: a.email,
 datosEmergencia: emergencia
 ? {
 tipoSanguineo: emergencia.tipoSanguineo || "N/A",
 alergiasCondiciones: emergencia.alergiasCondicionesMedicas || "Ninguna",
 nombreContacto: emergencia.nombreContacto || "N/A",
 parentesco: emergencia.parentesco || "N/A",
 telefonoContacto: emergencia.telefono || "N/A",
 }
 : null,
 };
 })
 );

 return NextResponse.json(afiliadosConEmergencia);
 } catch (error) {
 console.error(" Error cargando credenciales:", error);
 return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
 }
}
