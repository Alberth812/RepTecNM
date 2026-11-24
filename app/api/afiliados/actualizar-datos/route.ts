// app/api/afiliados/actualizar-datos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { requireAfiliado } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import {
  afiliados,
  datosEmergencia,
  proyectosRelevantes,
} from "@/lib/db/schema/afiliados";
import { ApiError } from "@/lib/errors";
import { buildRegistroSchema } from "@/lib/actualizar-datos/schema";
import z from "zod";

// 
// Helpers de parseo de FormData
// 

/** Convierte "" / undefined / null en null (para columnas opcionales). */
function emptyToNull(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return String(value);
}

/**
 * Interpreta el valor de un campo de FormData:
 *  - Intenta JSON.parse si parece JSON (`[...]` o `{...}`) → ideal para
 *    arrays (`area_conocimiento`) y objetos (`proyectos_relevantes`).
 *  - Convierte "true"/"false" a booleanos (útil para `autoriza_publicacion`).
 *  - Deja los File tal cual para tratarlos aparte.
 */
function parseFormValue(value: FormDataEntryValue): unknown {
  if (typeof value !== "string") return value; // File
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      /* no es JSON válido, seguimos */
    }
  }
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}

/** FormData → objeto plano, acumulando claves repetidas como arrays. */
function formDataToObject(formData: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    const parsed = parseFormValue(value);
    if (key in out) {
      const current = out[key];
      if (Array.isArray(current)) current.push(parsed);
      else out[key] = [current, parsed];
    } else {
      out[key] = parsed;
    }
  }
  return out;
}

// 
// Handler
// 

export async function POST(request: NextRequest) {
  try {
    // Solo afiliados con membresía ACTIVA.
    const { session } = await requireAfiliado(["ACTIVO"]);
    const userId = session.user.id;

    const formData = await request.formData();
    const raw = formDataToObject(formData);

    // Validar contra el mismo schema del formulario.
    const schema = buildRegistroSchema();
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Datos inválidos.",
          errors: z.treeifyError(parsed.error),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    //  Persistencia atómica 
    await db.transaction(async (tx) => {
      // 1) Tabla afiliados
      await tx
        .update(afiliados)
        .set({
          // Datos generales
          apellidoPaterno: data.apellido_paterno,
          apellidoMaterno: data.apellido_materno,
          nombres: data.nombres,
          genero: data.genero,

          // Contacto
          telefonoCelular: data.telefono_celular,
          telefonoCasa: emptyToNull(data.telefono_casa),
          correoElectronico: data.correo_electronico,
          linkedin: emptyToNull(data.linkedin),
          orcid: emptyToNull(data.orcid),
          sitioWeb: emptyToNull(data.sitio_web),

          // Ubicación
          estadoResidencia: data.estado_residencia,
          ciudadResidencia: data.ciudad_residencia,
          disponibilidadGeografica: data.disponibilidad_geografica,

          // Perfil profesional
          areaConocimiento: data.area_conocimiento,
          areaConocimientoOtro: emptyToNull(data.area_conocimiento_otro),
          perfilProfesional: data.perfil_profesional,
          palabrasClave: data.palabras_clave,
          habilidadesTecnologicas: data.habilidades_tecnologicas,

          // Servicios
          tipoServicios: data.tipo_servicios,
          tipoServiciosOtro: emptyToNull(data.tipo_servicios_otro),
          descripcionServicios: data.descripcion_servicios,
          sectores: data.sectores,
          sectoresOtro: emptyToNull(data.sectores_otro),
          modalidadServicios: data.modalidad_servicios,
          interesadoEn: data.interesado_en,
          interesadoEnOtro: emptyToNull(data.interesado_en_otro),

          // Visibilidad
          autorizaPublicacion: data.autoriza_publicacion,
          datosPublicos: data.datos_publicos,
          updatedAt: new Date(),
        })
        .where(eq(afiliados.userId, userId));

      // 2) Proyectos relevantes: reemplazo total (0–5).
      await tx
        .delete(proyectosRelevantes)
        .where(eq(proyectosRelevantes.afiliadoId, userId));

      if (data.proyectos_relevantes.length > 0) {
        await tx.insert(proyectosRelevantes).values(
          data.proyectos_relevantes.map((p) => ({
            afiliadoId: userId,
            nombre: p.nombre,
            descripcion: p.descripcion,
            rol: p.rol,
            anio: p.anio,
          })),
        );
      }

      // 3) Datos de emergencia: upsert (relación 1:1 con afiliado).
      const emergenciaPayload = {
        afiliadoId: userId,
        nombreContacto: data.nombre_contacto_emergencia,
        parentesco: data.parentesco_contacto_emergencia,
        parentescoOtro: emptyToNull(
          data.parentesco_contacto_emergencia_otro,
        ),
        telefono: data.telefono_contacto_emergencia,
        tipoSanguineo: data.tipo_sanguineo,
        alergiasCondicionesMedicas: emptyToNull(
          data.alergias_condiciones_medicas,
        ),
        mostrarEnQr: data.privacidad_datos_emergencia,
        updatedAt: new Date(),
      };

      const existente = await tx.query.datosEmergencia.findFirst({
        where: { afiliadoId: userId },
        columns: { id: true },
      });

      if (existente) {
        await tx
          .update(datosEmergencia)
          .set(emergenciaPayload)
          .where(eq(datosEmergencia.afiliadoId, userId));
      } else {
        await tx.insert(datosEmergencia).values(emergenciaPayload);
      }
    });

    return NextResponse.json(
      { message: "Datos actualizados correctamente." },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status },
      );
    }

    console.error("[actualizar-datos] Error inesperado:", error);
    return NextResponse.json(
      { message: "Ocurrió un error inesperado. Intenta de nuevo." },
      { status: 500 },
    );
  }
}