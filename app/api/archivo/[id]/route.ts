import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { archivos } from "@/lib/db/schema/archivo";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth/session";
import { getInternalFileUrl, type StorageTarget } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ error: "ID de archivo inválido" }, { status: 400 });
    }

    const [archivo] = await db.select().from(archivos).where(eq(archivos.id, id)).limit(1);

    if (!archivo) {
      console.error("Archivo no encontrado en BD:", id);
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
    }

    // Mapeo de bucket
    let targetKey: StorageTarget = "afiliados";
    if (archivo.bucket === "cms") {
      targetKey = "cms";
    } else if (archivo.bucket === "affiliates") {
      targetKey = "afiliados";
    }

    // Verificar autenticación
    const session = await getCurrentSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // SOLUCIÓN: Usar el endpoint INTERNO (http://garage:3900) en lugar del público (s3.localhost)
    // Esto permite que el contenedor de Next.js resuelva y descargue la imagen sin problemas de DNS.
    const internalFileUrl = await getInternalFileUrl(targetKey, archivo.objectKey);

    console.log("Descargando imagen desde endpoint interno:", internalFileUrl);

    const imageRes = await fetch(internalFileUrl);
    if (!imageRes.ok) {
      throw new Error(`Fallo al descargar imagen: ${imageRes.status}`);
    }

    const arrayBuffer = await imageRes.arrayBuffer();

    // Servir la imagen directamente al navegador con headers CORS
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": archivo.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*", // Crucial para que el frontend pueda convertir a Blob/Base64
      },
    });
  } catch (error) {
    console.error(" Error en /api/archivo/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor", details: String(error) }, { status: 500 });
  }
}
