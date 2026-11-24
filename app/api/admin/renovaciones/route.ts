// @/app/api/admin/renovaciones/route.ts

import { NextRequest, NextResponse } from "next/server";

import { listarRenovacionesPendientes } from "@/lib/membresia/renovaciones";
import { requireAdminGeneral } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const auth = await requireAdminGeneral();

  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("pageSize") ?? "25");
  const q = params.get("q") ?? undefined;
  const orderDir = params.get("orderDir") === "asc" ? "asc" : "desc";

  const resultado = await listarRenovacionesPendientes({
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 25,
    q,
    orderDir,
  });

  return NextResponse.json(resultado);
}
