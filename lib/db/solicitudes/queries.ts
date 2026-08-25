// lib/db/solicitudes/queries.ts
import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { afiliados } from "@/lib/db/schema/afiliados";
import { archivos } from "@/lib/db/schema/archivo";
import { solicitudes } from "@/lib/db/schema/solicitudes";
import type { SolicitudDatosSnapshot } from "@/lib/registro/solicitud-snapshot";

const VERSIONES_A_CONSERVAR = 2;

type ArchivoSubido = {
  bucket: string;
  objectKey: string;
  originalName: string;
  contentType: string;
  size: number;
};

export type CrearSolicitudInput = {
  afiliadoId: string;
  datos: SolicitudDatosSnapshot;
  archivos: {
    fotografia: ArchivoSubido;
    comprobanteMembresia: ArchivoSubido;
  };
};

export type ArchivoParaEliminar = { bucket: string; objectKey: string };

export class EstadoInvalidoError extends Error {
  constructor() {
    super("El afiliado ya no puede enviar una nueva solicitud.");
    this.name = "EstadoInvalidoError";
  }
}

/**
 * Crea una nueva versión ("actual") de la solicitud de un afiliado. Solo
 * conserva esta y la inmediatamente anterior; cualquier versión más
 * vieja se elimina de la BD dentro de la misma transacción. Los objetos
 * en Garage de las versiones podadas se devuelven en
 * `archivosParaEliminar` para borrarlos DESPUÉS de confirmar la
 * transacción (no se puede llamar a Garage dentro de la tx).
 */
export async function crearSolicitud(input: CrearSolicitudInput): Promise<{
  solicitud: typeof solicitudes.$inferSelect;
  archivosParaEliminar: ArchivoParaEliminar[];
}> {
  return db.transaction(async (tx) => {
    // 1. Bloqueamos la fila del afiliado: serializa envíos concurrentes y
    //    revalida el estado dentro de la tx (defensa en profundidad; el
    //    endpoint ya valida esto antes de subir archivos).
    const [afiliado] = await tx
      .select({ membershipStatus: afiliados.membershipStatus })
      .from(afiliados)
      .where(eq(afiliados.userId, input.afiliadoId))
      .for("update");

    if (
      !afiliado ||
      !["NO_INICIADA", "REQUIERE_CORRECCION"].includes(
        afiliado.membershipStatus,
      )
    ) {
      throw new EstadoInvalidoError();
    }

    // 2. Metadatos de los archivos recién subidos a Garage.
    const [fotografiaArchivo] = await tx
      .insert(archivos)
      .values({
        bucket: input.archivos.fotografia.bucket,
        objectKey: input.archivos.fotografia.objectKey,
        originalName: input.archivos.fotografia.originalName,
        contentType: input.archivos.fotografia.contentType,
        size: input.archivos.fotografia.size,
        //ownerId: input.afiliadoId,
      })
      .returning({ id: archivos.id });

    const [comprobanteArchivo] = await tx
      .insert(archivos)
      .values({
        bucket: input.archivos.comprobanteMembresia.bucket,
        objectKey: input.archivos.comprobanteMembresia.objectKey,
        originalName: input.archivos.comprobanteMembresia.originalName,
        contentType: input.archivos.comprobanteMembresia.contentType,
        size: input.archivos.comprobanteMembresia.size,
        //ownerId: input.afiliadoId,
      })
      .returning({ id: archivos.id });

    // 3. Siguiente número de versión para este afiliado.
    const [{ maxVersion }] = await tx
      .select({
        maxVersion: sql<number | null>`max(${solicitudes.version})`,
      })
      .from(solicitudes)
      .where(eq(solicitudes.afiliadoId, input.afiliadoId));

    const siguienteVersion = (maxVersion ?? 0) + 1;

    // 4. Insertamos la nueva versión "actual".
    const [nuevaSolicitud] = await tx
      .insert(solicitudes)
      .values({
        afiliadoId: input.afiliadoId,
        version: siguienteVersion,
        datos: input.datos,
        fotografiaArchivoId: fotografiaArchivo.id,
        comprobanteMembresiaArchivoId: comprobanteArchivo.id,
      })
      .returning();

    // 5. Podamos versiones más allá de las últimas 2 (fila + archivos).
    const solicitudesAntiguas = await tx
      .select({
        id: solicitudes.id,
        fotografiaArchivoId: solicitudes.fotografiaArchivoId,
        comprobanteMembresiaArchivoId:
          solicitudes.comprobanteMembresiaArchivoId,
      })
      .from(solicitudes)
      .where(eq(solicitudes.afiliadoId, input.afiliadoId))
      .orderBy(desc(solicitudes.version))
      .offset(VERSIONES_A_CONSERVAR);

    const archivosParaEliminar: ArchivoParaEliminar[] = [];

    if (solicitudesAntiguas.length > 0) {
      const archivoIds = solicitudesAntiguas.flatMap((s) => [
        s.fotografiaArchivoId,
        s.comprobanteMembresiaArchivoId,
      ]);

      const archivosAEliminar = await tx
        .select({
          id: archivos.id,
          bucket: archivos.bucket,
          objectKey: archivos.objectKey,
        })
        .from(archivos)
        .where(inArray(archivos.id, archivoIds));

      archivosParaEliminar.push(
        ...archivosAEliminar.map((a) => ({
          bucket: a.bucket,
          objectKey: a.objectKey,
        })),
      );

      // Orden importa: primero solicitudes (referencian archivos), luego archivos.
      await tx.delete(solicitudes).where(
        inArray(
          solicitudes.id,
          solicitudesAntiguas.map((s) => s.id),
        ),
      );

      await tx.delete(archivos).where(inArray(archivos.id, archivoIds));
    }

    // 6. El afiliado queda pendiente de revisión.
    await tx
      .update(afiliados)
      .set({ membershipStatus: "PENDIENTE_APROBACION" })
      .where(eq(afiliados.userId, input.afiliadoId));

    return { solicitud: nuevaSolicitud, archivosParaEliminar };
  });
}
