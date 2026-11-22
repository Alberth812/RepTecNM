// @/app/api/admin/renovaciones/[id]/comprobante-url/route.ts

import { NextRequest, NextResponse } from "next/server";

import { obtenerUrlComprobanteRenovacion } from "@/lib/membresia/renovaciones";
import { requireAdminGeneral } from "@/lib/auth/session";

//
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminGeneral();

  const { id } = await params;
  const url = await obtenerUrlComprobanteRenovacion(id);
  if (!url) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ url });
}
