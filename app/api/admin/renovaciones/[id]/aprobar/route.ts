// @/app/api/admin/renovaciones/[id]/aprobar/route.ts

import { NextRequest, NextResponse } from "next/server";

import {
  aprobarRenovacion,
  RenovacionConflictError,
} from "@/lib/membresia/renovaciones";
import { requireAdminGeneral } from "@/lib/auth/session";

//
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminGeneral();

  const { id } = await params;

  try {
    const resultado = await aprobarRenovacion(id, auth.session.user.id);
    return NextResponse.json({ ok: true, ...resultado });
  } catch (error) {
    if (error instanceof RenovacionConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
