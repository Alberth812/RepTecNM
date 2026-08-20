import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { relations } from "./relations";
import { authRelations } from "@/auth-schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Falta la variable de entorno DATABASE_URL (cadena de conexión de Neon).",
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __registroDbPool: Pool | undefined;
}

const pool =
  global.__registroDbPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global.__registroDbPool = pool;
}

export const db = drizzle({
  client: pool,
  relations: { ...relations, ...authRelations },
});
