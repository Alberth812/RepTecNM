// @/lib/data/informacion-laboral.ts
//
// Lectura de la Sección 3 (Información laboral) de un afiliado. Se usa tanto
// desde el Server Component de la página (SSR, sin round-trip HTTP) como
// desde `GET /api/informacion-laboral` (para clientes que necesiten
// refetch, p. ej. tras navegar de vuelta con datos cacheados).

import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import {
 afiliadosEmpleos,
 afiliadosInformacionLaboral,
} from "@/lib/db/schema/informacion-laboral";

export async function getInformacionLaboralSeccion(afiliadoUserId: string) {
 const [informacionLaboral] = await db
 .select()
 .from(afiliadosInformacionLaboral)
 .where(eq(afiliadosInformacionLaboral.userId, afiliadoUserId))
 .limit(1);

 const historialEmpleos = await db
 .select()
 .from(afiliadosEmpleos)
 .where(eq(afiliadosEmpleos.afiliadoUserId, afiliadoUserId))
 .orderBy(
 asc(afiliadosEmpleos.fechaInicioAnio),
 asc(afiliadosEmpleos.fechaInicioMes),
 );

 return {
 informacionLaboral: informacionLaboral ?? null,
 historialEmpleos,
 };
}

export type InformacionLaboralSeccionRow = Awaited<
 ReturnType<typeof getInformacionLaboralSeccion>
>;
