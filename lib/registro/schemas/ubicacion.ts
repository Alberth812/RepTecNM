// 
// 3. Ubicación
// 

import z from "zod";
import { requiredSelect, requiredText } from "./util";
import { DISPONIBILIDAD_OPTIONS, ESTADOS_MEXICO } from "../types";

export const ubicacionSchema = z.object({
 estado_residencia: requiredSelect(
 ESTADOS_MEXICO,
 "Selecciona tu estado de residencia.",
 ),
 ciudad_residencia: requiredText("La ciudad de residencia"),
 disponibilidad_geografica: z
 .array(z.enum(DISPONIBILIDAD_OPTIONS))
 .min(1, "Selecciona al menos una opción de disponibilidad."),
});