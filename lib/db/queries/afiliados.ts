// @/lib/db/queries/afiliados.ts
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  afiliados,
  datosEmergencia,
  proyectosRelevantes,
} from "@/lib/db/schema/afiliados";
import { archivos } from "@/lib/db/schema/archivo";
import { sessions } from "@/lib/db/schema/auth-schema";
import { ApiError } from "@/lib/errors";
import { getFileUrl } from "@/lib/storage";
import {
  MEMBERSHIP_STATUS_FILTRABLE,
  type ListadoAfiliadosQuery,
  type SortByAfiliados,
  type SortOrderAfiliados,
} from "@/lib/validations/afiliados";

/**
 * NOTA: `getFileUrl` recibe un `StorageTarget` lógico (la clave de
 * `storageConfig.buckets` en `@/lib/storage/index.ts`), no el nombre crudo
 * de bucket guardado en `archivos.bucket`. Ajusta esta constante al target
 * real que corresponde a las fotografías de afiliados en tu configuración
 * de storage.
 */
const FOTOGRAFIAS_STORAGE_TARGET = "fotografias" as Parameters<
  typeof getFileUrl
>[0];

function formatApellidos(
  apellidoPaterno: string | null,
  apellidoMaterno: string | null,
): string | null {
  const apellidos = [apellidoPaterno, apellidoMaterno]
    .filter((parte): parte is string => Boolean(parte && parte.trim()))
    .join(" ")
    .trim();
  return apellidos.length > 0 ? apellidos : null;
}

function buildOrderBy(
  sortBy: SortByAfiliados,
  sortOrder: SortOrderAfiliados,
): SQL[] {
  const dir = sortOrder === "asc" ? asc : desc;

  if (sortBy === "folio") {
    return [dir(afiliados.folio), dir(afiliados.userId)];
  }

  if (sortBy === "apellidos") {
    return [
      dir(afiliados.apellidoPaterno),
      dir(afiliados.apellidoMaterno),
      dir(afiliados.userId),
    ];
  }

  // sortBy === "nombres"
  return [dir(afiliados.nombres), dir(afiliados.userId)];
}

export interface AfiliadoListItem {
  userId: string;
  nombres: string | null;
  apellidos: string | null;
  membershipStatus: (typeof MEMBERSHIP_STATUS_FILTRABLE)[number];
  folio: string | null;
  estadoResidencia: string | null;
  ciudadResidencia: string | null;
  correoElectronico: string | null;
}

export interface ListadoAfiliadosResult {
  items: AfiliadoListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function listarAfiliados(
  query: ListadoAfiliadosQuery,
): Promise<ListadoAfiliadosResult> {
  const {
    page,
    pageSize,
    search,
    estadoResidencia,
    ciudadResidencia,
    membershipStatus,
    sortBy,
    sortOrder,
  } = query;

  const conditions: SQL[] = [
    inArray(afiliados.membershipStatus, MEMBERSHIP_STATUS_FILTRABLE),
  ];

  if (membershipStatus) {
    conditions.push(eq(afiliados.membershipStatus, membershipStatus));
  }

  if (estadoResidencia) {
    conditions.push(eq(afiliados.estadoResidencia, estadoResidencia));
  }

  if (ciudadResidencia) {
    conditions.push(ilike(afiliados.ciudadResidencia, `%${ciudadResidencia}%`));
  }

  if (search) {
    const clause = or(
      ilike(afiliados.nombres, `%${search}%`),
      ilike(afiliados.apellidoPaterno, `%${search}%`),
      ilike(afiliados.apellidoMaterno, `%${search}%`),
      ilike(afiliados.folio, `%${search}%`),
      ilike(afiliados.correoElectronico, `%${search}%`),
    );
    if (clause) conditions.push(clause);
  }

  const whereClause = and(...conditions)!;
  const orderBy = buildOrderBy(sortBy, sortOrder);
  const offset = (page - 1) * pageSize;

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        userId: afiliados.userId,
        nombres: afiliados.nombres,
        apellidoPaterno: afiliados.apellidoPaterno,
        apellidoMaterno: afiliados.apellidoMaterno,
        membershipStatus: afiliados.membershipStatus,
        folio: afiliados.folio,
        estadoResidencia: afiliados.estadoResidencia,
        ciudadResidencia: afiliados.ciudadResidencia,
        correoElectronico: afiliados.correoElectronico,
      })
      .from(afiliados)
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(afiliados)
      .where(whereClause),
  ]);

  const total = totalRows[0]?.count ?? 0;

  return {
    items: rows.map((row) => ({
      userId: row.userId,
      nombres: row.nombres,
      apellidos: formatApellidos(row.apellidoPaterno, row.apellidoMaterno),
      membershipStatus:
        row.membershipStatus as (typeof MEMBERSHIP_STATUS_FILTRABLE)[number],
      folio: row.folio,
      estadoResidencia: row.estadoResidencia,
      ciudadResidencia: row.ciudadResidencia,
      correoElectronico: row.correoElectronico,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

async function resolverFotografiaUrl(
  fotografiaArchivoId: string | null,
): Promise<string | null> {
  if (!fotografiaArchivoId) return null;

  const [archivo] = await db
    .select({ objectKey: archivos.objectKey })
    .from(archivos)
    .where(eq(archivos.id, fotografiaArchivoId))
    .limit(1);

  if (!archivo) return null;

  try {
    return await getFileUrl(FOTOGRAFIAS_STORAGE_TARGET, archivo.objectKey);
  } catch (error) {
    // Si falla la generación de la URL firmada (p. ej. el objeto ya no
    // existe en el bucket), el detalle sigue funcionando sin fotografía en
    // vez de reventar toda la respuesta.
    console.error(
      "[afiliados] No se pudo firmar la URL de la fotografía:",
      error,
    );
    return null;
  }
}

export interface AfiliadoDetalle {
  userId: string;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  nombres: string | null;
  genero: string | null;
  membershipStatus: string;
  motivoSuspension: string | null;
  folio: string | null;
  telefonoCelular: string | null;
  telefonoCasa: string | null;
  correoElectronico: string | null;
  linkedin: string | null;
  orcid: string | null;
  sitioWeb: string | null;
  estadoResidencia: string | null;
  ciudadResidencia: string | null;
  disponibilidadGeografica: string[] | null;
  areaConocimiento: string[] | null;
  areaConocimientoOtro: string | null;
  perfilProfesional: string | null;
  palabrasClave: string[] | null;
  habilidadesTecnologicas: string | null;
  tipoServicios: string[] | null;
  tipoServiciosOtro: string | null;
  descripcionServicios: string | null;
  sectores: string[] | null;
  sectoresOtro: string | null;
  modalidadServicios: string[] | null;
  interesadoEn: string[] | null;
  interesadoEnOtro: string | null;
  autorizaPublicacion: boolean | null;
  datosPublicos: string[] | null;
  fotografiaUrl: string | null;
  proyectosRelevantes: {
    id: string;
    nombre: string;
    descripcion: string;
    rol: string;
    anio: number;
  }[];
  datosEmergencia: {
    id: string;
    nombreContacto: string;
    parentesco: string;
    parentescoOtro: string | null;
    telefono: string;
    tipoSanguineo: string;
    alergiasCondicionesMedicas: string | null;
    mostrarEnQr: boolean;
  } | null;
}

export async function obtenerAfiliadoDetalle(
  userId: string,
): Promise<AfiliadoDetalle | null> {
  const [afiliado] = await db
    .select({
      userId: afiliados.userId,
      apellidoPaterno: afiliados.apellidoPaterno,
      apellidoMaterno: afiliados.apellidoMaterno,
      nombres: afiliados.nombres,
      fotografiaArchivoId: afiliados.fotografiaArchivoId,
      genero: afiliados.genero,
      membershipStatus: afiliados.membershipStatus,
      motivoSuspension: afiliados.motivoSuspension,
      folio: afiliados.folio,
      telefonoCelular: afiliados.telefonoCelular,
      telefonoCasa: afiliados.telefonoCasa,
      correoElectronico: afiliados.correoElectronico,
      linkedin: afiliados.linkedin,
      orcid: afiliados.orcid,
      sitioWeb: afiliados.sitioWeb,
      estadoResidencia: afiliados.estadoResidencia,
      ciudadResidencia: afiliados.ciudadResidencia,
      disponibilidadGeografica: afiliados.disponibilidadGeografica,
      areaConocimiento: afiliados.areaConocimiento,
      areaConocimientoOtro: afiliados.areaConocimientoOtro,
      perfilProfesional: afiliados.perfilProfesional,
      palabrasClave: afiliados.palabrasClave,
      habilidadesTecnologicas: afiliados.habilidadesTecnologicas,
      tipoServicios: afiliados.tipoServicios,
      tipoServiciosOtro: afiliados.tipoServiciosOtro,
      descripcionServicios: afiliados.descripcionServicios,
      sectores: afiliados.sectores,
      sectoresOtro: afiliados.sectoresOtro,
      modalidadServicios: afiliados.modalidadServicios,
      interesadoEn: afiliados.interesadoEn,
      interesadoEnOtro: afiliados.interesadoEnOtro,
      autorizaPublicacion: afiliados.autorizaPublicacion,
      datosPublicos: afiliados.datosPublicos,
    })
    .from(afiliados)
    .where(eq(afiliados.userId, userId))
    .limit(1);

  if (!afiliado) return null;

  const [proyectos, emergenciaRows, fotografiaUrl] = await Promise.all([
    db
      .select({
        id: proyectosRelevantes.id,
        nombre: proyectosRelevantes.nombre,
        descripcion: proyectosRelevantes.descripcion,
        rol: proyectosRelevantes.rol,
        anio: proyectosRelevantes.anio,
      })
      .from(proyectosRelevantes)
      .where(eq(proyectosRelevantes.afiliadoId, userId)),
    db
      .select({
        id: datosEmergencia.id,
        nombreContacto: datosEmergencia.nombreContacto,
        parentesco: datosEmergencia.parentesco,
        parentescoOtro: datosEmergencia.parentescoOtro,
        telefono: datosEmergencia.telefono,
        tipoSanguineo: datosEmergencia.tipoSanguineo,
        alergiasCondicionesMedicas: datosEmergencia.alergiasCondicionesMedicas,
        mostrarEnQr: datosEmergencia.mostrarEnQr,
      })
      .from(datosEmergencia)
      .where(eq(datosEmergencia.afiliadoId, userId))
      .limit(1),
    resolverFotografiaUrl(afiliado.fotografiaArchivoId),
  ]);

  const { fotografiaArchivoId: _omitido, ...afiliadoSinArchivoId } = afiliado;

  return {
    ...afiliadoSinArchivoId,
    fotografiaUrl,
    proyectosRelevantes: proyectos,
    datosEmergencia: emergenciaRows[0] ?? null,
  };
}

export interface CambioEstadoResultado {
  userId: string;
  membershipStatus: "ACTIVO" | "SUSPENDIDO";
}

/**
 * Suspende a un afiliado ACTIVO y revoca todas sus sesiones activas en una
 * sola transacción: si cualquiera de las dos operaciones falla, ambas se
 * revierten y no se reporta éxito.
 */
export async function suspenderAfiliado(
  userId: string,
  motivo: string,
): Promise<CambioEstadoResultado> {
  return db.transaction(async (tx) => {
    const [afiliado] = await tx
      .select({
        userId: afiliados.userId,
        membershipStatus: afiliados.membershipStatus,
      })
      .from(afiliados)
      .where(eq(afiliados.userId, userId))
      .limit(1);

    if (!afiliado) {
      throw ApiError.notFound("El afiliado no existe.");
    }

    if (afiliado.membershipStatus !== "ACTIVO") {
      throw ApiError.conflict(
        "Solo se puede suspender a un afiliado que esté ACTIVO.",
        "INVALID_STATUS_TRANSITION",
      );
    }

    // La condición ACTIVO también se repite en el WHERE del UPDATE para
    // protegernos de una condición de carrera entre el SELECT y el UPDATE.
    const [actualizado] = await tx
      .update(afiliados)
      .set({ membershipStatus: "SUSPENDIDO", motivoSuspension: motivo })
      .where(
        and(
          eq(afiliados.userId, userId),
          eq(afiliados.membershipStatus, "ACTIVO"),
        ),
      )
      .returning({ userId: afiliados.userId });

    if (!actualizado) {
      throw ApiError.conflict(
        "El estado del afiliado cambió antes de completar la operación.",
        "INVALID_STATUS_TRANSITION",
      );
    }

    await tx.delete(sessions).where(eq(sessions.userId, userId));

    return { userId, membershipStatus: "SUSPENDIDO" as const };
  });
}

/**
 * Quita la suspensión de un afiliado SUSPENDIDO. No modifica
 * `motivoSuspension`: el motivo del último evento de suspensión se conserva
 * como historial mínimo hasta que se registre uno nuevo.
 */
export async function quitarSuspensionAfiliado(
  userId: string,
): Promise<CambioEstadoResultado> {
  return db.transaction(async (tx) => {
    const [afiliado] = await tx
      .select({
        userId: afiliados.userId,
        membershipStatus: afiliados.membershipStatus,
      })
      .from(afiliados)
      .where(eq(afiliados.userId, userId))
      .limit(1);

    if (!afiliado) {
      throw ApiError.notFound("El afiliado no existe.");
    }

    if (afiliado.membershipStatus !== "SUSPENDIDO") {
      throw ApiError.conflict(
        "Solo se puede quitar la suspensión a un afiliado que esté SUSPENDIDO.",
        "INVALID_STATUS_TRANSITION",
      );
    }

    const [actualizado] = await tx
      .update(afiliados)
      .set({ membershipStatus: "ACTIVO" })
      .where(
        and(
          eq(afiliados.userId, userId),
          eq(afiliados.membershipStatus, "SUSPENDIDO"),
        ),
      )
      .returning({ userId: afiliados.userId });

    if (!actualizado) {
      throw ApiError.conflict(
        "El estado del afiliado cambió antes de completar la operación.",
        "INVALID_STATUS_TRANSITION",
      );
    }

    return { userId, membershipStatus: "ACTIVO" as const };
  });
}
