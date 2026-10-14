// 
// 4. Perfil profesional público
// 

import z from "zod";
import { AREA_CONOCIMIENTO_OPTIONS } from "../types";
import { maxWordsText, proyectoRelevanteSchema, requiredText } from "./util";

export const perfilProfesionalSchema = z.object({
 area_conocimiento: z
 .array(z.enum(AREA_CONOCIMIENTO_OPTIONS))
 .min(1, "Selecciona al menos un área de conocimiento."),

 area_conocimiento_otro: z
 .string()
 .trim()
 .max(120)
 .optional()
 .or(z.literal("")),

 perfil_profesional: maxWordsText("El perfil profesional", 200, true),

 palabras_clave: z
 .array(
 z
 .string()
 .trim()
 .min(5, "Cada palabra clave debe tener al menos 5 caracteres.")
 .max(50, "Cada palabra clave debe tener máximo 50 caracteres."),
 )
 .min(1, "Agrega al menos una palabra clave.")
 .max(10, "Puedes agregar máximo 10 palabras clave."),

 habilidades_tecnologicas: requiredText(
 "Las habilidades tecnológicas",
 1500,
 ),

 proyectos_relevantes: z
 .array(proyectoRelevanteSchema)
 .max(5, "Máximo 5 proyectos."),
});