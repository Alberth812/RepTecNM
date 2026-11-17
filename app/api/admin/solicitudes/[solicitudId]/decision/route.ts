import {
 NoAutenticadoError,
 NoAutorizadoError,
 requireAdminGeneralv2,
} from "@/lib/auth/session";
import { revisionDecisionEnum } from "@/lib/db/schema/enums";
import {
 resolverSolicitud,
 SolicitudNoEncontradaError,
 SolicitudNoVigenteError,
 SolicitudYaAtendidaError,
} from "@/lib/db/solicitudes/queries";
import { isUniqueViolation } from "@/lib/db/pg-errors";
import { toErrorResponse } from "@/lib/http/responses";
import { NextResponse } from "next/server";
import { z } from "zod";

const decisionSchema = z
 .object({
 decision: z.enum(revisionDecisionEnum.enumValues),
 observaciones: z.string().trim().max(2000).optional(),
 })
 .superRefine((data, ctx) => {
 if (
 data.decision === "REQUIERE_CORRECCION" &&
 (!data.observaciones || data.observaciones.length === 0)
 ) {
 ctx.addIssue({
 code: "custom",
 path: ["observaciones"],
 message: "Debes indicar las observaciones para requerir correcciones.",
 });
 }
 });

export async function POST(
 request: Request,
 { params }: { params: Promise<{ solicitudId: string }> },
) {
 let admin: Awaited<ReturnType<typeof requireAdminGeneralv2>>["admin"];
 try {
 ({ admin } = await requireAdminGeneralv2());
 } catch (error) {
 if (error instanceof NoAutenticadoError) {
 return NextResponse.json({ message: error.message }, { status: 401 });
 }
 if (error instanceof NoAutorizadoError) {
 return NextResponse.json({ message: error.message }, { status: 403 });
 }
 throw error;
 }

 const { solicitudId } = await params;

 let body: unknown;
 try {
 body = await request.json();
 } catch {
 return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
 }

 const result = decisionSchema.safeParse(body);
 if (!result.success) {
 const flattened = z.flattenError(result.error);
 return NextResponse.json(
 { message: "Datos inválidos.", errors: flattened.fieldErrors },
 { status: 400 },
 );
 }

 try {
 const solicitud = await resolverSolicitud({
 solicitudId,
 adminId: admin.userId,
 decision: result.data.decision,
 observaciones: result.data.observaciones?.trim() || null,
 });

 return NextResponse.json(
 { message: "Solicitud atendida correctamente.", solicitud },
 { status: 200 },
 );
 } catch (error) {
 if (error instanceof SolicitudNoEncontradaError) {
 return NextResponse.json({ message: error.message }, { status: 404 });
 }
 if (
 error instanceof SolicitudNoVigenteError ||
 error instanceof SolicitudYaAtendidaError
 ) {
 return NextResponse.json({ message: error.message }, { status: 409 });
 }
 if (isUniqueViolation(error)) {
 return NextResponse.json(
 {
 message: "Ya existe un afiliado activo con ese correo electrónico.",
 },
 { status: 409 },
 );
 }

 console.error("Error al resolver la solicitud:", error);
 return toErrorResponse(error);
 }
}
