import { contactoSchema } from "@/lib/registro/schemas/contacto";
import { emergenciaSchema } from "@/lib/registro/schemas/datos-emergencia";
import { perfilProfesionalSchema } from "@/lib/registro/schemas/perfil-profesional";
import { serviciosProfesionalesSchema } from "@/lib/registro/schemas/servicios-profesionales";
import { ubicacionSchema } from "@/lib/registro/schemas/ubicacion";
import { requiredSelect, requiredText } from "@/lib/registro/schemas/util";
import { visibilidadSchema } from "@/lib/registro/schemas/visibilidad";
import { GENERO_OPTIONS, RegistroFormValues } from "./steps/types";
import { z } from "zod";

const OTRO_ESPECIFIQUE = "Otro (especifique)";

export function buildRegistroSchema() {
 const datosGenerales = z.object({
 apellido_paterno: requiredText("El apellido paterno"),
 apellido_materno: requiredText("El apellido materno"),
 nombres: requiredText("El nombre"),
 genero: requiredSelect(GENERO_OPTIONS, "Selecciona una opción de género."),
 });

 return datosGenerales
 .extend(contactoSchema.shape)
 .extend(ubicacionSchema.shape)
 .extend(perfilProfesionalSchema.shape)
 .extend(serviciosProfesionalesSchema.shape)
 .extend(emergenciaSchema.shape)
 .extend(visibilidadSchema.shape)
 .superRefine((data, ctx) => {
 const requireOtro = (
 selected: string[] | string,
 otroValue: string,
 path: string,
 ) => {
 const hasOtro = Array.isArray(selected)
 ? selected.includes(OTRO_ESPECIFIQUE)
 : selected === OTRO_ESPECIFIQUE;

 if (hasOtro && otroValue.trim() === "") {
 ctx.addIssue({
 code: "custom",
 message: 'Especifica la opción "Otro".',
 path: [path],
 });
 }

 if (hasOtro && otroValue.length > 150) {
 ctx.addIssue({
 code: "custom",
 message: 'La opción "Otro" no puede superar los 150 caracteres.',
 path: [path],
 });
 }
 };

 requireOtro(
 data.area_conocimiento,
 data.area_conocimiento_otro ?? "",
 "area_conocimiento_otro",
 );

 requireOtro(
 data.tipo_servicios,
 data.tipo_servicios_otro ?? "",
 "tipo_servicios_otro",
 );

 requireOtro(data.sectores, data.sectores_otro ?? "", "sectores_otro");

 requireOtro(
 data.interesado_en,
 data.interesado_en_otro ?? "",
 "interesado_en_otro",
 );

 requireOtro(
 data.parentesco_contacto_emergencia,
 data.parentesco_contacto_emergencia_otro ?? "",
 "parentesco_contacto_emergencia_otro",
 );
 });
}

/** Esquema por defecto (sin verificación de dimensiones) */
export const registroClientSchema = buildRegistroSchema();

export type RegistroFormInput = z.input<typeof registroClientSchema>;
export type RegistroFormOutput = z.output<typeof registroClientSchema>;

/** Nombres de campos por paso, usados con `trigger()` de react-hook-form. */
export const STEP_FIELDS: (keyof RegistroFormValues)[][] = [
 ["apellido_paterno", "apellido_materno", "nombres", "genero"],
 [
 "telefono_celular",
 "telefono_casa",
 "correo_electronico",
 "linkedin",
 "orcid",
 "sitio_web",
 ],
 ["estado_residencia", "ciudad_residencia", "disponibilidad_geografica"],
 [
 "area_conocimiento",
 "area_conocimiento_otro",
 "perfil_profesional",
 "palabras_clave",
 "habilidades_tecnologicas",
 "proyectos_relevantes",
 ],
 [
 "tipo_servicios",
 "tipo_servicios_otro",
 "descripcion_servicios",
 "sectores",
 "sectores_otro",
 "modalidad_servicios",
 "interesado_en",
 "interesado_en_otro",
 ],
 [
 "nombre_contacto_emergencia",
 "parentesco_contacto_emergencia",
 "parentesco_contacto_emergencia_otro",
 "telefono_contacto_emergencia",
 "tipo_sanguineo",
 "alergias_condiciones_medicas",
 "privacidad_datos_emergencia",
 ],
 ["autoriza_publicacion", "datos_publicos"],
];
