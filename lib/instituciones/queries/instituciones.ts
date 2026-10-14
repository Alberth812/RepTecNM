// Ubicación sugerida: @/lib/instituciones/queries/instituciones.ts

import { and, asc, count, eq, ilike } from "drizzle-orm";

import { db } from "@/lib/db/client";
import {
 instituciones,
 institucionEstadoEnum,
} from "@/lib/db/schema/instituciones";
import { ApiError } from "@/lib/errors";
import type {
 CreateInstitucionInput,
 UpdateInstitucionInput,
} from "@/lib/validation/instituciones";

type Estado = (typeof institucionEstadoEnum.enumValues)[number];

const POSTGRES_FOREIGN_KEY_VIOLATION = "23503";

interface ListInstitucionesParams {
 page: number;
 pageSize: number;
 nombre?: string;
 estado?: Estado;
}

export async function listInstituciones({
 page,
 pageSize,
 nombre,
 estado,
}: ListInstitucionesParams) {
 const conditions = [];

 if (nombre) {
 // ilike => búsqueda case-insensitive nativa de PostgreSQL
 conditions.push(ilike(instituciones.nombre, `%${nombre}%`));
 }

 if (estado) {
 conditions.push(eq(instituciones.estado, estado));
 }

 const where = conditions.length > 0 ? and(...conditions) : undefined;
 const offset = (page - 1) * pageSize;

 // Paginación y conteo se resuelven en la base de datos, no en memoria.
 const [rows, totalResult] = await Promise.all([
 db
 .select()
 .from(instituciones)
 .where(where)
 .orderBy(asc(instituciones.nombre), asc(instituciones.id))
 .limit(pageSize)
 .offset(offset),
 db.select({ value: count() }).from(instituciones).where(where),
 ]);

 return { rows, total: totalResult[0]?.value ?? 0 };
}

export async function getInstitucionById(id: string) {
 const [row] = await db
 .select()
 .from(instituciones)
 .where(eq(instituciones.id, id))
 .limit(1);

 return row ?? null;
}

export async function createInstitucion(input: CreateInstitucionInput) {
 const [row] = await db
 .insert(instituciones)
 .values({
 nombre: input.nombre,
 estado: "ACTIVO",
 lastChangedToInactivoAt: null,
 })
 .returning();

 return row;
}

/**
 * Actualiza nombre/estado y calcula `lastChangedToInactivoAt` en el servidor
 * según la transición de estado, sin confiar en nada enviado por el cliente:
 *
 * - ACTIVO -> INACTIVO: lastChangedToInactivoAt = ahora
 * - INACTIVO -> ACTIVO: lastChangedToInactivoAt = null
 * - sin cambio de estado: se conserva el valor existente
 *
 * Se lee y actualiza dentro de una transacción con bloqueo de fila
 * (`for("update")`) para evitar condiciones de carrera si dos solicitudes
 * de modificación llegan casi al mismo tiempo. Si tu driver de PostgreSQL
 * no soporta transacciones (p. ej. algunos drivers HTTP "serverless"),
 * reemplaza `db.transaction` por lectura + escritura directas sobre `db`.
 */
export async function updateInstitucion(
 id: string,
 input: UpdateInstitucionInput,
) {
 return db.transaction(async (tx) => {
 const [current] = await tx
 .select()
 .from(instituciones)
 .where(eq(instituciones.id, id))
 .for("update")
 .limit(1);

 if (!current) {
 return null;
 }

 let lastChangedToInactivoAt = current.lastChangedToInactivoAt;

 if (current.estado !== input.estado) {
 lastChangedToInactivoAt = input.estado === "INACTIVO" ? new Date() : null;
 }

 const [row] = await tx
 .update(instituciones)
 .set({
 nombre: input.nombre,
 estado: input.estado,
 lastChangedToInactivoAt,
 })
 .where(eq(instituciones.id, id))
 .returning();

 return row;
 });
}

/**
 * Intenta eliminar. Si PostgreSQL rechaza el DELETE por la restricción
 * ON DELETE RESTRICT de alguna tabla dependiente, se traduce a un
 * ApiError.conflict (409). No se hace ninguna comprobación previa de
 * existencia de dependientes: la restricción de la base de datos sigue
 * siendo la única fuente de verdad para la integridad referencial.
 */
export async function deleteInstitucion(id: string) {
 try {
 const [row] = await db
 .delete(instituciones)
 .where(eq(instituciones.id, id))
 .returning({ id: instituciones.id });

 return row ?? null;
 } catch (error) {
 if (isForeignKeyViolation(error)) {
 throw ApiError.conflict(
 "No es posible eliminar la institución porque existen registros asociados.",
 "INSTITUCION_HAS_DEPENDENCIES",
 );
 }

 throw error;
 }
}

function isForeignKeyViolation(error: unknown): boolean {
 if (!error || typeof error !== "object") return false;

 const code = (error as { code?: unknown }).code;
 if (code === POSTGRES_FOREIGN_KEY_VIOLATION) return true;

 // Algunos drivers envuelven el error original en `cause`.
 const cause = (error as { cause?: unknown }).cause;
 if (cause && typeof cause === "object") {
 return (
 (cause as { code?: unknown }).code === POSTGRES_FOREIGN_KEY_VIOLATION
 );
 }

 return false;
}
