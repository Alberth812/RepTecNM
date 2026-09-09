// @/lib/validations/formacion-academica/resumen-posgrado.ts
//
// Sección "Resumen de estudios de posgrado" (entity: resumen_posgrado, one_to_one).
// Es un dato de navegación/formulario y NO sustituye los registros detallados
// de la entidad `posgrado`; por eso no tiene reglas cruzadas propias.

import { z } from "zod";
import { tipoPosgradoEnum } from "@/lib/db/schema/formacion-academica";

export const resumenPosgradoSchema = z.object({
  programasPosgradoCursados: z
    .array(z.enum(tipoPosgradoEnum.enumValues))
    .nullish(),
  trayectoriaMaestriaDoctoradoIntegrada: z.boolean().nullish(),
});

export type ResumenPosgrado = z.infer<typeof resumenPosgradoSchema>;
