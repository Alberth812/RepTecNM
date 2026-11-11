// @/app/api/admin/afiliados/route.ts
import type { NextRequest } from "next/server";
import { requireAdminGeneral } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/api/response";
import { listadoAfiliadosQuerySchema } from "@/lib/validations/afiliados";
import { listarAfiliados } from "@/lib/db/queries/afiliados";

function readParam(
  searchParams: URLSearchParams,
  key: string,
): string | undefined {
  const value = searchParams.get(key);
  if (value === null) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export async function GET(request: NextRequest) {
  try {
    // Toda API administrativa exige administrador general, sin excepción.
    await requireAdminGeneral();

    const { searchParams } = new URL(request.url);

    const raw = {
      page: readParam(searchParams, "page"),
      pageSize: readParam(searchParams, "pageSize"),
      search: readParam(searchParams, "search"),
      estadoResidencia: readParam(searchParams, "estadoResidencia"),
      ciudadResidencia: readParam(searchParams, "ciudadResidencia"),
      membershipStatus: readParam(searchParams, "membershipStatus"),
      sortBy: readParam(searchParams, "sortBy"),
      sortOrder: readParam(searchParams, "sortOrder"),
    };

    const query = listadoAfiliadosQuerySchema.parse(raw);
    const resultado = await listarAfiliados(query);

    return apiSuccess(resultado);
  } catch (error) {
    return apiError(error);
  }
}
