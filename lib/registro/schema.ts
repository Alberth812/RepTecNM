import { z } from "zod";
import {
  AREA_CONOCIMIENTO_OPTIONS,
  DATOS_PUBLICOS_OPTIONS,
  DISPONIBILIDAD_OPTIONS,
  ESTADOS_MEXICO,
  INTERESADO_EN_OPTIONS,
  MODALIDAD_SERVICIOS_OPTIONS,
  PARENTESCO_OPTIONS,
  RegistroFormValues,
  SECTORES_OPTIONS,
  TIPO_SANGUINEO_OPTIONS,
  TIPO_SERVICIOS_OPTIONS,
  GENERO_OPTIONS,
} from "./types";
import {
  COMPROBANTE_MIME_TYPES,
  MAX_COMPROBANTE_SIZE_BYTES,
  MAX_PHOTO_SIZE_BYTES,
  ORCID_REGEX,
  PHONE_REGEX,
  PHOTO_ASPECT_RATIO,
  PHOTO_MIME_TYPES,
  PHOTO_MIN_HEIGHT,
  PHOTO_MIN_WIDTH,
  formatBytes,
} from "./validators";

const OTRO_ESPECIFIQUE = "Otro (especifique)";

/** Texto simple obligatorio, con longitud máxima razonable para nombres/lugares. */
const requiredText = (label: string, max = 120) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio.`)
    .max(max, `${label} no debe exceder ${max} caracteres.`);

const phoneSchema = (label: string) =>
  z
    .string()
    .trim()
    .regex(
      PHONE_REGEX,
      `${label} debe tener 10 dígitos, sin espacios ni guiones.`,
    );

const optionalPhoneSchema = z
  .string()
  .trim()
  .regex(
    PHONE_REGEX,
    "El teléfono debe tener 10 dígitos, sin espacios ni guiones.",
  )
  .optional()
  .or(z.literal(""));

const maxWordsText = (label: string, maxWords: number, required: boolean) => {
  const base = z.string().trim();
  const withMax = base.refine(
    (val) => {
      if (val === "") return true;
      const words = val.split(/\s+/).filter(Boolean);
      return words.length <= maxWords;
    },
    { message: `${label} no debe exceder ${maxWords} palabras.` },
  );
  return required
    ? withMax.refine((val) => val.length > 0, {
        message: `${label} es obligatorio.`,
      })
    : withMax;
};

type ImageDimensionChecker = (
  file: File,
) => Promise<{ width: number; height: number }>;

/**
 * La fotografía es obligatoria: JPG/PNG, máx. 5 MB, y (cuando se provee un
 * `checkImageDimensions`, típicamente en el navegador tras el recorte) al
 * menos 354x472px con relación de aspecto 3:4.
 *
 * NOTA para el backend: en el servidor no se valida la relación de aspecto ni
 * la resolución por defecto (evitamos depender de librerías de imagen como
 * `sharp` en este stub). El recortador del cliente ya garantiza una salida de
 * 3:4 a resolución suficiente; para blindar el servidor en producción, pase
 * un `checkImageDimensions` respaldado por `sharp`/`image-size`.
 */
function fotografiaSchema(checkImageDimensions?: ImageDimensionChecker) {
  return z
    .custom<File | null>((val) => val === null || val instanceof File, {
      message: "La fotografía es obligatoria.",
    })
    .superRefine(async (file, ctx) => {
      if (!file) {
        ctx.addIssue({
          code: "custom",
          message: "La fotografía es obligatoria.",
        });
        return;
      }
      if (
        !PHOTO_MIME_TYPES.includes(
          file.type as (typeof PHOTO_MIME_TYPES)[number],
        )
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Formato inválido. Solo se aceptan JPG o PNG.",
        });
      }
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        ctx.addIssue({
          code: "custom",
          message: `La fotografía no debe superar ${formatBytes(MAX_PHOTO_SIZE_BYTES)}.`,
        });
      }
      if (checkImageDimensions) {
        try {
          const { width, height } = await checkImageDimensions(file);
          if (width < PHOTO_MIN_WIDTH || height < PHOTO_MIN_HEIGHT) {
            ctx.addIssue({
              code: "custom",
              message: `La imagen debe medir al menos ${PHOTO_MIN_WIDTH}x${PHOTO_MIN_HEIGHT}px.`,
            });
          } else {
            const ratio = width / height;
            if (Math.abs(ratio - PHOTO_ASPECT_RATIO) > 0.02) {
              ctx.addIssue({
                code: "custom",
                message:
                  "La imagen debe tener una relación de aspecto 3:4. Vuelve a recortarla.",
              });
            }
          }
        } catch {
          ctx.addIssue({
            code: "custom",
            message: "No se pudo procesar la imagen. Intenta con otro archivo.",
          });
        }
      }
    })
    .transform((file) => file as File);
}

function comprobanteSchema() {
  return z
    .custom<File | null>((val) => val === null || val instanceof File, {
      message: "Archivo inválido.",
    })
    .superRefine((file, ctx) => {
      if (!file) {
        ctx.addIssue({
          code: "custom",
          message: "El comprobante de membresía es obligatorio.",
        });
        return;
      }

      if (
        !COMPROBANTE_MIME_TYPES.includes(
          file.type as (typeof COMPROBANTE_MIME_TYPES)[number],
        )
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Formato inválido. Se acepta PDF, JPG o PNG.",
        });
      }

      if (file.size > MAX_COMPROBANTE_SIZE_BYTES) {
        ctx.addIssue({
          code: "custom",
          message: `El archivo no debe superar ${formatBytes(
            MAX_COMPROBANTE_SIZE_BYTES,
          )}.`,
        });
      }
    })
    .transform((file) => file as File);
}

const proyectoRelevanteSchema = z.object({
  nombre: requiredText("El nombre del proyecto", 150),
  descripcion: requiredText("La descripción del proyecto", 1000),
  rol: requiredText("El rol desempeñado", 100),
  anio: z
    .number({
      error: "El año es obligatorio.", // O un objeto de mapeo de errores si aplica
    })
    .int("El año debe ser un número entero.")
    .min(1980, "El año no parece válido.")
    .max(new Date().getFullYear(), "El año no puede ser en el futuro."),
});

//

function requiredSelect<const T extends readonly [string, ...string[]]>(
  options: T,
  message: string,
) {
  return z.union([z.literal(""), z.enum(options)]).transform((value, ctx) => {
    if (value === "") {
      ctx.addIssue({
        code: "custom",
        message,
      });
      return z.NEVER;
    }

    return value;
  });
}

/**
 * Construye el esquema completo del formulario. Se expone como función (en
 * lugar de una constante) porque la validación de la fotografía puede
 * requerir un verificador de dimensiones distinto en cliente vs. servidor.
 */
export function buildRegistroSchema(options?: {
  checkImageDimensions?: ImageDimensionChecker;
}) {
  return z
    .object({
      // Datos generales
      apellido_paterno: requiredText("El apellido paterno"),
      apellido_materno: requiredText("El apellido materno"),
      nombres: requiredText("El nombre"),
      fotografia: fotografiaSchema(options?.checkImageDimensions),
      comprobante_membresia: comprobanteSchema(),
      genero: requiredSelect(
        GENERO_OPTIONS,
        "Selecciona una opción de género.",
      ),

      // Contacto
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
        .url("Ingresa una URL válida (incluye https://).")
        .optional()
        .or(z.literal("")),

      // Ubicación para el catálogo
      estado_residencia: requiredSelect(
        ESTADOS_MEXICO,
        "Selecciona tu estado de residencia.",
      ),
      ciudad_residencia: requiredText("La ciudad de residencia"),
      disponibilidad_geografica: z
        .array(z.enum(DISPONIBILIDAD_OPTIONS))
        .min(1, "Selecciona al menos una opción de disponibilidad."),

      // Perfil profesional público
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

      // Servicios profesionales
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

      // Datos de emergencia
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
      privacidad_datos_emergencia: z.boolean(),

      // Visibilidad
      autoriza_publicacion: z.boolean(),
      datos_publicos: z
        .array(z.enum(DATOS_PUBLICOS_OPTIONS))
        .min(1, "Selecciona qué datos deseas mostrar públicamente."),
    })
    .superRefine((data, ctx) => {
      // Validación cruzada para las opciones "Otro (especifique)".
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

/** Esquema por defecto (sin verificación de dimensiones) — útil en el servidor. */
export const registroSchema = buildRegistroSchema();

export type RegistroFormSchema = typeof registroSchema;
export type RegistroFormInput = z.input<RegistroFormSchema>;
export type RegistroFormOutput = z.output<RegistroFormSchema>;
export type RegistroApiPayload = RegistroFormOutput;

export const registroDefaultValues = {
  apellido_paterno: "",
  apellido_materno: "",
  nombres: "",
  fotografia: null,
  comprobante_membresia: null,
  genero: "",
  telefono_celular: "",
  telefono_casa: "",
  correo_electronico: "",
  linkedin: "",
  orcid: "",
  sitio_web: "",
  estado_residencia: "",
  ciudad_residencia: "",
  disponibilidad_geografica: [],
  area_conocimiento: [],
  area_conocimiento_otro: "",
  perfil_profesional: "",
  palabras_clave: [],
  habilidades_tecnologicas: "",
  proyectos_relevantes: [],
  tipo_servicios: [],
  tipo_servicios_otro: "",
  descripcion_servicios: "",
  sectores: [],
  sectores_otro: "",
  modalidad_servicios: [],
  interesado_en: [],
  interesado_en_otro: "",
  nombre_contacto_emergencia: "",
  parentesco_contacto_emergencia: "",
  parentesco_contacto_emergencia_otro: "",
  telefono_contacto_emergencia: "",
  tipo_sanguineo: "",
  alergias_condiciones_medicas: "",
  privacidad_datos_emergencia: false,
  autoriza_publicacion: false,
  datos_publicos: [],
} satisfies RegistroFormInput;

/** Nombres de campos por paso, usados con `trigger()` de react-hook-form. */
export const STEP_FIELDS: (keyof RegistroFormValues)[][] = [
  [
    "apellido_paterno",
    "apellido_materno",
    "nombres",
    "fotografia",
    "comprobante_membresia",
    "genero",
  ],
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
