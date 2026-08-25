import { eq } from "drizzle-orm";
import { db } from "../client";
import {
  afiliados,
  datosEmergencia,
  proyectosRelevantes,
  type NewAfiliado,
  type NewDatosEmergencia,
  type NewProyectoRelevante,
} from "../schema/afiliados";
import { archivos } from "../schema/archivo";

export interface CreateAfiliadoInput {
  afiliado: Omit<NewAfiliado, "id" | "createdAt" | "updatedAt">;
  proyectos: Omit<NewProyectoRelevante, "id" | "afiliadoId">[];
  datosEmergencia: Omit<
    NewDatosEmergencia,
    "id" | "afiliadoId" | "createdAt" | "updatedAt"
  >;
}

/**
 * Inserta el afiliado junto con sus proyectos relevantes y sus datos de
 * emergencia dentro de una única transacción: si cualquiera de los inserts
 * falla (p. ej. el correo ya está registrado), no queda ningún registro
 * huérfano en la base de datos.
 */
export async function createAfiliado(input: CreateAfiliadoInput) {
  return db.transaction(async (tx) => {
    const [afiliado] = await tx
      .insert(afiliados)
      .values(input.afiliado)
      .returning();

    if (input.proyectos.length > 0) {
      await tx.insert(proyectosRelevantes).values(
        input.proyectos.map((proyecto) => ({
          ...proyecto,
          afiliadoId: afiliado.userId,
        })),
      );
    }

    await tx.insert(datosEmergencia).values({
      ...input.datosEmergencia,
      afiliadoId: afiliado.userId,
    });

    return afiliado;
  });
}

export interface UpdateAfiliadoInput {
  userId: string;

  afiliado: Omit<
    NewAfiliado,
    "userId" | "createdAt" | "updatedAt" | "membershipStatus"
  >;

  proyectos: Omit<NewProyectoRelevante, "id" | "afiliadoId">[];

  datosEmergencia: Omit<
    NewDatosEmergencia,
    "id" | "afiliadoId" | "createdAt" | "updatedAt"
  >;

  archivos: {
    fotografia: {
      bucket: string;
      objectKey: string;
      originalName: string;
      contentType: string;
      size: number;
    };

    comprobanteMembresia: {
      bucket: string;
      objectKey: string;
      originalName: string;
      contentType: string;
      size: number;
    };
  };
}

export async function updateAfiliado(input: UpdateAfiliadoInput) {
  return db.transaction(async (tx) => {
    // 1. Actualizar datos principales
    const [afiliado] = await tx
      .update(afiliados)
      .set({
        ...input.afiliado,
        updatedAt: new Date(),
      })
      .where(eq(afiliados.userId, input.userId))
      .returning();

    if (!afiliado) {
      throw new Error("Afiliado no encontrado");
    }

    // 2. Reemplazar proyectos
    await tx
      .delete(proyectosRelevantes)
      .where(eq(proyectosRelevantes.afiliadoId, input.userId));

    if (input.proyectos.length > 0) {
      await tx.insert(proyectosRelevantes).values(
        input.proyectos.map((proyecto) => ({
          ...proyecto,
          afiliadoId: input.userId,
        })),
      );
    }

    // 3. Upsert datos de emergencia
    await tx
      .insert(datosEmergencia)
      .values({
        ...input.datosEmergencia,
        afiliadoId: input.userId,
      })
      .onConflictDoUpdate({
        target: datosEmergencia.afiliadoId,
        set: {
          ...input.datosEmergencia,
          updatedAt: new Date(),
        },
      });

    // 4. Crear archivo de fotografía
    const [fotografiaArchivo] = await tx
      .insert(archivos)
      .values({
        bucket: input.archivos.fotografia.bucket,
        objectKey: input.archivos.fotografia.objectKey,
        originalName: input.archivos.fotografia.originalName,
        contentType: input.archivos.fotografia.contentType,
        size: input.archivos.fotografia.size,
      })
      .returning({
        id: archivos.id,
      });

    if (!fotografiaArchivo) {
      throw new Error("No se pudo crear el archivo de fotografía");
    }

    // 5. Crear archivo de comprobante de membresía
    const [membresiaArchivo] = await tx
      .insert(archivos)
      .values({
        bucket: input.archivos.comprobanteMembresia.bucket,
        objectKey: input.archivos.comprobanteMembresia.objectKey,
        originalName: input.archivos.comprobanteMembresia.originalName,
        contentType: input.archivos.comprobanteMembresia.contentType,
        size: input.archivos.comprobanteMembresia.size,
      })
      .returning({
        id: archivos.id,
      });

    if (!membresiaArchivo) {
      throw new Error(
        "No se pudo crear el archivo de comprobante de membresía",
      );
    }

    // 6. Asociar archivos al afiliado
    const [afiliadoActualizado] = await tx
      .update(afiliados)
      .set({
        fotografiaArchivoId: fotografiaArchivo.id,
        comprobanteMembresiaArchivoId: membresiaArchivo.id,
        updatedAt: new Date(),
      })
      .where(eq(afiliados.userId, input.userId))
      .returning();

    if (!afiliadoActualizado) {
      throw new Error("No se pudo actualizar los archivos del afiliado");
    }

    return afiliadoActualizado;
  });
}
