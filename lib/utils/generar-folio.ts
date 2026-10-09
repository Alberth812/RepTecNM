import { db } from "@/lib/db/client";
import { afiliados } from "@/lib/db/schema/afiliados";
import { eq, isNotNull } from "drizzle-orm";

/**
 * Genera un folio único para la credencial digital.
 * Formato: REP-{AÑO}-{6 caracteres alfanuméricos aleatorios}
 * Ejemplo: REP-2026-A7B9C2
 * Longitud total: 14 caracteres (cumple con el límite de 15 del schema).
 */
export async function generarFolioUnico(): Promise<string> {
  const anio = new Date().getFullYear();
  // Caracteres seguros (sin I, l, 1, O, 0 para evitar errores de lectura)
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let folio = "";
  let esUnico = false;
  let intentos = 0;
  const maxIntentos = 10;

  while (!esUnico && intentos < maxIntentos) {
    let sufijo = "";
    for (let i = 0; i < 6; i++) {
      sufijo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    folio = `REP-${anio}-${sufijo}`;

    // Verificar si ya existe en la base de datos
    const existente = await db
      .select({ folio: afiliados.folio })
      .from(afiliados)
      .where(eq(afiliados.folio, folio))
      .limit(1);

    if (existente.length === 0) {
      esUnico = true;
    }
    intentos++;
  }

  if (!esUnico) {
    throw new Error("No se pudo generar un folio único después de varios intentos.");
  }

  return folio;
}
