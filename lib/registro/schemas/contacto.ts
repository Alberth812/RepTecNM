// 
// 2. Contacto
// 

import z from "zod";
import { optionalPhoneSchema, phoneSchema } from "./util";
import { ORCID_REGEX } from "../validators";

export const contactoSchema = z.object({
  telefono_celular: phoneSchema("El teléfono móvil"),
  telefono_casa: optionalPhoneSchema,
  correo_electronico: z
    .string()
    .trim()
    .min(1, "El correo electrónico es obligatorio.")
    .check(z.email("Ingresa un correo electrónico válido.")),
  linkedin: z.string().trim().max(200).optional().or(z.literal("")),
  orcid: z
    .string()
    .trim()
    .regex(
      ORCID_REGEX,
      "El ORCID debe tener el formato 0000-0000-0000-0000.",
    )
    .optional()
    .or(z.literal("")),
  sitio_web: z
    .string()
    .trim()
    .check(z.email("Ingresa una URL válida (incluye https://)."))
    .optional()
    .or(z.literal("")),
});