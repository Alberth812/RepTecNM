// Ubicación sugerida: src/app/api/instituciones/[id]/route.ts (ruta fija de Next.js App Router, no mover)

import { NextRequest, NextResponse } from "next/server";

import { requireAdminGeneral } from "@/lib/auth/session";
import { ApiError } from "@/lib/errors";
import { handleApiError } from "@/lib/instituciones/handle-api-error";
import {
  deleteInstitucion,
  getInstitucionById,
  updateInstitucion,
} from "@/lib/instituciones/queries/instituciones";
import {
  institucionIdParamSchema,
  updateInstitucionSchema,
} from "@/lib/validation/instituciones";

// Next.js 15: los params de una ruta dinámica llegan como Promise.
// Si tu proyecto está en Next.js 14, cambia esto por `{ params: { id: string } }`
// y elimina los `await context.params`.
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireAdminGeneral();

    const { id } = institucionIdParamSchema.parse(await context.params);

    const institucion = await getInstitucionById(id);

    if (!institucion) {
      throw ApiError.notFound("La institución no existe.");
    }

    return NextResponse.json({ data: institucion });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminGeneral();

    const { id } = institucionIdParamSchema.parse(await context.params);
    const body = await request.json();
    const input = updateInstitucionSchema.parse(body);

    const institucion = await updateInstitucion(id, input);

    if (!institucion) {
      throw ApiError.notFound("La institución no existe.");
    }

    return NextResponse.json({ data: institucion });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireAdminGeneral();

    const { id } = institucionIdParamSchema.parse(await context.params);

    // deleteInstitucion ya traduce la violación de FK (23503) a un 409.
    const deleted = await deleteInstitucion(id);

    if (!deleted) {
      throw ApiError.notFound("La institución no existe.");
    }

    return NextResponse.json({ data: { id } });
  } catch (error) {
    return handleApiError(error);
  }
}
