import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db/client";
import { archivos } from "@/lib/db/schema/archivo";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cliente S3 directo usando las variables que sabemos que existen en .env
const s3 = new S3Client({
  region: process.env.S3_REGION || "garage",
  endpoint: process.env.S3_ENDPOINT || "http://dev-garage:3900",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.GARAGE_AFFILIATES_ACCESS_KEY || "",
    secretAccessKey: process.env.GARAGE_AFFILIATES_SECRET_KEY || "",
  },
});

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verificar autenticación (cualquier usuario logueado, no solo admin)
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const [file] = await db.select().from(archivos).where(eq(archivos.id, id));

    if (!file) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
    }

    // 2. Verificar permisos: Admin GENERAL o dueño del archivo
    // El objectKey tiene el formato: ownerId/folder/uuid.extension
    const ownerId = file.objectKey.split("/")[0];
    const esAdmin = session.user.role === "ADMINISTRADOR";
    const esDueno = session.user.id === ownerId;

    if (!esAdmin && !esDueno) {
      return NextResponse.json({ error: "No tienes permiso para ver este archivo" }, { status: 403 });
    }

    // 3. Obtener el archivo de Garage usando el SDK (firma automática SigV4)
    const res = await s3.send(
      new GetObjectCommand({
        Bucket: file.bucket,
        Key: file.objectKey,
      })
    );

    if (!res.Body) {
      return NextResponse.json({ error: "El archivo está vacío" }, { status: 500 });
    }

    const buffer = await streamToBuffer(res.Body);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": file.contentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.originalName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[GET /api/archivo/[id]]", error);
    return NextResponse.json({ error: "Error al obtener el archivo" }, { status: 500 });
  }
}
