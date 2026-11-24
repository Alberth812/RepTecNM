import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL no está definida. Copia .env.example a .env y complétala.",
  );
}

export default defineConfig({ //
  out: "./drizzle",
  schema: "./lib/db/schema/**/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
});
