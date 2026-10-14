import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { relations } from "./schema/relations";

declare global {
 // eslint-disable-next-line no-var
 var __pgPool: Pool | undefined;
}

// Reutiliza el pool entre recargas en desarrollo (evita agotar conexiones
// por el hot-reload de Next.js).
const pool =
 global.__pgPool ??
 new Pool({
 connectionString: process.env.DATABASE_URL,
 });

if (process.env.NODE_ENV !== "production") {
 global.__pgPool = pool;
}

// `relations` habilita la API relacional v1 (RQBv2) de Drizzle: db.query.*
export const db = drizzle({ client: pool, relations });
