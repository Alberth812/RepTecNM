// 
// 6. Datos de emergencia
// 

import z from "zod";
import { PARENTESCO_OPTIONS, TIPO_SANGUINEO_OPTIONS } from "../types";
import { maxWordsText, phoneSchema, requiredSelect, requiredText } from "./util";

export const emergenciaSchema = z.object({
  nombre_contacto_emergencia: requiredText(
    "El nombre del contacto de emergencia",
    150,
  ),

  parentesco_contacto_emergencia: requiredSelect(
    PARENTESCO_OPTIONS,
    "Selecciona el parentesco del contacto de emergencia.",
  ),

  parentesco_contacto_emergencia_otro: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal("")),

  telefono_contacto_emergencia: phoneSchema("El teléfono de emergencia"),

  tipo_sanguineo: requiredSelect(
    TIPO_SANGUINEO_OPTIONS,
    "Selecciona tu tipo sanguíneo.",
  ),

  alergias_condiciones_medicas: maxWordsText(
    "Las alergias o condiciones médicas",
    500,
    false,
  ),

  privacidad_datos_emergencia: z.boolean().default(true),
});
