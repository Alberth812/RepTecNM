// 
// 7. Visibilidad
// 

import z from "zod";
import { DATOS_PUBLICOS_OPTIONS } from "../types";

export const visibilidadSchema = z.object({
 autoriza_publicacion: z.boolean().default(true),

 datos_publicos: z
 .array(z.enum(DATOS_PUBLICOS_OPTIONS))
 .min(1, "Selecciona qué datos deseas mostrar públicamente."),
});