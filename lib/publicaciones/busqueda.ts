// @/lib/publicaciones/busqueda.ts
import {
  and,
  count,
  desc,
  eq,
  exists,
  gte,
  ilike,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { db } from "@/lib/db/client";
import { archivos } from "@/lib/db/schema/archivo";
import { publicacionAutores } from "@/lib/db/schema/publicaciones";
import { publicacionPalabrasClave } from "@/lib/db/schema/publicaciones";
import { publicaciones } from "@/lib/db/schema/publicaciones";
// Requiere que `cargarRelaciones` esté exportada en service.ts.
import { cargarRelaciones } from "@/lib/publicaciones/service";
import {
  doiSchema,
  escapeSqlLikePattern,
  EstadoPublicacion,
  isbn13Schema,
  issnSchema,
} from "@/lib/validation/publicaciones";
import type {
  BuscarPublicacionesQuery,
  BusquedaPublicacionesResponse,
  PublicacionBusquedaItem,
} from "@/lib/validation/publicaciones-busqueda";

/* ==========================================================================
   HELPERS DE FILTRADO
   ========================================================================== */

/**
 * Patrón `%valor%` para ILIKE. `%`, `_` y `\` del usuario se escapan para que
 * se traten como literales (el escape por defecto de ILIKE es la barra invertida).
 */
function patronParcial(valor: string): string {
  return `%${escapeSqlLikePattern(valor)}%`;
}

/** EXISTS: algún autor cuyo `nombres` o `apellidos` cumple ILIKE. */
function existeAutorCon(patron: string): SQL {
  return exists(
    db
      .select({ uno: sql`1` })
      .from(publicacionAutores)
      .where(
        and(
          eq(publicacionAutores.publicacionId, publicaciones.id),
          or(
            ilike(publicacionAutores.nombres, patron),
            ilike(publicacionAutores.apellidos, patron),
          ),
        ),
      ),
  );
}

/** EXISTS: alguna palabra clave de la publicación que cumple la condición dada. */
function existePalabraClaveQue(condicion: SQL): SQL {
  return exists(
    db
      .select({ uno: sql`1` })
      .from(publicacionPalabrasClave)
      .where(
        and(
          eq(publicacionPalabrasClave.publicacionId, publicaciones.id),
          condicion,
        ),
      ),
  );
}

/**
 * Búsqueda de texto libre (`q`):
 *  - ILIKE parcial en título, descripción, autores (nombres/apellidos) y palabras clave.
 *  - ISBN / ISSN / DOI: SOLO igualdad exacta contra el valor normalizado de `q`
 *    (nunca ILIKE). Si `q` no tiene formato válido de un identificador, esa
 *    comparación se omite: ningún valor almacenado (siempre normalizado y
 *    válido) podría coincidir.
 * Todas las condiciones se combinan con OR.
 */
function filtroTextoLibre(q: string): SQL | undefined {
  const patron = patronParcial(q);

  const condiciones: SQL[] = [
    ilike(publicaciones.titulo, patron),
    ilike(publicaciones.descripcion, patron),
    existeAutorCon(patron),
    existePalabraClaveQue(ilike(publicacionPalabrasClave.valor, patron)),
  ];

  const isbn = isbn13Schema.safeParse(q);
  if (isbn.success) condiciones.push(eq(publicaciones.isbn, isbn.data));

  const issn = issnSchema.safeParse(q);
  if (issn.success) condiciones.push(eq(publicaciones.issn, issn.data));

  const doi = doiSchema.safeParse(q);
  if (doi.success) condiciones.push(eq(publicaciones.doi, doi.data));

  return or(...condiciones);
}

/* ==========================================================================
   BÚSQUEDA GENERAL
   ========================================================================== */

/**
 * GET /api/publicaciones — búsqueda + filtros + paginación en servidor.
 *
 * Todas las condiciones (estado ACTIVO, `q` y cada filtro presente) se
 * combinan con AND. Orden fijo: `created_at DESC` (con `id` como desempate
 * para que la paginación sea estable). No hay ranking por relevancia.
 * Nunca selecciona `documento_archivo_id` ni genera URLs firmadas.
 */
export async function buscarPublicaciones(
  params: BuscarPublicacionesQuery,
): Promise<BusquedaPublicacionesResponse> {
  const {
    q,
    tipo,
    anio,
    anioDesde,
    anioHasta,
    autor,
    keyword,
    isbn,
    issn,
    doi,
    page,
    pageSize,
  } = params;

  const where = and(
    eq(publicaciones.estado, EstadoPublicacion.ACTIVO),

    q ? filtroTextoLibre(q) : undefined,

    tipo ? eq(publicaciones.tipo, tipo) : undefined,
    anio !== undefined ? eq(publicaciones.anioPublicacion, anio) : undefined,
    anioDesde !== undefined
      ? gte(publicaciones.anioPublicacion, anioDesde)
      : undefined,
    anioHasta !== undefined
      ? lte(publicaciones.anioPublicacion, anioHasta)
      : undefined,

    // Autor: ILIKE parcial en nombres o apellidos.
    autor ? existeAutorCon(patronParcial(autor)) : undefined,

    // Palabra clave: igualdad exacta con el valor normalizado.
    keyword
      ? existePalabraClaveQue(eq(publicacionPalabrasClave.valor, keyword))
      : undefined,

    // Identificadores: igualdad exacta con el valor normalizado.
    isbn ? eq(publicaciones.isbn, isbn) : undefined,
    issn ? eq(publicaciones.issn, issn) : undefined,
    doi ? eq(publicaciones.doi, doi) : undefined,
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
      afiliadoId: publicaciones.afiliadoId,
      titulo: publicaciones.titulo,
      descripcion: publicaciones.descripcion,
      tipo: publicaciones.tipo,
      tipoOtro: publicaciones.tipoOtro,
      anioPublicacion: publicaciones.anioPublicacion,
      revistaCongreso: publicaciones.revistaCongreso,
      editorial: publicaciones.editorial,
      doi: publicaciones.doi,
      isbn: publicaciones.isbn,
      issn: publicaciones.issn,
      estado: publicaciones.estado,
      createdAt: publicaciones.createdAt,
      archivoNombre: archivos.originalName,
      archivoSize: archivos.size,
    })
    .from(publicaciones)
    .innerJoin(archivos, eq(archivos.id, publicaciones.documentoArchivoId))
    .where(where)
    .orderBy(desc(publicaciones.createdAt), desc(publicaciones.id))
    .limit(pageSize)
    .offset(offset);

  const { autoresPorPublicacion, palabrasPorPublicacion } =
    await cargarRelaciones(
      db,
      rows.map((row) => row.id),
    );

  const items: PublicacionBusquedaItem[] = rows.map((row) => ({
    id: row.id,
    afiliadoId: row.afiliadoId,
    titulo: row.titulo,
    descripcion: row.descripcion,
    tipo: row.tipo,
    tipoOtro: row.tipoOtro,
    anioPublicacion: row.anioPublicacion,
    revistaCongreso: row.revistaCongreso,
    editorial: row.editorial,
    doi: row.doi,
    isbn: row.isbn,
    issn: row.issn,
    estado: row.estado,
    createdAt: row.createdAt,
    autores: (autoresPorPublicacion.get(row.id) ?? []).map((autorRow) => ({
      nombres: autorRow.nombres,
      apellidos: autorRow.apellidos,
      orden: autorRow.orden,
    })),
    palabrasClave: palabrasPorPublicacion.get(row.id) ?? [],
    archivo: {
      originalName: row.archivoNombre,
      size: row.archivoSize,
    },
  }));

  return { items, page, pageSize, total, totalPages };
}
