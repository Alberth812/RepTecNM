// @/app/api/admin/afiliados/[userId]/route.ts
import type { NextRequest } from "next/server";
import { requireAdminGeneral } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/api/response";
import { ApiError } from "@/lib/errors";
import { userIdParamSchema } from "@/lib/validations/afiliados";
import { obtenerAfiliadoDetalle } from "@/lib/db/queries/afiliados";

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminGeneral();

    const { userId } = userIdParamSchema.parse(await params);

    const detalle = await obtenerAfiliadoDetalle(userId);
    if (!detalle) {
      throw ApiError.notFound("El afiliado no existe.");
    }

    return apiSuccess(detalle);
  } catch (error) {
    return apiError(error);
  }
}
