// app/api/afiliados/actualizacion-profesional/route.ts
// Sección 6 · ACTUALIZACIÓN PROFESIONAL
//   GET → devuelve la respuesta vigente del afiliado (o null si aún no hay)
//   PUT → registra la respuesta; reemplaza por completo a la anterior (upsert)
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { ApiError } from "@/lib/errors";
import { requireAfiliado } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { afiliadoActualizacionProfesional as tabla } from "@/lib/db/schema/actualizacion-profesional";
import {
  actualizacionProfesionalSchema,
  type ActualizacionProfesional,
} from "@/lib/validation/actualizacion-profesional/actualizacion-profesional";

type Fila = typeof tabla.$inferSelect;

/* -------------------------------------------------------------------------- */
/* Mapeos fila ⇄ DTO                                                          */
/* -------------------------------------------------------------------------- */

/** Fila de BD → cuerpo de respuesta (sin userId ni timestamps internos). */
function aRespuesta(fila: Fila) {
  const data: ActualizacionProfesional = {
    haTomadoActualizacion: fila.haTomadoActualizacion,
    actividadesActualizacion: fila.actividadesActualizacion,
    actualizacionDeseada: fila.actualizacionDeseada,
    disponibilidadActualizacion: fila.disponibilidadActualizacion,
    horarioActualizacion: fila.horarioActualizacion,
    creacionEmpresa: fila.creacionEmpresa,
    nombreEmpresa: fila.nombreEmpresa,
    puesto5Anios: fila.puesto5Anios,
    haOcupadoCargoEleccionPopular: fila.haOcupadoCargoEleccionPopular,
    detalleCargoPublico: fila.detalleCargoPublico,
  };
  return { data, updatedAt: fila.updatedAt.toISOString() };
}

/**
 * Datos validados → columnas.
 * Todo campo opcional/condicional se fuerza a `null` de forma EXPLÍCITA:
 * en Drizzle un `undefined` dentro de `set` no actualiza la columna, y el valor
 * anterior sobreviviría, rompiendo el "cada respuesta reemplaza a la anterior".
 */
function aColumnas(d: ActualizacionProfesional) {
  return {
    haTomadoActualizacion: d.haTomadoActualizacion,
    actividadesActualizacion: d.actividadesActualizacion ?? null,
    actualizacionDeseada: d.actualizacionDeseada,
    disponibilidadActualizacion: d.disponibilidadActualizacion,
    horarioActualizacion: d.horarioActualizacion ?? null,
    creacionEmpresa: d.creacionEmpresa,
    nombreEmpresa: d.nombreEmpresa ?? null,
    puesto5Anios: d.puesto5Anios ?? null,
    haOcupadoCargoEleccionPopular: d.haOcupadoCargoEleccionPopular,
    detalleCargoPublico: d.detalleCargoPublico ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Manejo de errores                                                          */
/* -------------------------------------------------------------------------- */
// Si ya tienes un wrapper global de errores, elimina este try/catch y úsalo.
function responderError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status }, // ⚠️ ajusta si tu ApiError usa otro nombre (p. ej. statusCode)
    );
  }
  console.error("[actualizacion-profesional]", error);
  return NextResponse.json(
    { message: "Ocurrió un error inesperado. Intenta de nuevo." },
    { status: 500 },
  );
}

/* -------------------------------------------------------------------------- */
/* GET · obtener la respuesta actual                                          */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const { afiliado } = await requireAfiliado();

    const [fila] = await db
      .select()
      .from(tabla)
      .where(eq(tabla.userId, afiliado.userId))
      .limit(1);

    // Sin respuesta previa: 200 con null → el formulario se muestra vacío.
    return NextResponse.json(
      fila ? aRespuesta(fila) : { data: null, updatedAt: null },
    );
  } catch (error) {
    return responderError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* PUT · registrar (reemplazar) la respuesta                                  */
/* -------------------------------------------------------------------------- */

export async function PUT(request: Request) {
  try {
    // 1) Autenticación/autorización primero: el userId SIEMPRE sale de la sesión.
    const { afiliado } = await requireAfiliado();

    // 2) Cuerpo JSON
    let cuerpo: unknown;
    try {
      cuerpo = await request.json();
    } catch {
      return NextResponse.json(
        { message: "El cuerpo de la solicitud no es un JSON válido." },
        { status: 400 },
      );
    }

    // 3) Validación (Zod descarta llaves desconocidas, p. ej. un userId enviado)
    const resultado = actualizacionProfesionalSchema.safeParse(cuerpo);
    if (!resultado.success) {
      // Un solo mensaje por campo (el primero, que es el más relevante).
      const errores = new Map<string, string>();
      for (const issue of resultado.error.issues) {
        const path = issue.path.map(String).join(".");
        if (!errores.has(path)) errores.set(path, issue.message);
      }
      return NextResponse.json(
        {
          message: "Los datos enviados no son válidos.",
          errors: [...errores].map(([path, message]) => ({ path, message })),
        },
        { status: 422 },
      );
    }

    // 4) Upsert atómico: crea la fila o reemplaza TODOS los campos de la anterior.
    const columnas = aColumnas(resultado.data);
    const [fila] = await db
      .insert(tabla)
      .values({ userId: afiliado.userId, ...columnas })
      .onConflictDoUpdate({
        target: tabla.userId,
        // $onUpdate no aplica en onConflictDoUpdate → updatedAt explícito.
        set: { ...columnas, updatedAt: new Date() },
      })
      .returning();

    return NextResponse.json(aRespuesta(fila));
  } catch (error) {
    return responderError(error);
  }
}
