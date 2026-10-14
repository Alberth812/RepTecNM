// app/api/afiliados/investigacion/route.ts
import { NextRequest, NextResponse } from "next/server";

// Ajusta estos tres imports a las rutas reales de tu proyecto.
import { requireAfiliado } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError } from "@/lib/errors";

import { afiliadosInvestigacion } from "@/lib/db/schema/afiliados-investigacion";
import { afiliadoInvestigacionSchema } from "@/lib/validation/afiliados-investigacion/investigacion";

/**
 * GET: devuelve el registro de investigación del afiliado autenticado
 * (o `data: null` si todavía no ha llenado esta sección).
 */
export async function GET() {
 try {
 const { afiliado } = await requireAfiliado();

 const registro = await db.query.afiliadosInvestigacion.findFirst({
 where: {
 userId: afiliado.userId,
 },
 });

 return NextResponse.json({ data: registro ?? null });
 } catch (error) {
 return toErrorResponse(error);
 }
}

/**
 * PUT: crea o actualiza (upsert) el registro de investigación del afiliado
 * autenticado. Valida el body con el mismo schema Zod que usa el frontend,
 * incluyendo las reglas cruzadas (superRefine).
 */
export async function PUT(request: NextRequest) {
 try {
 const { afiliado } = await requireAfiliado();

 let json: unknown;
 try {
 json = await request.json();
 } catch {
 return NextResponse.json(
 { error: "Cuerpo de la petición inválido (se esperaba JSON)." },
 { status: 400 },
 );
 }

 const parsed = afiliadoInvestigacionSchema.safeParse(json);
 if (!parsed.success) {
 return NextResponse.json(
 {
 error: "Los datos de investigación no son válidos.",
 fieldErrors: parsed.error.flatten().fieldErrors,
 },
 { status: 400 },
 );
 }

 const [registro] = await db
 .insert(afiliadosInvestigacion)
 .values({ userId: afiliado.userId, ...parsed.data })
 .onConflictDoUpdate({
 target: afiliadosInvestigacion.userId,
 set: { ...parsed.data, updatedAt: new Date() },
 })
 .returning();

 return NextResponse.json({ data: registro });
 } catch (error) {
 return toErrorResponse(error);
 }
}

/**
 * Traduce un error a una respuesta HTTP.
 *
 * Asume que `ApiError` expone `.status` y `.message` (como se ve en
 * `ApiError.forbidden("...")`). Si ya tienes un wrapper/middleware que
 * captura `ApiError` globalmente para tus route handlers, puedes borrar
 * esta función y dejar que el error se propague en su lugar.
 */
function toErrorResponse(error: unknown) {
 if (error instanceof ApiError) {
 return NextResponse.json(
 { error: error.message },
 { status: error.status },
 );
 }

 console.error("[api/afiliados/investigacion]", error);
 return NextResponse.json(
 { error: "Ocurrió un error inesperado." },
 { status: 500 },
 );
}
