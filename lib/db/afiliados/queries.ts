import { db } from "../index";
import {
  afiliados,
  datosEmergencia,
  proyectosRelevantes,
  type NewAfiliado,
  type NewDatosEmergencia,
  type NewProyectoRelevante,
} from "./schema";

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
          afiliadoId: afiliado.accountId,
        })),
      );
    }

    await tx.insert(datosEmergencia).values({
      ...input.datosEmergencia,
      afiliadoId: afiliado.accountId,
    });

    return afiliado;
  });
}
