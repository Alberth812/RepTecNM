// @/app/api/admin/afiliados/[userId]/renovaciones/route.ts

import { NextRequest, NextResponse } from "next/server";

import { obtenerHistorialRenovaciones } from "@/lib/membresia/renovaciones";
import { requireAdminGeneral } from "@/lib/auth/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const auth = await requireAdminGeneral();

  const { userId } = await params;
  const historial = await obtenerHistorialRenovaciones(userId);
  return NextResponse.json({ data: historial });
}
