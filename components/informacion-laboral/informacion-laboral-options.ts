// @/components/informacion-laboral/informacion-laboral-options.ts
//
// Catálogos de opciones (label/value) usados por los campos radio/checkbox
// de la Sección 3 (Información laboral). Los `value` están tipados contra
// los `pgEnum` de Drizzle para que un typo se detecte en tiempo de
// compilación en vez de en runtime.

import type {
 causaDesempleoEnum,
 estrategiaConsecucionEmpleoEnum,
 factorEmpleoEnum,
 sectorPrimarioEnum,
 sectorSecundarioEnum,
 sectorTerciarioEnum,
 tiempoPrimerEmpleoEnum,
 tipoActividadEnum,
 tipoContratacionEnum,
 tipoInstitucionEnum,
 valoracionImpactoEnum,
 valoracionNivelEnum,
} from "@/lib/db/schema/informacion-laboral";

export interface SelectOption<V extends string = string> {
 label: string;
 value: V;
 /** Si `true`, seleccionar esta opción revela un campo de texto "otro". */
 requiresDetail?: boolean;
}

type EnumValue<E extends { enumValues: readonly string[] }> =
 E["enumValues"][number];

export const TIEMPO_PRIMER_EMPLEO_OPTIONS: SelectOption<
 EnumValue<typeof tiempoPrimerEmpleoEnum>
>[] = [
 { label: "Menos de 6 meses", value: "menos_seis_meses" },
 { label: "6 meses a 1 año", value: "seis_meses_un_anio" },
 { label: "Más de 1 año", value: "mas_de_un_anio" },
 { label: "Aún no cuento con empleo", value: "sin_empleo" },
];

export const MESES_OPTIONS = [
 { value: "1", label: "Enero" },
 { value: "2", label: "Febrero" },
 { value: "3", label: "Marzo" },
 { value: "4", label: "Abril" },
 { value: "5", label: "Mayo" },
 { value: "6", label: "Junio" },
 { value: "7", label: "Julio" },
 { value: "8", label: "Agosto" },
 { value: "9", label: "Septiembre" },
 { value: "10", label: "Octubre" },
 { value: "11", label: "Noviembre" },
 { value: "12", label: "Diciembre" },
] as const;

export const FACTOR_EMPLEO_OPTIONS: SelectOption<
 EnumValue<typeof factorEmpleoEnum>
>[] = [
 { label: "Prestigio de la institución", value: "prestigio_institucion" },
 { label: "Perfil Académico", value: "perfil_academico" },
 { label: "Experiencia Laboral", value: "experiencia_laboral" },
 { label: "Género", value: "genero" },
 { label: "Edad", value: "edad" },
 { label: "Por recomendaciones", value: "recomendaciones" },
 { label: "Otro (especifique)", value: "otro", requiresDetail: true },
];

export const CAUSA_DESEMPLEO_OPTIONS: SelectOption<
 EnumValue<typeof causaDesempleoEnum>
>[] = [
 { label: "Nula o poca experiencia laboral", value: "poca_experiencia" },
 { label: "Falta de oportunidades en el área", value: "falta_oportunidades" },
 { label: "Por no tener el grado académico", value: "sin_grado" },
 { label: "Falta de dominio de otro idioma", value: "idioma" },
 { label: "Causas Personales", value: "personales" },
 { label: "Otro (especifique)", value: "otro", requiresDetail: true },
];

export const ESTRATEGIA_CONSECUCION_EMPLEO_OPTIONS: SelectOption<
 EnumValue<typeof estrategiaConsecucionEmpleoEnum>
>[] = [
 { label: "Buscó en el periódico", value: "periodico" },
 { label: "Por Redes Sociales", value: "redes_sociales" },
 { label: "Revisando Páginas de Internet", value: "internet" },
 { label: "Participando en Convocatorias", value: "convocatorias" },
 { label: "Recomendación de algún contacto", value: "recomendacion_contacto" },
 { label: "Autoempleándose", value: "autoempleo" },
 { label: "Emigrando a otro estado/país", value: "emigracion" },
 { label: "Entregando solicitudes de empleo", value: "solicitudes" },
 { label: "Otro (especifique)", value: "otro", requiresDetail: true },
];

export const TIPO_CONTRATACION_OPTIONS: SelectOption<
 EnumValue<typeof tipoContratacionEnum>
>[] = [
 { label: "Base", value: "base" },
 { label: "Confianza", value: "confianza" },
 { label: "Eventual", value: "eventual" },
 { label: "Por contrato", value: "por_contrato" },
 { label: "Otro", value: "otro", requiresDetail: true },
];

export const TIPO_INSTITUCION_OPTIONS: SelectOption<
 EnumValue<typeof tipoInstitucionEnum>
>[] = [
 { label: "Iniciativa Privada", value: "privada" },
 { label: "Gobierno", value: "gobierno" },
 { label: "Educación", value: "educacion" },
 { label: "Investigación", value: "investigacion" },
 { label: "Social", value: "social" },
 { label: "Otro (especifique)", value: "otro", requiresDetail: true },
];

export const SECTOR_PRIMARIO_OPTIONS: SelectOption<
 EnumValue<typeof sectorPrimarioEnum>
>[] = [
 { label: "Agricultura", value: "agricultura" },
 { label: "Ganadería", value: "ganaderia" },
 { label: "Explotación forestal", value: "forestal" },
 { label: "Pesca", value: "pesca" },
];

export const SECTOR_SECUNDARIO_OPTIONS: SelectOption<
 EnumValue<typeof sectorSecundarioEnum>
>[] = [
 { label: "Minería", value: "mineria" },
 {
 label: "Generación, transmisión y distribución de energía eléctrica",
 value: "energia",
 },
 { label: "Suministro de Agua y de gas", value: "agua_gas" },
 { label: "Construcción", value: "construccion" },
 { label: "Industria Manufacturera", value: "manufactura" },
];

export const SECTOR_TERCIARIO_OPTIONS: SelectOption<
 EnumValue<typeof sectorTerciarioEnum>
>[] = [
 { label: "Comercio al por mayor", value: "comercio_mayor" },
 { label: "Comercio al por menor", value: "comercio_menor" },
 { label: "Transportes, correos y almacenamiento", value: "transporte" },
 { label: "Información en medios masivos", value: "medios" },
 { label: "Servicios financieros y de seguros", value: "financiero" },
 { label: "Servicios inmobiliarios y de alquiler", value: "inmobiliario" },
 {
 label: "Servicios profesionales, científicos y técnicos",
 value: "profesionales",
 },
 { label: "Servicios educativos", value: "educativos" },
 { label: "Servicios de salud y asistencia social", value: "salud" },
 { label: "Servicios de esparcimiento y culturales", value: "cultura" },
 {
 label: "Servicios de alojamiento y preparación de alimentos",
 value: "turismo",
 },
 { label: "Otros servicios", value: "otros_servicios" },
];

export const TIPO_ACTIVIDAD_OPTIONS: SelectOption<
 EnumValue<typeof tipoActividadEnum>
>[] = [
 { label: "Académica", value: "academica" },
 { label: "Empresarial", value: "empresarial" },
 { label: "Gubernamental", value: "gubernamental" },
 { label: "Independiente / Freelance", value: "independiente" },
 { label: "Otro (especifique)", value: "otro", requiresDetail: true },
];

export const VALORACION_NIVEL_OPTIONS: SelectOption<
 EnumValue<typeof valoracionNivelEnum>
>[] = [
 { label: "Muy baja", value: "muy_baja" },
 { label: "Baja", value: "baja" },
 { label: "Media", value: "media" },
 { label: "Alta", value: "alta" },
 { label: "Muy alta", value: "muy_alta" },
];

export const VALORACION_IMPACTO_OPTIONS: SelectOption<
 EnumValue<typeof valoracionImpactoEnum>
>[] = [
 { label: "Muy bajo", value: "muy_bajo" },
 { label: "Bajo", value: "bajo" },
 { label: "Medio", value: "medio" },
 { label: "Alto", value: "alto" },
 { label: "Muy alto", value: "muy_alto" },
];

