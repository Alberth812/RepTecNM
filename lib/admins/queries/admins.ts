// lib/db/queries/admins.ts

import { and, asc, desc, eq, ilike, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { administradores } from "@/lib/db/schema/administradores";
import { sessions, users } from "@/lib/db/schema/auth-schema";
import type { AdminListQuery } from "@/lib/validation/admin-management";

/**
 * Whitelist explícita de columnas ordenables. Nunca se construye el nombre
 * de una columna a partir del query string: sortBy solo puede ser una de
 * estas dos claves (ya validadas por adminListQuerySchema).
 */
const SORTABLE_COLUMNS = {
 nombreCompleto: administradores.nombreCompleto,
 email: users.email,
} as const;

export interface ListAdminsParams extends AdminListQuery {
 /** userId del administrador autenticado; se excluye del listado. */
 excludeUserId: string;
}

export interface AdminListItem {
 userId: string;
 nombreCompleto: string;
 subtype: "GENERAL" | "CONTENIDO";
 isActive: boolean;
 email: string;
}

export interface ListAdminsResult {
 admins: AdminListItem[];
 total: number;
}

export async function listAdmins(
 params: ListAdminsParams,
): Promise<ListAdminsResult> {
 const {
 excludeUserId,
 search,
 subtype,
 isActive,
 sortBy,
 sortOrder,
 page,
 pageSize,
 } = params;

 // Condición de exclusión del propio administrador: siempre se aplica en
 // SQL, nunca filtrando en el cliente.
 const conditions: SQL[] = [ne(administradores.userId, excludeUserId)];

 if (search) {
 const pattern = `%${search}%`;
 conditions.push(
 or(
 ilike(administradores.nombreCompleto, pattern),
 ilike(users.email, pattern),
 ) as SQL,
 );
 }

 if (subtype) {
 conditions.push(eq(administradores.subtype, subtype));
 }

 if (isActive !== undefined) {
 conditions.push(eq(administradores.isActive, isActive));
 }

 const whereClause = and(...conditions);
 const orderColumn = SORTABLE_COLUMNS[sortBy];
 const orderExpr = sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);

 const baseSelect = db
 .select({
 userId: administradores.userId,
 nombreCompleto: administradores.nombreCompleto,
 subtype: administradores.subtype,
 isActive: administradores.isActive,
 email: users.email,
 })
 .from(administradores)
 .innerJoin(users, eq(administradores.userId, users.id))
 .where(whereClause);

 const countSelect = db
 .select({ count: sql<number>`count(*)::int` })
 .from(administradores)
 .innerJoin(users, eq(administradores.userId, users.id))
 .where(whereClause);

 const [admins, countRows] = await Promise.all([
 baseSelect
 .orderBy(orderExpr)
 .limit(pageSize)
 .offset((page - 1) * pageSize),
 countSelect,
 ]);

 return {
 admins,
 total: countRows[0]?.count ?? 0,
 };
}

export async function getAdminByUserId(userId: string) {
 const [admin] = await db
 .select()
 .from(administradores)
 .where(eq(administradores.userId, userId))
 .limit(1);

 return admin ?? null;
}

/**
 * Activa un administrador. No crea ni modifica sesiones existentes.
 */
export async function activateAdminRecord(userId: string) {
 const [updated] = await db
 .update(administradores)
 .set({ isActive: true })
 .where(eq(administradores.userId, userId))
 .returning();

 return updated ?? null;
}

/**
 * Desactiva un administrador y revoca (elimina) todas sus sesiones de
 * Better Auth en la misma transacción, para que ambos cambios sean
 * atómicos entre sí.
 */
export async function deactivateAdminRecord(userId: string) {
 return db.transaction(async (tx) => {
 const [updated] = await tx
 .update(administradores)
 .set({ isActive: false })
 .where(eq(administradores.userId, userId))
 .returning();

 if (updated) {
 await tx.delete(sessions).where(eq(sessions.userId, userId));
 }

 return updated ?? null;
 });
}
