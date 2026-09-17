// app/api/afiliado/evaluacion-programa-estudios/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db/client";
import { evaluacionProgramaEstudios } from "@/lib/db/schema/evaluacion-programa-estudios";
import { requireAfiliado } from "@/lib/auth/session";
import { ApiError } from "@/lib/errors";
import { evaluacionProgramaEstudiosSchema } from "@/lib/validation/evaluacion-programa-estudios";
import { eq } from "drizzle-orm";

function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      {
        status: (error as { statusCode?: number }).statusCode ?? 500,
      },
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        issues: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  console.error(error);

  return NextResponse.json(
    { error: "Error interno del servidor" },
    { status: 500 },
  );
}

/**
 * GET: devuelve la evaluación del programa de estudios
 * del afiliado autenticado, o `data: null` si todavía no existe.
 */
export async function GET() {
  try {
    const { afiliado } = await requireAfiliado();

    const [evaluacion] = await db
      .select()
      .from(evaluacionProgramaEstudios)
      .where(eq(evaluacionProgramaEstudios.userId, afiliado.userId))
      .limit(1);

    return NextResponse.json({
      data: evaluacion ?? null,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * POST: crea o actualiza (upsert) la evaluación del programa de estudios
 * del afiliado autenticado.
 */
export async function POST(request: NextRequest) {
  try {
    const { afiliado } = await requireAfiliado();

    const json = await request.json();
    const parsed = evaluacionProgramaEstudiosSchema.parse(json);

    const [evaluacion] = await db
      .insert(evaluacionProgramaEstudios)
      .values({
        userId: afiliado.userId,
        ...parsed,
      })
      .onConflictDoUpdate({
        target: evaluacionProgramaEstudios.userId,
        set: parsed,
      })
      .returning();

    return NextResponse.json({
      data: evaluacion,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
