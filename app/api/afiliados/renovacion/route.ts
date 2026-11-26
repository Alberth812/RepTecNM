// @/app/api/afiliado/renovacion/route.ts

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth"; // TODO: ajusta
import { uploadFile, deleteFile } from "@/lib/storage/index"; // TODO: ajusta
import {
  crearSolicitudRenovacion,
  esViolacionDeUnicidad,
  obtenerEstadoRenovacionAfiliado,
} from "@/lib/membresia/renovaciones";

export const runtime = "nodejs";

const TIPOS_PERMITIDOS = ["application/pdf", "image/png", "image/jpeg"];
const TAMANO_MAXIMO_BYTES = 7 * 1024 * 1024;

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const estado = await obtenerEstadoRenovacionAfiliado(session.user.id);
  if (!estado) {
    return NextResponse.json(
      { error: "Afiliado no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json(estado);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const afiliadoId = session.user.id;

  const formData = await req.formData();
  const file = formData.get("comprobante");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Debes adjuntar un comprobante." },
      { status: 400 },
    );
  }
  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato no permitido. Usa PDF, PNG o JPG." },
      { status: 400 },
    );
  }
  if (file.size > TAMANO_MAXIMO_BYTES) {
    return NextResponse.json(
      { error: "El archivo supera el máximo de 7MB." },
      { status: 400 },
    );
  }

  // Revalida en servidor: nunca confíes en lo que mande el cliente.
  const estadoActual = await obtenerEstadoRenovacionAfiliado(afiliadoId);
  if (!estadoActual) {
    return NextResponse.json(
      { error: "Afiliado no encontrado" },
      { status: 404 },
    );
  }
  if (!estadoActual.puedeIniciarRenovacion) {
    return NextResponse.json(
      { error: "No es posible iniciar una renovación en este momento." },
      { status: 409 },
    );
  }

  const subido = await uploadFile({
    target: "afiliados",
    file,
    ownerId: afiliadoId,
    folder: "renovaciones",
  });

  try {
    const renovacion = await crearSolicitudRenovacion(afiliadoId, subido);
    return NextResponse.json({ renovacion }, { status: 201 });
  } catch (error) {
    // Si la DB falla (incluido el choque con el índice único parcial por
    // una solicitud creada en paralelo), no dejamos el archivo huérfano.
    await deleteFile("afiliados", subido.objectKey).catch(() => {});

    if (esViolacionDeUnicidad(error)) {
      return NextResponse.json(
        { error: "Ya existe una solicitud de renovación pendiente." },
        { status: 409 },
      );
    }
    throw error;
  }
}
