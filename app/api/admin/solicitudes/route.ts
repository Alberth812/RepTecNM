import {
  NoAutenticadoError,
  NoAutorizadoError,
  requireAdminGeneral,
} from "@/lib/auth/session";
import {
  contarSolicitudes,
  listarSolicitudes,
} from "@/lib/db/solicitudes/queries";
import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  estado: z
    .enum(["REQUIERE_ATENCION", "EN_CORRECCION", "RECHAZADA", "APROBADA"])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: Request) {
  try {
    await requireAdminGeneral();
  } catch (error) {
    if (error instanceof NoAutenticadoError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    if (error instanceof NoAutorizadoError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    throw error;
  }

  const { searchParams } = new URL(request.url);
  const result = querySchema.safeParse(Object.fromEntries(searchParams));

  if (!result.success) {
    return NextResponse.json(
      { message: "Parámetros de consulta inválidos." },
      { status: 400 },
    );
  }

  const { estado, limit, offset } = result.data;

  const [items, total] = await Promise.all([
    listarSolicitudes({ estado, limit, offset }),
    contarSolicitudes({ estado }),
  ]);

  return NextResponse.json({ items, total, limit, offset });
}
