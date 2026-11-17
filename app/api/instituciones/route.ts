// Ubicación sugerida: src/app/api/instituciones/route.ts (ruta fija de Next.js App Router, no mover)

import { NextRequest, NextResponse } from "next/server";

import { requireAdminGeneral } from "@/lib/auth/session";
import { handleApiError } from "@/lib/instituciones/handle-api-error";
import {
 createInstitucion,
 listInstituciones,
} from "@/lib/instituciones/queries/instituciones";
import {
 createInstitucionSchema,
 listInstitucionesQuerySchema,
} from "@/lib/validation/instituciones";

export async function GET(request: NextRequest) {
 try {
 await requireAdminGeneral();

 const searchParams = request.nextUrl.searchParams;

 const rawNombre = searchParams.get("nombre");
 const rawEstado = searchParams.get("estado");

 const parsed = listInstitucionesQuerySchema.parse({
 page: searchParams.get("page") ?? undefined,
 pageSize: searchParams.get("pageSize") ?? undefined,
 nombre: rawNombre && rawNombre.trim() !== "" ? rawNombre : undefined,
 estado: rawEstado && rawEstado.trim() !== "" ? rawEstado : undefined,
 });

 const { rows, total } = await listInstituciones(parsed);
 const totalPages = total === 0 ? 0 : Math.ceil(total / parsed.pageSize);

 return NextResponse.json({
 data: rows,
 pagination: {
 page: parsed.page,
 pageSize: parsed.pageSize,
 total,
 totalPages,
 },
 });
 } catch (error) {
 return handleApiError(error);
 }
}

export async function POST(request: NextRequest) {
 try {
 await requireAdminGeneral();

 const body = await request.json();
 const input = createInstitucionSchema.parse(body);

 const institucion = await createInstitucion(input);

 return NextResponse.json({ data: institucion }, { status: 201 });
 } catch (error) {
 return handleApiError(error);
 }
}
