// @/app/api/admin/afiliados/[userId]/suspension/route.ts
import type { NextRequest } from "next/server";
import { requireAdminGeneral } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/api/response";
import { ApiError } from "@/lib/errors";
import {
  suspenderAfiliadoBodySchema,
  userIdParamSchema,
} from "@/lib/validations/afiliados";
import {
  quitarSuspensionAfiliado,
  suspenderAfiliado,
} from "@/lib/db/queries/afiliados";

interface RouteContext {
  params: Promise<{ userId: string }>;
}

/** Suspende a un afiliado ACTIVO. Requiere `{ motivo: string }` en el body. */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminGeneral();

    const { userId } = userIdParamSchema.parse(await params);

    const json = await request.json().catch(() => {
      throw ApiError.badRequest(
        "El cuerpo de la solicitud debe ser JSON válido.",
      );
    });
    const { motivo } = suspenderAfiliadoBodySchema.parse(json);

    const resultado = await suspenderAfiliado(userId, motivo);

    return apiSuccess(resultado);
  } catch (error) {
    return apiError(error);
  }
}

/** Quita la suspensión de un afiliado SUSPENDIDO. No requiere body. */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminGeneral();

    const { userId } = userIdParamSchema.parse(await params);

    const resultado = await quitarSuspensionAfiliado(userId);

    return apiSuccess(resultado);
  } catch (error) {
    return apiError(error);
  }
}
