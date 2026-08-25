import {
  NoAutenticadoError,
  NoAutorizadoError,
  requireAdminGeneral,
} from "@/lib/auth/session";
import { obtenerVersionesSolicitud } from "@/lib/db/solicitudes/queries";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ afiliadoId: string }> },
) {
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

  const { afiliadoId } = await params;
  const versiones = await obtenerVersionesSolicitud(afiliadoId);

  if (versiones.length === 0) {
    return NextResponse.json(
      { message: "Este afiliado no tiene solicitudes registradas." },
      { status: 404 },
    );
  }

  return NextResponse.json({ versiones });
}
