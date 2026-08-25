// lib/db/solicitudes/queries.ts
import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { afiliados } from "@/lib/db/schema/afiliados";
import { archivos } from "@/lib/db/schema/archivo";
import { solicitudes, SolicitudRow } from "@/lib/db/schema/solicitudes";
import type { SolicitudDatosSnapshot } from "@/lib/registro/solicitud-snapshot";
import { proyectosRelevantes } from "@/lib/db/schema/afiliados";
import { datosEmergencia } from "@/lib/db/schema/afiliados";
import {
  membershipStatusEnum,
  revisionDecisionEnum,
} from "@/lib/db/schema/enums";
import { emptyToNull } from "@/lib/registro/utils";
import type { Afiliado } from "@/lib/db/schema/afiliados";

const VERSIONES_A_CONSERVAR = 2;

type ArchivoSubido = {
  bucket: string;
  objectKey: string;
  originalName: string;
  contentType: string;
  size: number;
};

export type CrearSolicitudInput = {
  afiliadoId: string;
  datos: SolicitudDatosSnapshot;
  archivos: {
    fotografia: ArchivoSubido;
    comprobanteMembresia: ArchivoSubido;
  };
};

export type ArchivoParaEliminar = { bucket: string; objectKey: string };

export class EstadoInvalidoError extends Error {
  constructor() {
    super("El afiliado ya no puede enviar una nueva solicitud.");
    this.name = "EstadoInvalidoError";
  }
}

/**
 * Crea una nueva versión ("actual") de la solicitud de un afiliado. Solo
 * conserva esta y la inmediatamente anterior; cualquier versión más
 * vieja se elimina de la BD dentro de la misma transacción. Los objetos
 * en Garage de las versiones podadas se devuelven en
 * `archivosParaEliminar` para borrarlos DESPUÉS de confirmar la
 * transacción (no se puede llamar a Garage dentro de la tx).
 */
export async function crearSolicitud(input: CrearSolicitudInput): Promise<{
  solicitud: typeof solicitudes.$inferSelect;
  archivosParaEliminar: ArchivoParaEliminar[];
}> {
  return db.transaction(async (tx) => {
    // 1. Bloqueamos la fila del afiliado: serializa envíos concurrentes y
    //    revalida el estado dentro de la tx (defensa en profundidad; el
    //    endpoint ya valida esto antes de subir archivos).
    const [afiliado] = await tx
      .select({ membershipStatus: afiliados.membershipStatus })
      .from(afiliados)
      .where(eq(afiliados.userId, input.afiliadoId))
      .for("update");

    if (
      !afiliado ||
      !["NO_INICIADA", "REQUIERE_CORRECCION"].includes(
        afiliado.membershipStatus,
      )
    ) {
      throw new EstadoInvalidoError();
    }

    // 2. Metadatos de los archivos recién subidos a Garage.
    const [fotografiaArchivo] = await tx
      .insert(archivos)
      .values({
        bucket: input.archivos.fotografia.bucket,
        objectKey: input.archivos.fotografia.objectKey,
        originalName: input.archivos.fotografia.originalName,
        contentType: input.archivos.fotografia.contentType,
        size: input.archivos.fotografia.size,
        //ownerId: input.afiliadoId,
      })
      .returning({ id: archivos.id });

    const [comprobanteArchivo] = await tx
      .insert(archivos)
      .values({
        bucket: input.archivos.comprobanteMembresia.bucket,
        objectKey: input.archivos.comprobanteMembresia.objectKey,
        originalName: input.archivos.comprobanteMembresia.originalName,
        contentType: input.archivos.comprobanteMembresia.contentType,
        size: input.archivos.comprobanteMembresia.size,
        //ownerId: input.afiliadoId,
      })
      .returning({ id: archivos.id });

    // 3. Siguiente número de versión para este afiliado.
    const [{ maxVersion }] = await tx
      .select({
        maxVersion: sql<number | null>`max(${solicitudes.version})`,
      })
      .from(solicitudes)
      .where(eq(solicitudes.afiliadoId, input.afiliadoId));

    const siguienteVersion = (maxVersion ?? 0) + 1;

    // 4. Insertamos la nueva versión "actual".
    const [nuevaSolicitud] = await tx
      .insert(solicitudes)
      .values({
        afiliadoId: input.afiliadoId,
        version: siguienteVersion,
        datos: input.datos,
        fotografiaArchivoId: fotografiaArchivo.id,
        comprobanteMembresiaArchivoId: comprobanteArchivo.id,
      })
      .returning();

    // 5. Podamos versiones más allá de las últimas 2 (fila + archivos).
    const solicitudesAntiguas = await tx
      .select({
        id: solicitudes.id,
        fotografiaArchivoId: solicitudes.fotografiaArchivoId,
        comprobanteMembresiaArchivoId:
          solicitudes.comprobanteMembresiaArchivoId,
      })
      .from(solicitudes)
      .where(eq(solicitudes.afiliadoId, input.afiliadoId))
      .orderBy(desc(solicitudes.version))
      .offset(VERSIONES_A_CONSERVAR);

    const archivosParaEliminar: ArchivoParaEliminar[] = [];

    if (solicitudesAntiguas.length > 0) {
      const archivoIds = solicitudesAntiguas.flatMap((s) => [
        s.fotografiaArchivoId,
        s.comprobanteMembresiaArchivoId,
      ]);

      const archivosAEliminar = await tx
        .select({
          id: archivos.id,
          bucket: archivos.bucket,
          objectKey: archivos.objectKey,
        })
        .from(archivos)
        .where(inArray(archivos.id, archivoIds));

      archivosParaEliminar.push(
        ...archivosAEliminar.map((a) => ({
          bucket: a.bucket,
          objectKey: a.objectKey,
        })),
      );

      // Orden importa: primero solicitudes (referencian archivos), luego archivos.
      await tx.delete(solicitudes).where(
        inArray(
          solicitudes.id,
          solicitudesAntiguas.map((s) => s.id),
        ),
      );

      await tx.delete(archivos).where(inArray(archivos.id, archivoIds));
    }

    // 6. El afiliado queda pendiente de revisión.
    await tx
      .update(afiliados)
      .set({ membershipStatus: "PENDIENTE_APROBACION" })
      .where(eq(afiliados.userId, input.afiliadoId));

    return { solicitud: nuevaSolicitud, archivosParaEliminar };
  });
}

//---
//---
//---

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// ---------------------------------------------------------------------------
// Listado (panel de admin)
// ---------------------------------------------------------------------------

export type SolicitudListEstado =
  | "REQUIERE_ATENCION"
  | "EN_CORRECCION"
  | "RECHAZADA"
  | "APROBADA";

export type SolicitudListItem = {
  solicitudId: string;
  afiliadoId: string;
  version: number;
  createdAt: Date;
  revisionDecision: (typeof revisionDecisionEnum.enumValues)[number] | null;
  revisionObservaciones: string | null;
  revisadoEn: Date | null;
  membershipStatus: Afiliado["membershipStatus"];
  nombres: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  correoElectronico: string | null;
  estado: SolicitudListEstado;
};

/**
 * Devuelve la "solicitud actual" (versión más alta) de cada afiliado que
 * tenga al menos una solicitud, opcionalmente filtrada por estado derivado.
 */
export async function listarSolicitudes(params: {
  estado?: SolicitudListEstado;
  limit: number;
  offset: number;
}): Promise<SolicitudListItem[]> {
  const ultimaVersion = db.$with("ultima_version").as(
    db
      .selectDistinctOn([solicitudes.afiliadoId], {
        id: solicitudes.id,
        afiliadoId: solicitudes.afiliadoId,
        version: solicitudes.version,
        datos: solicitudes.datos,
        revisionDecision: solicitudes.revisionDecision,
        revisionObservaciones: solicitudes.revisionObservaciones,
        revisadoEn: solicitudes.revisadoEn,
        createdAt: solicitudes.createdAt,
      })
      .from(solicitudes)
      .orderBy(solicitudes.afiliadoId, desc(solicitudes.version)),
  );

  const estadoCase = sql<SolicitudListEstado>`
    CASE
      WHEN ${ultimaVersion.revisionDecision} IS NULL THEN 'REQUIERE_ATENCION'
      WHEN ${ultimaVersion.revisionDecision} = 'REQUIERE_CORRECCION' THEN 'EN_CORRECCION'
      WHEN ${ultimaVersion.revisionDecision} = 'RECHAZADO' THEN 'RECHAZADA'
      ELSE 'APROBADA'
    END
  `;

  return db
    .with(ultimaVersion)
    .select({
      solicitudId: ultimaVersion.id,
      afiliadoId: ultimaVersion.afiliadoId,
      version: ultimaVersion.version,
      createdAt: ultimaVersion.createdAt,
      revisionDecision: ultimaVersion.revisionDecision,
      revisionObservaciones: ultimaVersion.revisionObservaciones,
      revisadoEn: ultimaVersion.revisadoEn,
      membershipStatus: afiliados.membershipStatus,
      nombres: sql<string | null>`${ultimaVersion.datos} ->> 'nombres'`,
      apellidoPaterno: sql<
        string | null
      >`${ultimaVersion.datos} ->> 'apellido_paterno'`,
      apellidoMaterno: sql<
        string | null
      >`${ultimaVersion.datos} ->> 'apellido_materno'`,
      correoElectronico: sql<
        string | null
      >`${ultimaVersion.datos} ->> 'correo_electronico'`,
      estado: estadoCase,
    })
    .from(ultimaVersion)
    .innerJoin(afiliados, eq(afiliados.userId, ultimaVersion.afiliadoId))
    .where(params.estado ? sql`${estadoCase} = ${params.estado}` : undefined)
    .orderBy(desc(ultimaVersion.createdAt))
    .limit(params.limit)
    .offset(params.offset);
}

export async function contarSolicitudes(params: {
  estado?: SolicitudListEstado;
}): Promise<number> {
  const ultimaVersion = db.$with("ultima_version").as(
    db
      .selectDistinctOn([solicitudes.afiliadoId], {
        afiliadoId: solicitudes.afiliadoId,
        revisionDecision: solicitudes.revisionDecision,
      })
      .from(solicitudes)
      .orderBy(solicitudes.afiliadoId, desc(solicitudes.version)),
  );

  const estadoCase = sql<SolicitudListEstado>`
    CASE
      WHEN ${ultimaVersion.revisionDecision} IS NULL THEN 'REQUIERE_ATENCION'
      WHEN ${ultimaVersion.revisionDecision} = 'REQUIERE_CORRECCION' THEN 'EN_CORRECCION'
      WHEN ${ultimaVersion.revisionDecision} = 'RECHAZADO' THEN 'RECHAZADA'
      ELSE 'APROBADA'
    END
  `;

  const [{ total }] = await db
    .with(ultimaVersion)
    .select({ total: sql<number>`count(*)::int` })
    .from(ultimaVersion)
    .where(params.estado ? sql`${estadoCase} = ${params.estado}` : undefined);

  return total;
}

// ---------------------------------------------------------------------------
// Detalle (versiones completas de un afiliado, para el tab de solo lectura)
// ---------------------------------------------------------------------------

/* export async function obtenerVersionesSolicitud(afiliadoId: string) {
  return db.query.solicitudes.findMany({
    where: eq(solicitudes.afiliadoId, afiliadoId),
    orderBy: desc(solicitudes.version),
    with: {
      fotografia: true,
      comprobanteMembresia: true,
      revisadoPor: {
        columns: { userId: true, nombreCompleto: true },
      },
    },
  });
} */

export async function obtenerVersionesSolicitud(afiliadoId: string) {
  return db.query.solicitudes.findMany({
    where: {
      afiliadoId: afiliadoId,
    },
    orderBy: {
      version: "desc",
    },
    with: {
      fotografia: true,
      comprobanteMembresia: true,
      revisadoPor: {
        columns: {
          userId: true,
          nombreCompleto: true,
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Resolver (APROBAR / REQUERIR_CORRECCION / RECHAZAR)
// ---------------------------------------------------------------------------

export class SolicitudNoEncontradaError extends Error {
  constructor() {
    super("La solicitud no existe.");
    this.name = "SolicitudNoEncontradaError";
  }
}

export class SolicitudNoVigenteError extends Error {
  constructor() {
    super("Esta ya no es la versión vigente de la solicitud del afiliado.");
    this.name = "SolicitudNoVigenteError";
  }
}

export class SolicitudYaAtendidaError extends Error {
  constructor() {
    super("Esta solicitud ya fue atendida.");
    this.name = "SolicitudYaAtendidaError";
  }
}

export type ResolverSolicitudInput = {
  solicitudId: string;
  adminId: string;
  decision: (typeof revisionDecisionEnum.enumValues)[number];
  observaciones: string | null;
};

const MEMBERSHIP_STATUS_POR_DECISION: Record<
  (typeof revisionDecisionEnum.enumValues)[number],
  (typeof membershipStatusEnum.enumValues)[number]
> = {
  APROBADO: "ACTIVO",
  REQUIERE_CORRECCION: "REQUIERE_CORRECCION",
  RECHAZADO: "RECHAZADO",
};

/**
 * Copia el snapshot de la solicitud aprobada como datos definitivos del
 * afiliado. No sube archivos nuevos: reapunta los mismos `archivos.id` que
 * ya trae la solicitud. No toca `membershipStatus` (eso lo hace el llamador,
 * de forma uniforme para las 3 decisiones).
 */
async function finalizarAfiliado(
  tx: Tx,
  params: { afiliadoId: string; solicitud: SolicitudRow },
) {
  const datos = params.solicitud.datos;

  await tx
    .update(afiliados)
    .set({
      apellidoPaterno: datos.apellido_paterno,
      apellidoMaterno: datos.apellido_materno,
      nombres: datos.nombres,
      genero: datos.genero,

      fotografiaArchivoId: params.solicitud.fotografiaArchivoId,
      comprobanteMembresiaArchivoId:
        params.solicitud.comprobanteMembresiaArchivoId,

      telefonoCelular: datos.telefono_celular,
      telefonoCasa: emptyToNull(datos.telefono_casa),
      correoElectronico: datos.correo_electronico,
      linkedin: emptyToNull(datos.linkedin),
      orcid: emptyToNull(datos.orcid),
      sitioWeb: emptyToNull(datos.sitio_web),

      estadoResidencia: datos.estado_residencia,
      ciudadResidencia: datos.ciudad_residencia,
      disponibilidadGeografica: datos.disponibilidad_geografica,

      areaConocimiento: datos.area_conocimiento,
      areaConocimientoOtro: emptyToNull(datos.area_conocimiento_otro),
      perfilProfesional: datos.perfil_profesional,
      palabrasClave: datos.palabras_clave,
      habilidadesTecnologicas: datos.habilidades_tecnologicas,

      tipoServicios: datos.tipo_servicios,
      tipoServiciosOtro: emptyToNull(datos.tipo_servicios_otro),
      descripcionServicios: datos.descripcion_servicios,
      sectores: datos.sectores,
      sectoresOtro: emptyToNull(datos.sectores_otro),
      modalidadServicios: datos.modalidad_servicios,
      interesadoEn: datos.interesado_en,
      interesadoEnOtro: emptyToNull(datos.interesado_en_otro),

      autorizaPublicacion: datos.autoriza_publicacion,
      datosPublicos: datos.datos_publicos,
    })
    .where(eq(afiliados.userId, params.afiliadoId));

  // Proyectos relevantes: reemplazo total (son ≤5 y vienen completos en el snapshot).
  await tx
    .delete(proyectosRelevantes)
    .where(eq(proyectosRelevantes.afiliadoId, params.afiliadoId));

  if (datos.proyectos_relevantes.length > 0) {
    await tx.insert(proyectosRelevantes).values(
      datos.proyectos_relevantes.map((p) => ({
        afiliadoId: params.afiliadoId,
        nombre: p.nombre,
        descripcion: p.descripcion,
        rol: p.rol,
        anio: p.anio,
      })),
    );
  }

  // Datos de emergencia: upsert (unique en afiliado_id).
  await tx
    .insert(datosEmergencia)
    .values({
      afiliadoId: params.afiliadoId,
      nombreContacto: datos.nombre_contacto_emergencia,
      parentesco: datos.parentesco_contacto_emergencia,
      parentescoOtro: emptyToNull(datos.parentesco_contacto_emergencia_otro),
      telefono: datos.telefono_contacto_emergencia,
      tipoSanguineo: datos.tipo_sanguineo,
      alergiasCondicionesMedicas: emptyToNull(
        datos.alergias_condiciones_medicas,
      ),
      mostrarEnQr: datos.privacidad_datos_emergencia,
    })
    .onConflictDoUpdate({
      target: datosEmergencia.afiliadoId,
      set: {
        nombreContacto: datos.nombre_contacto_emergencia,
        parentesco: datos.parentesco_contacto_emergencia,
        parentescoOtro: emptyToNull(datos.parentesco_contacto_emergencia_otro),
        telefono: datos.telefono_contacto_emergencia,
        tipoSanguineo: datos.tipo_sanguineo,
        alergiasCondicionesMedicas: emptyToNull(
          datos.alergias_condiciones_medicas,
        ),
        mostrarEnQr: datos.privacidad_datos_emergencia,
      },
    });
}

export async function resolverSolicitud(
  input: ResolverSolicitudInput,
): Promise<SolicitudRow> {
  return db.transaction(async (tx) => {
    // 1. Bloqueamos la solicitud.
    const [solicitud] = await tx
      .select()
      .from(solicitudes)
      .where(eq(solicitudes.id, input.solicitudId))
      .for("update");

    if (!solicitud) {
      throw new SolicitudNoEncontradaError();
    }

    // 2. ¿Sigue siendo la versión vigente? (pudo haberse resubmitido).
    const [{ maxVersion }] = await tx
      .select({ maxVersion: sql<number>`max(${solicitudes.version})` })
      .from(solicitudes)
      .where(eq(solicitudes.afiliadoId, solicitud.afiliadoId));

    if (Number(maxVersion) !== solicitud.version) {
      throw new SolicitudNoVigenteError();
    }

    if (solicitud.revisionDecision !== null) {
      throw new SolicitudYaAtendidaError();
    }

    // 3. Bloqueamos y validamos el afiliado (evita doble revisión concurrente).
    const [afiliado] = await tx
      .select({ membershipStatus: afiliados.membershipStatus })
      .from(afiliados)
      .where(eq(afiliados.userId, solicitud.afiliadoId))
      .for("update");

    if (!afiliado || afiliado.membershipStatus !== "PENDIENTE_APROBACION") {
      throw new SolicitudYaAtendidaError();
    }

    // 4. Guardamos la revisión en la versión actual.
    const [solicitudActualizada] = await tx
      .update(solicitudes)
      .set({
        revisionDecision: input.decision,
        revisionObservaciones: input.observaciones,
        revisadoPorAdminId: input.adminId,
        revisadoEn: new Date(),
      })
      .where(eq(solicitudes.id, solicitud.id))
      .returning();

    // 5. Si se aprueba, los datos pasan a ser definitivos en `afiliados`.
    if (input.decision === "APROBADO") {
      await finalizarAfiliado(tx, {
        afiliadoId: solicitud.afiliadoId,
        solicitud,
      });
    }

    // 6. Actualizamos el estado de membresía (uniforme para las 3 decisiones).
    await tx
      .update(afiliados)
      .set({ membershipStatus: MEMBERSHIP_STATUS_POR_DECISION[input.decision] })
      .where(eq(afiliados.userId, solicitud.afiliadoId));

    return solicitudActualizada;
  });
}

//---

// lib/db/solicitudes/queries.ts (agregar)

export type SolicitudActualParaAfiliado = {
  version: number;
  datos: SolicitudDatosSnapshot;
  revisionObservaciones: string | null;
  fotografia: { originalName: string; objectKey: string; contentType: string };
  comprobanteMembresia: {
    originalName: string;
    objectKey: string;
    contentType: string;
  };
};

/**
 * Última versión de la solicitud de un afiliado, pensada para precargar el
 * formulario de registro cuando su estado es REQUIERE_CORRECCION. Devuelve
 * `objectKey` (no una URL firmada) para no acoplar esta query a Garage; el
 * caller decide cuándo y con qué expiración generar la URL.
 */
export async function obtenerSolicitudActualParaAfiliado(
  afiliadoId: string,
): Promise<SolicitudActualParaAfiliado | null> {
  const solicitud = await db.query.solicitudes.findFirst({
    where: {
      afiliadoId: afiliadoId,
    },
    orderBy: {
      version: "desc",
    },
    with: {
      fotografia: {
        columns: {
          originalName: true,
          objectKey: true,
          contentType: true,
        },
      },
      comprobanteMembresia: {
        columns: {
          originalName: true,
          objectKey: true,
          contentType: true,
        },
      },
    },
  });

  if (!solicitud) return null;

  return {
    version: solicitud.version,
    datos: solicitud.datos,
    revisionObservaciones: solicitud.revisionObservaciones,
    fotografia: solicitud.fotografia,
    comprobanteMembresia: solicitud.comprobanteMembresia,
  };
}
