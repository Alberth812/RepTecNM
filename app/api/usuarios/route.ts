/**
 * API para buscar usuarios (afiliados y administradores)
 * 
 * GET /api/usuarios?q=termino_busqueda
 * 
 * Retorna una lista de usuarios que coinciden con el término de búsqueda
 * en su nombre o correo electrónico.
 * 
 * Uso: Para el selector de destinatarios en el formulario de mensajería
 */
import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema/auth-schema";
import { ilike, or } from "drizzle-orm";
import { ok, toErrorResponse } from "@/lib/http/responses";

export async function GET(request: NextRequest) {
 try {
 // Verificar que el usuario está autenticado
 await requireSession();
 
 // Obtener el parámetro de búsqueda de la URL
 const searchParams = request.nextUrl.searchParams;
 const q = searchParams.get("q") || "";

 // Si el término de búsqueda es muy corto, retornar vacío
 if (q.length < 2) {
 return ok([]);
 }

 // Buscar usuarios que coincidan en nombre o correo (case-insensitive)
 const resultados = await db
 .select({ 
 id: users.id, 
 name: users.name, 
 email: users.email, 
 role: users.role 
 })
 .from(users)
 .where(or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`)))
 .limit(20); // Limitar a 20 resultados para performance

 return ok(resultados);
 } catch (error) {
 return toErrorResponse(error);
 }
}
