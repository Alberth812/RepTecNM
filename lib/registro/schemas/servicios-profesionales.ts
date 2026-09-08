// ─────────────────────────────────────────────────────────────────────────────
// 5. Servicios profesionales
// ─────────────────────────────────────────────────────────────────────────────

import z from "zod";
import { INTERESADO_EN_OPTIONS, MODALIDAD_SERVICIOS_OPTIONS, SECTORES_OPTIONS, TIPO_SERVICIOS_OPTIONS } from "../types";
import { maxWordsText } from "./util";

export const serviciosProfesionalesSchema = z.object({
  tipo_servicios: z
    .array(z.enum(TIPO_SERVICIOS_OPTIONS))
    .min(1, "Selecciona al menos un tipo de servicio."),

  tipo_servicios_otro: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal("")),

  descripcion_servicios: maxWordsText(
    "La descripción de servicios",
    300,
    true,
  ),

  sectores: z
    .array(z.enum(SECTORES_OPTIONS))
    .min(1, "Selecciona al menos un sector."),

  sectores_otro: z.string().trim().max(120).optional().or(z.literal("")),

  modalidad_servicios: z
    .array(z.enum(MODALIDAD_SERVICIOS_OPTIONS))
    .min(1, "Selecciona al menos una modalidad."),

  interesado_en: z
    .array(z.enum(INTERESADO_EN_OPTIONS))
    .min(1, "Selecciona al menos una opción de interés."),

  interesado_en_otro: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal("")),
});