// @/scripts/expirar-membresias.ts
//
// Pasa a INACTIVO a los afiliados cuya membresía ya expiró, siempre y
// cuando su estado actual sea ACTIVO. No toca nada más (ni renovaciones
// pendientes, ni afiliados NO_INICIADA).
//
// Ejecútalo como prefieras disparar el proceso, por ejemplo:
//   npx tsx scripts/expirar-membresias.ts

import { and, eq, isNotNull, lte } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { afiliados } from "@/lib/db/schema/afiliados";
import { MEMBRESIA_EXPIRA_EN_DIAS } from "@/lib/utils/expiracion-membresia"; // TODO: ajusta

async function expirarMembresiasVencidas() {
  const limite = new Date();
  limite.setDate(limite.getDate() - MEMBRESIA_EXPIRA_EN_DIAS);

  const expirados = await db
    .update(afiliados)
    .set({ membershipStatus: "INACTIVO" })
    .where(
      and(
        eq(afiliados.membershipStatus, "ACTIVO"),
        isNotNull(afiliados.fechaInicioMembresia),
        lte(afiliados.fechaInicioMembresia, limite),
      ),
    )
    .returning({ userId: afiliados.userId });

  console.log(`Membresías marcadas como INACTIVO: ${expirados.length}`);
  if (expirados.length > 0) {
    console.log(expirados.map((a) => a.userId).join(", "));
  }

  return expirados.length;
}

expirarMembresiasVencidas()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error al expirar membresías:", error);
    process.exit(1);
  });
