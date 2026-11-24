// @/scripts/seed-afiliados.ts
//
// Ejecutar con, por ejemplo:
//   npx tsx scripts/seed-afiliados.ts
//
// Si tus alias "@/..." no se resuelven fuera de Next.js al correr con tsx,
// usa `tsx --tsconfig tsconfig.json` o agrega `tsconfig-paths/register`
// (o cambia los imports de seed-afiliados.ts a rutas relativas).

import { seedAfiliados } from "@/lib/db/seed-afiliados";

seedAfiliados()
  .then(() => {
    console.log("✅ Seed de afiliados completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error al ejecutar el seed de afiliados:", error);
    process.exit(1);
  });
//
