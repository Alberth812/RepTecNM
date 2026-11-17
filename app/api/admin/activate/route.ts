// app/api/admin/activate/route.ts

import { type NextRequest } from "next/server";
import { requireAdminGeneral } from "@/lib/auth/session";
import { toggleAdminStatusSchema } from "@/lib/validation/admin-management";
import {
 activateAdminRecord,
 getAdminByUserId,
} from "@/lib/admins/queries/admins";
import { ok, toErrorResponse } from "@/lib/http/responses";
import { ApiError } from "@/lib/errors";

/**
 * RF-AUTH-013: solo un ADMINISTRADOR GENERAL puede activar a otro
 * administrador, nunca a sí mismo. `isRoot` nunca se acepta desde el
 * payload; solo se modifica administradores.isActive. Activar no crea ni
 * modifica sesiones existentes.
 */
export async function POST(request: NextRequest) {
 try {
 const { session } = await requireAdminGeneral();
 const { userId } = toggleAdminStatusSchema.parse(await request.json());

 if (userId === session.user.id) {
 throw ApiError.forbidden(
 "No puedes modificar tu propia cuenta de administrador.",
 "CANNOT_MODIFY_SELF",
 );
 }

 const target = await getAdminByUserId(userId);
 if (!target) {
 throw ApiError.notFound("El administrador indicado no existe.");
 }

 const updated = await activateAdminRecord(userId);
 if (!updated) {
 throw ApiError.notFound("El administrador indicado no existe.");
 }

 return ok({
 admin: {
 userId: updated.userId,
 isActive: updated.isActive,
 },
 });
 } catch (error) {
 return toErrorResponse(error);
 }
}
