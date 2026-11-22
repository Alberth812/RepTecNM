// @/app/api/admin/renovaciones/[id]/rechazar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  rechazarRenovacion,
  RenovacionConflictError,
} from "@/lib/membresia/renovaciones";
import { requireAdminGeneral } from "@/lib/auth/session";

const cuerpoSchema = z.object({
  observaciones: z.string().max(1000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminGeneral();

  const { id } = await params;
  const cuerpo = cuerpoSchema.safeParse(await req.json().catch(() => ({})));
  if (!cuerpo.success) {
    return NextResponse.json(
      { error: "Observaciones inválidas." },
      { status: 400 },
    );
  }

  try {
    await rechazarRenovacion(
      id,
      auth.session.user.id,
      cuerpo.data.observaciones,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RenovacionConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
