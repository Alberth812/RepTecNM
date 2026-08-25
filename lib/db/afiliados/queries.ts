import { and, eq, inArray } from "drizzle-orm";
import { db } from "../client";
import {
  afiliados,
  datosEmergencia,
  proyectosRelevantes,
  type NewDatosEmergencia,
  type NewProyectoRelevante,
} from "../schema/afiliados";
import { archivos, type NewArchivo } from "../schema/archivo";
import { NewSolicitud, solicitudes } from "../schema/solicitudes";

/*export async function updateAfiliado(input: {
  userId: string;
  archivos: {
    fotografia: NewArchivo;
    comprobanteMembresia: NewArchivo;
  };
  afiliado: Omit<
    NewSolicitud,
    | "id"
    | "afiliadoId"
    | "tipo"
    | "createdAt"
    | "fotografiaArchivoId"
    | "comprobanteMembresiaArchivoId"
  >;
  proyectos: Omit<NewProyectoRelevante, "id" | "solicitudId">[];
  datosEmergencia: Omit<
    NewDatosEmergencia,
    "id" | "solicitudId" | "createdAt" | "updatedAt"
  >;
}) {
  return db.transaction(async (tx) => {
    // Bloquea la fila para evitar que dos envíos concurrentes del mismo
    // afiliado corrompan la rotación.
    const [afiliado] = await tx
      .select()
      .from(afiliados)
      .where(eq(afiliados.userId, input.userId))
      .for("update");

    if (!afiliado) {
      throw new Error("Afiliado no encontrado");
    }

    // 1. La 'ANTERIOR' existente (si la hay) se descarta por completo.
    const [anteriorPrevia] = await tx
      .select()
      .from(solicitudes)
      .where(
        and(
          eq(solicitudes.afiliadoId, input.userId),
          eq(solicitudes.tipo, "ANTERIOR"),
        ),
      )
      .limit(1);

    let archivosAEliminar: {
      bucket: string;
      objectKey: string;
    }[] = [];

    if (anteriorPrevia) {
      const archivosDescartados = await tx
        .select({
          id: archivos.id,
          bucket: archivos.bucket,
          objectKey: archivos.objectKey,
        })
        .from(archivos)
        .where(
          inArray(archivos.id, [
            anteriorPrevia.fotografiaArchivoId,
            anteriorPrevia.comprobanteMembresiaArchivoId,
          ]),
        );

      // Borra la solicitud (cascada: proyectos, datos_emergencia, revision)
      await tx.delete(solicitudes).where(eq(solicitudes.id, anteriorPrevia.id));

      // Ya no hay FK apuntando a estos archivos: se pueden borrar de Postgres.
      await tx.delete(archivos).where(
        inArray(
          archivos.id,
          archivosDescartados.map((a) => a.id),
        ),
      );

      archivosAEliminar = archivosDescartados.map(({ bucket, objectKey }) => ({
        bucket,
        objectKey,
      }));
    }

    // 2. La 'ACTUAL' existente pasa a ser 'ANTERIOR'.
    await tx
      .update(solicitudes)
      .set({ tipo: "ANTERIOR" })
      .where(
        and(
          eq(solicitudes.afiliadoId, input.userId),
          eq(solicitudes.tipo, "ACTUAL"),
        ),
      );

    // 3. Insertamos los archivos de la nueva solicitud.
    const [fotografia] = await tx
      .insert(archivos)
      .values(input.archivos.fotografia)
      .returning();

    const [comprobante] = await tx
      .insert(archivos)
      .values(input.archivos.comprobanteMembresia)
      .returning();

    // 4. Insertamos la nueva solicitud como 'ACTUAL'.
    const [nuevaSolicitud] = await tx
      .insert(solicitudes)
      .values({
        ...input.afiliado,
        afiliadoId: input.userId,
        tipo: "ACTUAL",
        fotografiaArchivoId: fotografia.id,
        comprobanteMembresiaArchivoId: comprobante.id,
      })
      .returning();

    // 5. Proyectos y datos de emergencia de la nueva solicitud.
    if (input.proyectos.length > 0) {
      await tx.insert(proyectosRelevantes).values(
        input.proyectos.map((p) => ({
          ...p,
          solicitudId: nuevaSolicitud.id,
        })),
      );
    }

    await tx.insert(datosEmergencia).values({
      ...input.datosEmergencia,
      solicitudId: nuevaSolicitud.id,
    });

    // 6. Estado de membresía.
    await tx
      .update(afiliados)
      .set({
        membershipStatus: "PENDIENTE_APROBACION",
      })
      .where(eq(afiliados.userId, input.userId));

    return {
      userId: input.userId,
      solicitudId: nuevaSolicitud.id,
      archivosAEliminar,
    };
  });
}
*/
