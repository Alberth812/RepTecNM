// app/api/admin/afiliados/[afiliadoId]/solicitudes/route.ts
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { afiliados } from "@/lib/db/schema/afiliados";
import {
  NoAutenticadoError,
  NoAutorizadoError,
  requireAdminGeneral,
} from "@/lib/auth/session";
import { obtenerVersionesSolicitud } from "@/lib/db/solicitudes/queries";
import { getFileUrl } from "@/lib/storage";
import { NextResponse } from "next/server";

const URL_EXPIRACION_SEGUNDOS = 900;

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

  const [afiliado, versiones] = await Promise.all([
    db
      .select({ membershipStatus: afiliados.membershipStatus })
      .from(afiliados)
      .where(eq(afiliados.userId, afiliadoId))
      .then((rows) => rows[0]),
    obtenerVersionesSolicitud(afiliadoId),
  ]);

  if (!afiliado || versiones.length === 0) {
    return NextResponse.json(
      { message: "Este afiliado no tiene solicitudes registradas." },
      { status: 404 },
    );
  }

  const versionesConUrls = await Promise.all(
    versiones.map(async (v) => ({
      id: v.id,
      afiliadoId: v.afiliadoId,
      version: v.version,
      createdAt: v.createdAt,
      datos: v.datos,
      revisionDecision: v.revisionDecision,
      revisionObservaciones: v.revisionObservaciones,
      revisadoEn: v.revisadoEn,
      revisadoPor: v.revisadoPor,
      fotografia: {
        id: v.fotografia.id,
        originalName: v.fotografia.originalName,
        contentType: v.fotografia.contentType,
        size: v.fotografia.size,
        url: await getFileUrl(
          "afiliados",
          v.fotografia.objectKey,
          URL_EXPIRACION_SEGUNDOS,
        ),
      },
      comprobanteMembresia: {
        id: v.comprobanteMembresia.id,
        originalName: v.comprobanteMembresia.originalName,
        contentType: v.comprobanteMembresia.contentType,
        size: v.comprobanteMembresia.size,
        url: await getFileUrl(
          "afiliados",
          v.comprobanteMembresia.objectKey,
          URL_EXPIRACION_SEGUNDOS,
        ),
      },
    })),
  );

  return NextResponse.json({ afiliado, versiones: versionesConUrls });
}
