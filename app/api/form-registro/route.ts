// route.ts
import { requireAfiliado } from "@/lib/auth/session";
import {
  crearSolicitud,
  EstadoInvalidoError,
} from "@/lib/db/solicitudes/queries";
import { toErrorResponse } from "@/lib/http/responses";
import { parseRegistroFormData } from "@/lib/registro/formData";
import { registroServerSchema } from "@/lib/registro/schema-server";
import { toSolicitudSnapshot } from "@/lib/registro/solicitud-snapshot";
import { deleteFile, uploadFile } from "@/lib/storage";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const { afiliado } = await requireAfiliado();

  if (
    !["NO_INICIADA", "REQUIERE_CORRECCION"].includes(afiliado.membershipStatus)
  ) {
    return NextResponse.json(
      { message: "No puedes enviar el registro en tu estado actual." },
      { status: 409 },
    );
  }

  let raw: Record<string, unknown>;
  try {
    const formData = await request.formData();
    raw = parseRegistroFormData(formData);
  } catch {
    return NextResponse.json(
      { message: "No se pudo leer la solicitud. Verifica el formato enviado." },
      { status: 400 },
    );
  }

  const result = await registroServerSchema.safeParseAsync(raw);
  if (!result.success) {
    const flattened = z.flattenError(result.error);
    return NextResponse.json(
      {
        message: "Hay errores de validación en el registro.",
        errors: flattened.fieldErrors,
      },
      { status: 400 },
    );
  }

  const data = result.data;

  let fotografia: Awaited<ReturnType<typeof uploadFile>> | null = null;
  let membresia: Awaited<ReturnType<typeof uploadFile>> | null = null;

  try {
    fotografia = await uploadFile({
      target: "afiliados",
      file: data.fotografia,
      ownerId: afiliado.userId,
      folder: "fotografia",
    });

    membresia = await uploadFile({
      target: "afiliados",
      file: data.comprobante_membresia,
      ownerId: afiliado.userId,
      folder: "membresia",
    });

    const { solicitud, archivosParaEliminar } = await crearSolicitud({
      afiliadoId: afiliado.userId,
      datos: toSolicitudSnapshot(data),
      archivos: {
        fotografia: {
          bucket: fotografia.bucket,
          objectKey: fotografia.objectKey,
          originalName: fotografia.originalName,
          contentType: fotografia.contentType,
          size: fotografia.size,
        },
        comprobanteMembresia: {
          bucket: membresia.bucket,
          objectKey: membresia.objectKey,
          originalName: membresia.originalName,
          contentType: membresia.contentType,
          size: membresia.size,
        },
      },
    });

    // Tx confirmada: ahora sí borramos del storage los archivos de
    // versiones podadas. Si esto falla no tumbamos la respuesta —
    // quedarían objetos huérfanos en Garage, limpiables después.
    if (archivosParaEliminar.length > 0) {
      await Promise.allSettled(
        archivosParaEliminar.map((a) => deleteFile("afiliados", a.objectKey)),
      );
    }

    return NextResponse.json(
      {
        message: "Registro enviado correctamente.",
        version: solicitud.version,
      },
      { status: 200 },
    );
  } catch (error) {
    await cleanupUploadedFiles(fotografia, membresia);

    if (error instanceof EstadoInvalidoError) {
      return NextResponse.json(
        { message: "No puedes enviar el registro en tu estado actual." },
        { status: 409 },
      );
    }

    console.error("Error al guardar la solicitud del afiliado:", error);
    return toErrorResponse(error);
  }
}

async function cleanupUploadedFiles(
  fotografia: Awaited<ReturnType<typeof uploadFile>> | null,
  membresia: Awaited<ReturnType<typeof uploadFile>> | null,
) {
  const files = [fotografia, membresia].filter(
    (file): file is NonNullable<typeof file> => file !== null,
  );
  await Promise.allSettled(
    files.map((file) => deleteFile("afiliados", file.objectKey)),
  );
}
