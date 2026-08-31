// Tipos que reflejan la estructura del formulario "Registro de Afiliado - REP TecNM".
// Estos tipos son compartidos entre el cliente (formulario) y el servidor (API route),
// por lo que cualquier cambio aquí debe reflejarse en ambos lados.

export const GENERO_OPTIONS = [
  "Mujer",
  "Hombre",
  "No binario",
  "Persona no conforme con el género",
  "Prefiero no decirlo",
  "Otro",
] as const;
export type Genero = (typeof GENERO_OPTIONS)[number];

export const DISPONIBILIDAD_OPTIONS = [
  "Local",
  "Nacional",
  "Internacional",
  "Remoto",
] as const;
export type Disponibilidad = (typeof DISPONIBILIDAD_OPTIONS)[number];

export const AREA_CONOCIMIENTO_OPTIONS = [
  "Ciencias Ambientales y Sustentabilidad",
  "Ciencias Económico-Administrativas",
  "Ciencias Exactas y Naturales",
  "Ciencias de la Computación y Tecnologías de la Información",
  "Ciencias Sociales y Administrativas",
  "Innovación, Desarrollo Tecnológico y Transferencia de Tecnología",
  "Energía y Desarrollo Sostenible",
  "Educación y Tecnología Educativa",
  "Gestión y Políticas Públicas",
  "Ingeniería y Tecnología",
  "Interdisciplinaria / Multidisciplinaria",
  "Otro (especifique)",
] as const;
export type AreaConocimiento = (typeof AREA_CONOCIMIENTO_OPTIONS)[number];

export const TIPO_SERVICIOS_OPTIONS = [
  "Asesoría técnica",
  "Consultoría",
  "Capacitación",
  "Desarrollo tecnológico",
  "Diseño / innovación",
  "Investigación aplicada",
  "Otro (especifique)",
] as const;
export type TipoServicio = (typeof TIPO_SERVICIOS_OPTIONS)[number];

export const SECTORES_OPTIONS = [
  "Educativo",
  "Empresarial",
  "Gobierno",
  "Industrial",
  "Social",
  "Otro (especifique)",
] as const;
export type Sector = (typeof SECTORES_OPTIONS)[number];

export const MODALIDAD_SERVICIOS_OPTIONS = [
  "Por proyecto",
  "Por horas",
  "Tiempo completo",
] as const;
export type ModalidadServicio = (typeof MODALIDAD_SERVICIOS_OPTIONS)[number];

export const INTERESADO_EN_OPTIONS = [
  "Colaborar en proyectos",
  "Dar capacitación",
  "Participar en investigación",
  "Networking",
  "Mentoría",
  "Otro (especifique)",
] as const;
export type InteresadoEn = (typeof INTERESADO_EN_OPTIONS)[number];

export const PARENTESCO_OPTIONS = [
  "Madre",
  "Padre",
  "Hijo(a)",
  "Hermano(a)",
  "Cónyuge",
  "Pareja",
  "Otro familiar",
  "Tutor(a)",
  "Otro (especifique)",
] as const;
export type Parentesco = (typeof PARENTESCO_OPTIONS)[number];

export const TIPO_SANGUINEO_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;
export type TipoSanguineo = (typeof TIPO_SANGUINEO_OPTIONS)[number];

export const DATOS_PUBLICOS_OPTIONS = [
  "Correo de contacto",
  "Teléfono móvil",
  "Correo de contacto y Teléfono móvil",
  "Sólo contacto mediante plataforma",
] as const;
export type DatoPublico = (typeof DATOS_PUBLICOS_OPTIONS)[number];

export const ESTADOS_MEXICO = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
] as const;
export type EstadoMexico = (typeof ESTADOS_MEXICO)[number];

export interface ProyectoRelevante {
  nombre: string;
  descripcion: string;
  rol: string;
  anio: number;
}

// Forma de los datos tal y como viven en el estado del formulario (cliente).
// Los campos de archivo son `File | null` porque provienen de un <input type="file">
// o del recortador de imagen.
export interface RegistroFormValues {
  // Datos generales
  apellido_paterno: string;
  apellido_materno: string;
  nombres: string;
  fotografia: File | null;
  comprobante_membresia: File | null;
  genero: Genero | "";

  // Contacto
  telefono_celular: string;
  telefono_casa?: string;
  correo_electronico: string;
  linkedin: string;
  orcid: string;
  sitio_web: string;

  // Ubicación para el catálogo
  estado_residencia: EstadoMexico | "";
  ciudad_residencia: string;
  disponibilidad_geografica: Disponibilidad[];

  // Perfil profesional público
  area_conocimiento: AreaConocimiento[];
  area_conocimiento_otro: string;
  perfil_profesional: string;
  palabras_clave: string[];
  habilidades_tecnologicas: string;
  proyectos_relevantes: ProyectoRelevante[];

  // Servicios profesionales
  tipo_servicios: TipoServicio[];
  tipo_servicios_otro: string;
  descripcion_servicios: string;
  sectores: Sector[];
  sectores_otro: string;
  modalidad_servicios: ModalidadServicio[];
  interesado_en: InteresadoEn[];
  interesado_en_otro: string;

  // Datos de emergencia
  nombre_contacto_emergencia: string;
  parentesco_contacto_emergencia: Parentesco | "";
  parentesco_contacto_emergencia_otro: string;
  telefono_contacto_emergencia: string;
  tipo_sanguineo: TipoSanguineo | "";
  alergias_condiciones_medicas: string;
  privacidad_datos_emergencia: boolean;

  // Visibilidad
  autoriza_publicacion: boolean;
  datos_publicos: DatoPublico[];
}

export const FORM_STEPS = [
  "Datos generales",
  "Contacto",
  "Ubicación para el catálogo",
  "Perfil profesional público",
  "Servicios profesionales",
  "Datos de emergencia",
  "Visibilidad",
] as const;

export type FormStepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
