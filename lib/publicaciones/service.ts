// @/lib/publicaciones/service.ts
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";

import { storageError } from "@/lib/api/http";
import { db } from "@/lib/db/client";
import { archivos } from "@/lib/db/schema/archivo";
import { publicacionAutores } from "@/lib/db/schema/publicaciones";
import { publicacionPalabrasClave } from "@/lib/db/schema/publicaciones";
import { publicaciones } from "@/lib/db/schema/publicaciones";
import { ApiError } from "@/lib/errors";
import { sanitizeFileName } from "./publicacion-pdf";

import { deleteFile, getFileUrl, uploadFile } from "@/lib/storage";
import type { UploadedFile } from "@/lib/storage";
import {
  CURRENT_DESCARGO_VERSION,
  EstadoPublicacion,
  TipoPublicacion,
  escapeSqlLikePattern,
  type CreatePublicacionInput,
  type MisPublicacionesPaginatedResponse,
  type PublicacionAutorResponse,
  type PublicacionDetalleResponse,
  type PublicacionDocumentoResponse,
  type PublicacionListItemResponse,
  type UpdatePublicacionInput,
} from "@/lib/validation/publicaciones";

/* ==========================================================================
   CONSTANTES Y TIPOS
   ========================================================================== */

/** Transacción de Drizzle (el `tx` que recibe `db.transaction`). */
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Permite reutilizar las mismas consultas dentro y fuera de una transacción. */
type DbExecutor = typeof db | Tx;

const STORAGE_TARGET = "afiliados" as const;
const STORAGE_FOLDER = "publicaciones";

/** Vigencia de las URLs firmadas del PDF (15 minutos). */
export const SIGNED_URL_TTL_SECONDS = 900;

const MENSAJE_NO_DISPONIBLE = "La publicación no existe o no está disponible.";

/* ==========================================================================
   HELPERS INTERNOS
   ========================================================================== */

/** Columnas de `publicaciones` que se derivan de los metadatos editables. */
function columnasDeMetadatos(input: UpdatePublicacionInput) {
  return {
    titulo: input.titulo,
    descripcion: input.descripcion,
    tipo: input.tipo,
    // Garantiza el CHECK: tipo_otro solo tiene valor cuando tipo = OTRO.
    tipoOtro: input.tipo === TipoPublicacion.OTRO ? input.tipoOtro : null,
    anioPublicacion: input.anioPublicacion,
    doi: input.doi,
    revistaCongreso: input.revistaCongreso,
    editorial: input.editorial,
    isbn: input.isbn,
    issn: input.issn,
    url: input.url,
  };
}

/**
 * Ordena por el `orden` recibido y lo renumera 1..n, de modo que la posición
 * almacenada siempre sea contigua aunque el cliente envíe huecos (1, 5, 9).
 */
function filasDeAutores(
  publicacionId: string,
  autores: UpdatePublicacionInput["autores"],
) {
  return [...autores]
    .sort((a, b) => a.orden - b.orden)
    .map((autor, index) => ({
      publicacionId,
      nombres: autor.nombres,
      apellidos: autor.apellidos,
      orden: index + 1,
    }));
}

function filasDePalabrasClave(
  publicacionId: string,
  palabras: UpdatePublicacionInput["palabrasClave"],
) {
  return palabras.map((valor) => ({ publicacionId, valor }));
}

/**
 * Verifica existencia y propiedad. Para terceros, una publicación que no
 * está ACTIVO se responde como inexistente (no se revela su existencia).
 */
function exigirPropietario<T extends { afiliadoId: string; estado: string }>(
  actual: T | undefined,
  afiliadoId: string,
  accion: "modificar" | "eliminar",
): T {
  if (!actual) {
    throw ApiError.notFound(MENSAJE_NO_DISPONIBLE);
  }

  if (actual.afiliadoId !== afiliadoId) {
    if (actual.estado !== EstadoPublicacion.ACTIVO) {
      throw ApiError.notFound(MENSAJE_NO_DISPONIBLE);
    }
    throw ApiError.forbidden(
      `No tienes permiso para ${accion} esta publicación.`,
    );
  }

  return actual;
}

/** Elimina el objeto S3 huérfano; nunca lanza (solo registra el fallo). */
async function eliminarObjetoSinFallar(objectKey: string, contexto: string) {
  try {
    await deleteFile(STORAGE_TARGET, objectKey);
  } catch (error) {
    console.error(
      `[${contexto}] No se pudo eliminar el objeto S3 "${objectKey}":`,
      error,
    );
  }
}

/**
 * Carga autores y palabras clave de un conjunto de publicaciones con solo
 * 2 consultas (sin N+1). Las consultas son secuenciales a propósito: dentro
 * de una transacción comparten una única conexión.
 */
export async function cargarRelaciones(
  executor: DbExecutor,
  publicacionIds: string[],
) {
  const autoresPorPublicacion = new Map<string, PublicacionAutorResponse[]>();
  const palabrasPorPublicacion = new Map<string, string[]>();

  if (publicacionIds.length === 0) {
    return { autoresPorPublicacion, palabrasPorPublicacion };
  }

  const autoresRows = await executor
    .select({
      id: publicacionAutores.id,
      publicacionId: publicacionAutores.publicacionId,
      nombres: publicacionAutores.nombres,
      apellidos: publicacionAutores.apellidos,
      orden: publicacionAutores.orden,
    })
    .from(publicacionAutores)
    .where(inArray(publicacionAutores.publicacionId, publicacionIds))
    .orderBy(asc(publicacionAutores.orden));

  for (const autor of autoresRows) {
    const lista = autoresPorPublicacion.get(autor.publicacionId);
    if (lista) lista.push(autor);
    else autoresPorPublicacion.set(autor.publicacionId, [autor]);
  }

  // La tabla no guarda el orden de captura de las palabras clave:
  // se devuelven en orden alfabético para que la respuesta sea determinista.
  const palabrasRows = await executor
    .select({
      publicacionId: publicacionPalabrasClave.publicacionId,
      valor: publicacionPalabrasClave.valor,
    })
    .from(publicacionPalabrasClave)
    .where(inArray(publicacionPalabrasClave.publicacionId, publicacionIds))
    .orderBy(asc(publicacionPalabrasClave.valor));

  for (const palabra of palabrasRows) {
    const lista = palabrasPorPublicacion.get(palabra.publicacionId);
    if (lista) lista.push(palabra.valor);
    else palabrasPorPublicacion.set(palabra.publicacionId, [palabra.valor]);
  }

  return { autoresPorPublicacion, palabrasPorPublicacion };
}

/**
 * Detalle de una publicación ACTIVO (RF-DOC-005).
 * Devuelve solo metadatos del archivo: nunca bucket, object key ni URLs firmadas.
 */
async function obtenerDetalleActivo(
  executor: DbExecutor,
  id: string,
): Promise<PublicacionDetalleResponse | null> {
  const [row] = await executor
    .select({
      id: publicaciones.id,
      afiliadoId: publicaciones.afiliadoId,
      titulo: publicaciones.titulo,
      descripcion: publicaciones.descripcion,
      tipo: publicaciones.tipo,
      tipoOtro: publicaciones.tipoOtro,
      anioPublicacion: publicaciones.anioPublicacion,
      doi: publicaciones.doi,
      revistaCongreso: publicaciones.revistaCongreso,
      editorial: publicaciones.editorial,
      isbn: publicaciones.isbn,
      issn: publicaciones.issn,
      url: publicaciones.url,
      estado: publicaciones.estado,
      descargoVersion: publicaciones.descargoVersion,
      descargoAceptadoAt: publicaciones.descargoAceptadoAt,
      createdAt: publicaciones.createdAt,
      updatedAt: publicaciones.updatedAt,
      archivoId: archivos.id,
      archivoNombre: archivos.originalName,
      archivoContentType: archivos.contentType,
      archivoSize: archivos.size,
      archivoCreatedAt: archivos.createdAt,
    })
    .from(publicaciones)
    .innerJoin(archivos, eq(archivos.id, publicaciones.documentoArchivoId))
    .where(
      and(
        eq(publicaciones.id, id),
        eq(publicaciones.estado, EstadoPublicacion.ACTIVO),
      ),
    )
    .limit(1);

  if (!row) return null;

  const { autoresPorPublicacion, palabrasPorPublicacion } =
    await cargarRelaciones(executor, [row.id]);

  return {
    id: row.id,
    afiliadoId: row.afiliadoId,
    titulo: row.titulo,
    descripcion: row.descripcion,
    tipo: row.tipo,
    tipoOtro: row.tipoOtro,
    anioPublicacion: row.anioPublicacion,
    doi: row.doi,
    revistaCongreso: row.revistaCongreso,
    editorial: row.editorial,
    isbn: row.isbn,
    issn: row.issn,
    url: row.url,
    estado: row.estado,
    descargoVersion: row.descargoVersion,
    descargoAceptadoAt: row.descargoAceptadoAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    autores: autoresPorPublicacion.get(row.id) ?? [],
    palabrasClave: palabrasPorPublicacion.get(row.id) ?? [],
    archivo: {
      id: row.archivoId,
      originalName: row.archivoNombre,
      contentType: row.archivoContentType,
      size: row.archivoSize,
      createdAt: row.archivoCreatedAt,
    },
  };
}

/* ==========================================================================
   GET /api/publicaciones/:id
   ========================================================================== */

export async function obtenerPublicacionActiva(
  id: string,
): Promise<PublicacionDetalleResponse> {
  const detalle = await obtenerDetalleActivo(db, id);
  if (!detalle) throw ApiError.notFound(MENSAJE_NO_DISPONIBLE);
  return detalle;
}

/* ==========================================================================
   GET /api/publicaciones/:id/documento
   ========================================================================== */

/**
 * Genera la URL firmada del PDF bajo demanda. Solo se llama desde el endpoint
 * `/documento`, y únicamente si la publicación existe y está ACTIVO.
 */
export async function generarUrlDocumento(
  publicacionId: string,
): Promise<PublicacionDocumentoResponse> {
  const [row] = await db
    .select({
      objectKey: archivos.objectKey,
      originalName: archivos.originalName,
    })
    .from(publicaciones)
    .innerJoin(archivos, eq(archivos.id, publicaciones.documentoArchivoId))
    .where(
      and(
        eq(publicaciones.id, publicacionId),
        eq(publicaciones.estado, EstadoPublicacion.ACTIVO),
      ),
    )
    .limit(1);

  if (!row) throw ApiError.notFound(MENSAJE_NO_DISPONIBLE);

  // Se toma el instante ANTES de firmar para que `expiresAt` nunca sea
  // posterior a la expiración real de la URL.
  const emitidaEn = Date.now();

  let url: string;
  try {
    url = await getFileUrl(
      STORAGE_TARGET,
      row.objectKey,
      SIGNED_URL_TTL_SECONDS,
    );
  } catch (error) {
    console.error("[generarUrlDocumento] No se pudo firmar la URL:", error);
    throw storageError(
      "No se pudo generar el acceso al documento. Intenta de nuevo más tarde.",
    );
  }

  return {
    url,
    expiresInSeconds: SIGNED_URL_TTL_SECONDS,
    expiresAt: new Date(
      emitidaEn + SIGNED_URL_TTL_SECONDS * 1000,
    ).toISOString(),
    fileName: row.originalName,
  };
}

/* ==========================================================================
   GET /api/afiliados/publicaciones
   ========================================================================== */

/** Colapsa espacios internos; una cadena vacía equivale a "sin búsqueda". */
function normalizarBusqueda(q: string | undefined): string | undefined {
  const normalizado = q?.replace(/\s+/g, " ").trim();
  return normalizado ? normalizado : undefined;
}

/**
 * Filtro de búsqueda (ILIKE, insensible a mayúsculas) sobre título,
 * descripción, autores y palabras clave. El texto se escapa para que
 * `%`, `_` y `\` se traten como literales (el escape por defecto de
 * LIKE/ILIKE en PostgreSQL es la barra invertida).
 */
function construirFiltroBusqueda(termino: string) {
  const patron = `%${escapeSqlLikePattern(termino)}%`;

  return or(
    ilike(publicaciones.titulo, patron),
    ilike(publicaciones.descripcion, patron),
    // "nombres apellidos" cubre coincidencias en nombres, en apellidos o en el
    // nombre completo (ej. "juan perez") con una sola comparación.
    exists(
      db
        .select({ uno: sql`1` })
        .from(publicacionAutores)
        .where(
          and(
            eq(publicacionAutores.publicacionId, publicaciones.id),
            ilike(
              sql`concat_ws(' ', ${publicacionAutores.nombres}, ${publicacionAutores.apellidos})`,
              patron,
            ),
          ),
        ),
    ),
    exists(
      db
        .select({ uno: sql`1` })
        .from(publicacionPalabrasClave)
        .where(
          and(
            eq(publicacionPalabrasClave.publicacionId, publicaciones.id),
            ilike(publicacionPalabrasClave.valor, patron),
          ),
        ),
    ),
  );
}

export async function listarMisPublicaciones(params: {
  /** Debe provenir SIEMPRE de la sesión (`afiliado.userId`), nunca del cliente. */
  afiliadoId: string;
  q?: string;
  page: number;
  pageSize: number;
}): Promise<MisPublicacionesPaginatedResponse> {
  const { afiliadoId, page, pageSize } = params;
  const termino = normalizarBusqueda(params.q);

  // Ambas condiciones se cumplen simultáneamente: propiedad Y coincidencia.
  // Se listan todos los estados (hoy solo existe ACTIVO).
  const where = and(
    eq(publicaciones.afiliadoId, afiliadoId),
    termino ? construirFiltroBusqueda(termino) : undefined,
  );

  const [conteo] = await db
    .select({ total: count() })
    .from(publicaciones)
    .where(where);

  const total = conteo?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  // page > totalPages → lista vacía (sin consultar con un OFFSET fuera de rango).
  if (offset >= total) {
    return { items: [], page, pageSize, total, totalPages };
  }

  const rows = await db
    .select({
      id: publicaciones.id,
      titulo: publicaciones.titulo,
      descripcion: publicaciones.descripcion,
      tipo: publicaciones.tipo,
      tipoOtro: publicaciones.tipoOtro,
      anioPublicacion: publicaciones.anioPublicacion,
      estado: publicaciones.estado,
      createdAt: publicaciones.createdAt,
      updatedAt: publicaciones.updatedAt,
      archivoId: archivos.id,
      archivoNombre: archivos.originalName,
      archivoSize: archivos.size,
    })
    .from(publicaciones)
    .innerJoin(archivos, eq(archivos.id, publicaciones.documentoArchivoId))
    .where(where)
    // `id` como desempate para que la paginación sea estable.
    .orderBy(desc(publicaciones.createdAt), desc(publicaciones.id))
    .limit(pageSize)
    .offset(offset);

  const { autoresPorPublicacion, palabrasPorPublicacion } =
    await cargarRelaciones(
      db,
      rows.map((row) => row.id),
    );

  const items: PublicacionListItemResponse[] = rows.map((row) => ({
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    tipo: row.tipo,
    tipoOtro: row.tipoOtro,
    anioPublicacion: row.anioPublicacion,
    estado: row.estado,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    autores: (autoresPorPublicacion.get(row.id) ?? []).map((autor) => ({
      nombres: autor.nombres,
      apellidos: autor.apellidos,
      orden: autor.orden,
    })),
    palabrasClave: palabrasPorPublicacion.get(row.id) ?? [],
    archivo: {
      id: row.archivoId,
      originalName: row.archivoNombre,
      size: row.archivoSize,
    },
  }));

  return { items, page, pageSize, total, totalPages };
}

/* ==========================================================================
   POST /api/publicaciones
   ========================================================================== */

/**
 * Creación atómica desde el punto de vista del usuario:
 *  1. (El route handler ya validó archivo y metadatos.)
 *  2. Sube el PDF a S3.
 *  3. En UNA transacción: crea `archivo`, `publicaciones`, autores y palabras clave.
 *  4. Si la transacción falla, intenta borrar el objeto de S3 (best effort)
 *     y propaga el error original: nunca se devuelve éxito sin persistencia.
 */
export async function crearPublicacion(params: {
  /** `afiliado.userId` obtenido de la sesión del servidor. */
  afiliadoId: string;
  input: CreatePublicacionInput;
  file: File;
}): Promise<PublicacionDetalleResponse> {
  const { afiliadoId, input, file } = params;

  let subido: UploadedFile;
  try {
    subido = await uploadFile({
      target: STORAGE_TARGET,
      file,
      ownerId: afiliadoId,
      folder: STORAGE_FOLDER,
    });
  } catch (error) {
    console.error("[crearPublicacion] Falló la subida a S3:", error);
    throw storageError(
      "No se pudo almacenar el documento. Intenta de nuevo más tarde.",
    );
  }

  try {
    return await db.transaction(async (tx) => {
      const [archivo] = await tx
        .insert(archivos)
        .values({
          bucket: subido.bucket,
          objectKey: subido.objectKey,
          originalName: sanitizeFileName(file.name),
          contentType: subido.contentType,
          size: subido.size,
        })
        .returning({ id: archivos.id });

      if (!archivo) throw new Error("No se pudo registrar el archivo.");

      const [publicacion] = await tx
        .insert(publicaciones)
        .values({
          afiliadoId,
          ...columnasDeMetadatos(input),
          documentoArchivoId: archivo.id,
          // Versión fija en el servidor; la fecha la fija el servidor, no el cliente.
          descargoVersion: CURRENT_DESCARGO_VERSION,
          descargoAceptadoAt: new Date(),
          estado: EstadoPublicacion.ACTIVO,
        })
        .returning({ id: publicaciones.id });

      if (!publicacion) throw new Error("No se pudo registrar la publicación.");

      await tx
        .insert(publicacionAutores)
        .values(filasDeAutores(publicacion.id, input.autores));

      await tx
        .insert(publicacionPalabrasClave)
        .values(filasDePalabrasClave(publicacion.id, input.palabrasClave));

      // La lectura ocurre dentro de la transacción: si fallara, todo se revierte
      // y se compensa S3, en vez de responder error con datos ya confirmados.
      const detalle = await obtenerDetalleActivo(tx, publicacion.id);
      if (!detalle) throw new Error("No se pudo leer la publicación creada.");

      return detalle;
    });
  } catch (error) {
    await eliminarObjetoSinFallar(subido.objectKey, "crearPublicacion");
    throw error;
  }
}

/* ==========================================================================
   PATCH /api/publicaciones/:id
   ========================================================================== */

/**
 * Reemplaza los metadatos editables (RF-DOC-007) de una publicación propia
 * y ACTIVO. No toca el PDF, el descargo, el propietario ni el estado.
 * La fila se bloquea (`FOR UPDATE`) para evitar carreras con otro PATCH/DELETE.
 */
export async function actualizarPublicacion(params: {
  id: string;
  afiliadoId: string;
  input: UpdatePublicacionInput;
}): Promise<PublicacionDetalleResponse> {
  const { id, afiliadoId, input } = params;

  return db.transaction(async (tx) => {
    const [actual] = await tx
      .select({
        afiliadoId: publicaciones.afiliadoId,
        estado: publicaciones.estado,
      })
      .from(publicaciones)
      .where(eq(publicaciones.id, id))
      .for("update");

    const propia = exigirPropietario(actual, afiliadoId, "modificar");

    if (propia.estado !== EstadoPublicacion.ACTIVO) {
      throw new ApiError(
        409,
        "PUBLICACION_NO_EDITABLE",
        "Solo se pueden modificar publicaciones en estado ACTIVO.",
      );
    }

    await tx
      .update(publicaciones)
      .set({ ...columnasDeMetadatos(input), updatedAt: new Date() })
      .where(
        and(
          eq(publicaciones.id, id),
          eq(publicaciones.afiliadoId, afiliadoId),
          eq(publicaciones.estado, EstadoPublicacion.ACTIVO),
        ),
      );

    // Autores y palabras clave se reemplazan por completo. El DELETE termina
    // antes del INSERT, por lo que el índice único (publicacion_id, orden)
    // no genera conflictos.
    await tx
      .delete(publicacionAutores)
      .where(eq(publicacionAutores.publicacionId, id));
    await tx
      .insert(publicacionAutores)
      .values(filasDeAutores(id, input.autores));

    await tx
      .delete(publicacionPalabrasClave)
      .where(eq(publicacionPalabrasClave.publicacionId, id));
    await tx
      .insert(publicacionPalabrasClave)
      .values(filasDePalabrasClave(id, input.palabrasClave));

    const detalle = await obtenerDetalleActivo(tx, id);
    if (!detalle)
      throw new Error("No se pudo leer la publicación actualizada.");

    return detalle;
  });
}

/* ==========================================================================
   DELETE /api/publicaciones/:id
   ========================================================================== */

/**
 * Hard delete (RF-DOC-006):
 *  1. Transacción: bloquea la publicación, verifica propiedad, la elimina
 *     (autores y palabras clave caen por ON DELETE CASCADE) y elimina el
 *     registro `archivo` (FK RESTRICT: primero la publicación, luego el archivo).
 *  2. Solo tras el COMMIT se elimina el objeto en S3. Si eso falla, se registra
 *     y la API responde éxito (el objeto huérfano se limpia después).
 *  Si la transacción falla, S3 no se toca y el error se propaga.
 */
export async function eliminarPublicacion(params: {
  id: string;
  afiliadoId: string;
}): Promise<void> {
  const { id, afiliadoId } = params;

  const objectKey = await db.transaction(async (tx) => {
    const [actual] = await tx
      .select({
        afiliadoId: publicaciones.afiliadoId,
        estado: publicaciones.estado,
        documentoArchivoId: publicaciones.documentoArchivoId,
      })
      .from(publicaciones)
      .where(eq(publicaciones.id, id))
      .for("update");

    const propia = exigirPropietario(actual, afiliadoId, "eliminar");

    const [archivo] = await tx
      .select({ objectKey: archivos.objectKey })
      .from(archivos)
      .where(eq(archivos.id, propia.documentoArchivoId))
      .limit(1);

    await tx
      .delete(publicaciones)
      .where(
        and(eq(publicaciones.id, id), eq(publicaciones.afiliadoId, afiliadoId)),
      );

    await tx.delete(archivos).where(eq(archivos.id, propia.documentoArchivoId));

    return archivo?.objectKey ?? null;
  });

  if (objectKey) {
    await eliminarObjetoSinFallar(objectKey, "eliminarPublicacion");
  }
}
