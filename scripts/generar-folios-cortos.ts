import { db } from "@/lib/db/client";
import { afiliados } from "@/lib/db/schema/afiliados";
import { eq } from "drizzle-orm";

/**
 * Genera un folio corto y amigable
 * Formato: REP-AF{AAMMDD}-{3 letras iniciales}-{4 dígitos aleatorios}
 * Ejemplo: REP-AF240115-ESH-7392
 */
export async function generarFolioCorto(
  nombres: string,
  apellidoPaterno: string,
  fechaRegistro: Date
): Promise<string> {
  // Obtener fecha en formato AAMMDD
  const anio = String(fechaRegistro.getFullYear()).slice(-2);
  const mes = String(fechaRegistro.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaRegistro.getDate()).padStart(2, "0");
  const fechaStr = `${anio}${mes}${dia}`;

  // Obtener 3 primeras letras (iniciales)
  const inicialNombre = nombres.charAt(0).toUpperCase();
  const inicialPaterno = apellidoPaterno.charAt(0).toUpperCase();
  const iniciales = `${inicialNombre}${inicialPaterno}H`.toUpperCase(); // H de Haenim o segunda letra si existe

  // Generar 4 dígitos aleatorios
  const aleatorio = Math.floor(1000 + Math.random() * 9000);

  // Verificar unicidad
  let folio = `REP-AF${fechaStr}-${iniciales}-${aleatorio}`;
  let intentos = 0;
  let esUnico = false;

  while (!esUnico && intentos < 10) {
    const existente = await db
      .select({ folio: afiliados.folio })
      .from(afiliados)
      .where(eq(afiliados.folio, folio))
      .limit(1);

    if (existente.length === 0) {
      esUnico = true;
    } else {
      // Si existe, generar otro número aleatorio
      const nuevoAleatorio = Math.floor(1000 + Math.random() * 9000);
      folio = `REP-AF${fechaStr}-${iniciales}-${nuevoAleatorio}`;
      intentos++;
    }
  }

  return folio;
}

// Script para actualizar afiliados existentes
async function actualizarFoliosExistentes() {
  const afiliadosSinFolio = await db
    .select({
      userId: afiliados.userId,
      nombres: afiliados.nombres,
      apellidoPaterno: afiliados.apellidoPaterno,
      createdAt: afiliados.createdAt,
    })
    .from(afiliados)
    .where(eq(afiliados.folio, null));

  console.log(`Actualizando ${afiliadosSinFolio.length} afiliados...`);

  for (const afiliado of afiliadosSinFolio) {
    const folio = await generarFolioCorto(
      afiliado.nombres,
      afiliado.apellidoPaterno,
      afiliado.createdAt || new Date()
    );

    await db
      .update(afiliados)
      .set({ folio })
      .where(eq(afiliados.userId, afiliado.userId));

    console.log(` ${afiliado.nombres} ${afiliado.apellidoPaterno} -> ${folio}`);
  }
}

// Ejecutar si se corre directamente
if (require.main === module) {
  actualizarFoliosExistentes()
    .then(() => {
      console.log(" Folios actualizados correctamente");
      process.exit(0);
    })
    .catch((err) => {
      console.error(" Error:", err);
      process.exit(1);
    });
}
