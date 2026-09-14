// @/app/api/informacion-laboral/route.ts
//
// Ajusta la ruta del archivo a tu convención si ya tienes, p. ej.,
// app/api/afiliado/informacion-laboral/route.ts.
//
// GET  -> devuelve la Sección 3 del afiliado autenticado (o `null` /
//         arreglo vacío si aún no la ha llenado). Pensado para alimentar
//         directamente el prop `defaultValues` de <InformacionLaboralForm />.
// POST -> valida el payload completo con el mismo `informacionLaboralSeccionSchema`
//         del frontend y hace upsert de la parte 1:1 (`afiliados_informacion_laboral`)
//         + reemplazo completo de la parte 1:N (`afiliados_empleos`).
//
// Estrategia de escritura para `historialEmpleos`: como el formulario no
// mantiene IDs estables de cada empleo entre sesiones (los `id` de
// `useFieldArray` son solo de UI), la forma más simple y robusta de
// sincronizar el arreglo es, dentro de una transacción: borrar todos los
// empleos existentes del afiliado e insertar de nuevo los que llegan en el
// payload. Esto es correcto para este caso de uso (es el propio afiliado
// editando su respuesta) y evita tener que diffear altas/bajas/cambios.
// Si más adelante necesitas conservar IDs estables (p. ej. para
// auditoría/histórico de cambios), se puede migrar a un `upsert` por
// elemento usando un `id` opcional en el schema del item.
//
// Nota sobre transacciones: `db.transaction(...)` requiere un driver de
// Postgres con soporte transaccional (node-postgres `pg`, `postgres.js`,
// Neon con `neon-serverless`/websocket, etc.). Si tu proyecto usa el driver
// HTTP de Neon (`drizzle-orm/neon-http`), que no soporta transacciones,
// reemplaza el bloque `db.transaction` por `db.batch([...])` o ejecuta las
// operaciones de forma secuencial asumiendo el riesgo de una escritura
// parcial.

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/lib/db/client";
import { requireAfiliado } from "@/lib/auth/session";
import { ApiError } from "@/lib/errors";
import {
  afiliadosEmpleos,
  afiliadosInformacionLaboral,
} from "@/lib/db/schema/informacion-laboral";
import { getInformacionLaboralSeccion } from "@/lib/seguimiento/informacion-laboral";
import { informacionLaboralSeccionSchema } from "@/lib/validation/informacion-laboral";

type InformacionLaboralSeccionOutput = z.output<
  typeof informacionLaboralSeccionSchema
>;
type InformacionLaboralOutput =
  InformacionLaboralSeccionOutput["informacionLaboral"];
type EmpleoOutput = InformacionLaboralSeccionOutput["historialEmpleos"][number];

/* -------------------------------------------------------------------------- */
/* Manejo de errores común                                                    */
/* -------------------------------------------------------------------------- */

function handleRouteError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  // eslint-disable-next-line no-console
  console.error("[api/informacion-laboral] Error inesperado:", error);
  return NextResponse.json(
    { error: "Ocurrió un error inesperado. Intenta de nuevo más tarde." },
    { status: 500 },
  );
}

/* -------------------------------------------------------------------------- */
/* Mapeo Zod (output) -> Drizzle (insert)                                    */
/* -------------------------------------------------------------------------- */

function toInformacionLaboralValues(
  userId: string,
  info: InformacionLaboralOutput,
) {
  return {
    userId,
    tiempoPrimerEmpleo: info.tiempoPrimerEmpleo,
    factoresEmpleo: info.factoresEmpleo,
    factoresEmpleoOtro: info.factoresEmpleoOtro ?? null,
    laboraActualmente: info.laboraActualmente,
    causasDesempleo: info.causasDesempleo,
    causasDesempleoOtro: info.causasDesempleoOtro ?? null,
    estrategiaPostgrado: info.estrategiaPostgrado,
    estrategiaPostgradoOtro: info.estrategiaPostgradoOtro ?? null,
  } satisfies typeof afiliadosInformacionLaboral.$inferInsert;
}

function toEmpleoValues(afiliadoUserId: string, empleo: EmpleoOutput) {
  return {
    afiliadoUserId,
    puesto: empleo.puesto,
    institucion: empleo.institucion,
    fechaInicioAnio: empleo.fechaInicioAnio,
    fechaInicioMes: empleo.fechaInicioMes,
    esActual: empleo.esActual,
    fechaFinAnio: empleo.fechaFinAnio ?? null,
    fechaFinMes: empleo.fechaFinMes ?? null,
    tipoContratacion: empleo.tipoContratacion ?? null,
    tipoContratacionOtro: empleo.tipoContratacionOtro ?? null,
    // Las columnas `numeric` de Drizzle se leen/escriben como `string`.
    salarioMensualBruto:
      empleo.salarioMensualBruto != null
        ? empleo.salarioMensualBruto.toString()
        : null,
    horasSemanales: empleo.horasSemanales ?? null,
    tipoInstitucion: empleo.tipoInstitucion,
    tipoInstitucionOtro: empleo.tipoInstitucionOtro ?? null,
    telefonoOrganismo: empleo.telefonoOrganismo ?? null,
    sectorPrimario: empleo.sectorPrimario,
    sectorSecundario: empleo.sectorSecundario,
    sectorTerciario: empleo.sectorTerciario,
    tipoActividad: empleo.tipoActividad,
    tipoActividadOtro: empleo.tipoActividadOtro ?? null,
    actividadesPrincipales: empleo.actividadesPrincipales ?? null,
    estrategiaEmpleoActual: empleo.estrategiaEmpleoActual,
    estrategiaEmpleoActualOtro: empleo.estrategiaEmpleoActualOtro ?? null,
    valoracionCoincidenciaConocimientos:
      empleo.valoracionCoincidenciaConocimientos ?? null,
    valoracionCapacidadResolverProblemas:
      empleo.valoracionCapacidadResolverProblemas ?? null,
    valoracionImpactoSocial: empleo.valoracionImpactoSocial ?? null,
    valoracionPertinenciaPrograma: empleo.valoracionPertinenciaPrograma ?? null,
  } satisfies typeof afiliadosEmpleos.$inferInsert;
}

/* -------------------------------------------------------------------------- */
/* GET                                                                        */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const { afiliado } = await requireAfiliado();
    const seccion = await getInformacionLaboralSeccion(afiliado.userId);
    return NextResponse.json(seccion);
  } catch (error) {
    return handleRouteError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* POST                                                                       */
/* -------------------------------------------------------------------------- */

export async function POST(request: Request) {
  try {
    const { afiliado } = await requireAfiliado();

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      throw ApiError.badRequest("El cuerpo de la petición no es JSON válido.");
    }

    const parsed = informacionLaboralSeccionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Los datos de información laboral no son válidos.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (data.historialEmpleos.length > 50) {
      // Defensa adicional: el schema ya limita a 50, esto solo cubre el
      // caso de que alguien construya el payload a mano.
      throw ApiError.badRequest("No se pueden registrar más de 50 empleos.");
    }

    const informacionLaboralValues = toInformacionLaboralValues(
      afiliado.userId,
      data.informacionLaboral,
    );
    const { userId: _userId, ...informacionLaboralUpdate } =
      informacionLaboralValues;

    await db.transaction(async (tx) => {
      // 1) Upsert de la parte 1:1.
      await tx
        .insert(afiliadosInformacionLaboral)
        .values(informacionLaboralValues)
        .onConflictDoUpdate({
          target: afiliadosInformacionLaboral.userId,
          set: {
            ...informacionLaboralUpdate,
            updatedAt: new Date(),
          },
        });

      // 2) Reemplazo completo de la parte 1:N.
      await tx
        .delete(afiliadosEmpleos)
        .where(eq(afiliadosEmpleos.afiliadoUserId, afiliado.userId));

      if (data.historialEmpleos.length > 0) {
        await tx
          .insert(afiliadosEmpleos)
          .values(
            data.historialEmpleos.map((empleo) =>
              toEmpleoValues(afiliado.userId, empleo),
            ),
          );
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
