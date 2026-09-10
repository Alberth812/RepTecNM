// app/api/afiliado/formacion-academica/route.ts
//
// GET  -> devuelve la formación académica del afiliado autenticado (para
//         hidratar `defaultValues` en <FormacionAcademicaForm />).
// POST -> reemplaza por completo la formación académica del afiliado con el
//         payload validado por `formacionAcademicaSchema`.
//
// ⚠️ Dos supuestos que debes confirmar/ajustar (ver nota al final de mi respuesta):
//   1. Rutas de import de `requireAfiliado` y `ApiError`.
//   2. Forma de `ApiError` (asumo `.status: number` y `.message: string`,
//      y que expone al menos `.forbidden()` y `.badRequest()`).
// Si ya tienes un wrapper central de manejo de errores para tus rutas,
// reemplaza el bloque `catch` de abajo por ese wrapper.

import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import {
  estanciasPosdoctorales,
  licenciaturas,
  posgrados,
} from "@/lib/db/schema/formacion-academica";
import { formacionAcademicaSchema } from "@/lib/validation/formacion-academica";
import { requireAfiliado } from "@/lib/auth/session";
import { ApiError } from "@/lib/errors";
import z from "zod";

// -----------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------
export async function GET() {
  try {
    const { afiliado } = await requireAfiliado();

    const [lics, posg, estancias] = await Promise.all([
      db.query.licenciaturas.findMany({
        where: { afiliadoId: afiliado.userId },
      }),
      db.query.posgrados.findMany({ where: { afiliadoId: afiliado.userId } }),
      db.query.estanciasPosdoctorales.findMany({
        where: { afiliadoId: afiliado.userId },
      }),
    ]);

    return NextResponse.json({
      licenciaturas: lics,
      posgrados: posg,
      estanciasPosdoctorales: estancias,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

// -----------------------------------------------------------------------
// POST
// -----------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const { afiliado } = await requireAfiliado();
    const afiliadoId = afiliado.userId;

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      throw ApiError.badRequest("El cuerpo de la petición no es JSON válido.");
    }

    const parsed = formacionAcademicaSchema.safeParse(json);
    if (!parsed.success) {
      // 422: la petición es JSON válido pero no cumple las reglas de negocio.
      return NextResponse.json(
        {
          error: "Datos de formación académica inválidos.",
          issues: z.treeifyError(parsed.error),
        },
        { status: 422 },
      );
    }

    const data = parsed.data;

    // Estrategia: reemplazo completo dentro de una transacción. El formulario
    // envía siempre el estado íntegro de las 3 secciones, así que no hace
    // falta reconciliar altas/bajas/ediciones fila por fila; se descartan los
    // `id` que haya mandado el cliente y se regeneran al insertar.
    await db.transaction(async (tx) => {
      await tx
        .delete(licenciaturas)
        .where(eq(licenciaturas.afiliadoId, afiliadoId));
      await tx.delete(posgrados).where(eq(posgrados.afiliadoId, afiliadoId));
      await tx
        .delete(estanciasPosdoctorales)
        .where(eq(estanciasPosdoctorales.afiliadoId, afiliadoId));

      if (data.licenciaturas.length > 0) {
        await tx.insert(licenciaturas).values(
          data.licenciaturas.map(({ id: _id, ...resto }) => ({
            ...resto,
            afiliadoId,
          })),
        );
      }

      if (data.posgrados.length > 0) {
        await tx.insert(posgrados).values(
          data.posgrados.map(({ id: _id, ...resto }) => ({
            ...resto,
            afiliadoId,
          })),
        );
      }

      if (data.estanciasPosdoctorales.length > 0) {
        await tx.insert(estanciasPosdoctorales).values(
          data.estanciasPosdoctorales.map(({ id: _id, ...resto }) => ({
            ...resto,
            afiliadoId,
          })),
        );
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

// -----------------------------------------------------------------------
// Manejo de errores local — sustitúyelo por tu wrapper central si ya existe.
// -----------------------------------------------------------------------
function handleRouteError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  console.error("[formacion-academica] Error inesperado:", error);
  return NextResponse.json(
    { error: "Error interno del servidor." },
    { status: 500 },
  );
}
