// app/api/admin/list/route.ts

import { type NextRequest } from "next/server";
import { requireAdminGeneral } from "@/lib/auth/session";
import { adminListQuerySchema } from "@/lib/validation/admin-management";
import { listAdmins } from "@/lib/admins/queries/admins";
import { ok, toErrorResponse } from "@/lib/http/responses";

/**
 * RF-AUTH-013: el listado de administradores es parte de la gestión de
 * administradores, restringida a ADMINISTRADOR GENERAL (misma regla que
 * crear y activar/desactivar). El administrador autenticado se excluye
 * siempre desde la consulta SQL (ver listAdmins), nunca filtrando en el
 * cliente.
 */
export async function GET(request: NextRequest) {
  try {
    const { session } = await requireAdminGeneral();

    const { searchParams } = new URL(request.url);
    const query = adminListQuerySchema.parse({
      search: searchParams.get("search") || undefined,
      subtype: searchParams.get("subtype") || undefined,
      isActive: searchParams.get("isActive") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: searchParams.get("sortOrder") || undefined,
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
    });

    const { admins, total } = await listAdmins({
      ...query,
      excludeUserId: session.user.id,
    });

    return ok({
      admins,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
