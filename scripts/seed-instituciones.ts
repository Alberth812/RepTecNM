/**
 * Seed inicial de instituciones.
 *
 * Uso:
 * npm run seed:instituciones
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { instituciones } from "@/lib/db/schema/instituciones";

const institucionesIniciales = [
 "Instituto Tecnológico de México",
 "Instituto Tecnológico de Celaya",
 "Instituto Tecnológico de Chihuahua",
 "Instituto Tecnológico de Ciudad Madero",
 "Instituto Tecnológico de Hermosillo",
 "Instituto Tecnológico de La Laguna",
 "Instituto Tecnológico de Mérida",
 "Instituto Tecnológico de Morelia",
 "Instituto Tecnológico de Oaxaca",
 "Instituto Tecnológico de Tijuana",
];

async function main() {
 for (const nombre of institucionesIniciales) {
 const [existing] = await db
 .select({ id: instituciones.id })
 .from(instituciones)
 .where(eq(instituciones.nombre, nombre))
 .limit(1);

 if (existing) {
 console.log(`Ya existe: ${nombre}`);
 continue;
 }

 await db.insert(instituciones).values({ nombre });

 console.log(`Institución creada: ${nombre}`);
 }

 console.log("Seed de instituciones completado.");
 process.exit(0);
}

main().catch((error) => {
 console.error("Error al crear las instituciones:", error);
 process.exit(1);
});
