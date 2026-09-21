// @/lib/validations/publicaciones.ts
import { z } from "zod";

/* ==========================================================================
   1. CONSTANTES DEL DOMINIO
   ========================================================================== */

/** Versión actual fija (hardcoded) del descargo de responsabilidad (RF-DOC-002). */
export const CURRENT_DESCARGO_VERSION = 1;

/** Tamaño máximo permitido para el documento PDF: 5 MB (RF-DOC-001). */
export const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5,242,880 bytes

/** MIME type estricto permitido. */
export const PDF_MIME_TYPE = "application/pdf" as const;

/** Magic bytes del estándar PDF (%PDF-). */
export const PDF_MAGIC_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

/** Año mínimo permitido de publicación (RF-DOC-003). */
export const MIN_ANIO_PUBLICACION = 1950;

/** Tipos de publicación admitidos por el sistema. */
export const TipoPublicacion = {
  ARTICULO: "ARTICULO",
  TESIS: "TESIS",
  LIBRO: "LIBRO",
  MEMORIA_CONGRESO: "MEMORIA_CONGRESO",
  PRESENTACION: "PRESENTACION",
  ENSAYO: "ENSAYO",
  REPORTE_TECNICO: "REPORTE_TECNICO",
  OTRO: "OTRO",
} as const;

export type TipoPublicacionType =
  (typeof TipoPublicacion)[keyof typeof TipoPublicacion];

export const tipoPublicacionEnum = z.enum([
  TipoPublicacion.ARTICULO,
  TipoPublicacion.TESIS,
  TipoPublicacion.LIBRO,
  TipoPublicacion.MEMORIA_CONGRESO,
  TipoPublicacion.PRESENTACION,
  TipoPublicacion.ENSAYO,
  TipoPublicacion.REPORTE_TECNICO,
  TipoPublicacion.OTRO,
]);

/** Estados posibles de la publicación. */
export const EstadoPublicacion = {
  ACTIVO: "ACTIVO",
} as const;

export const estadoPublicacionEnum = z.enum([EstadoPublicacion.ACTIVO]);

/* ==========================================================================
   2. VALIDACIONES Y NORMALIZADORES AUXILIARES (DOI, ISBN, ISSN, LIKE, PDF)
   ========================================================================== */

// --- Helper: Normalización general de identificadores ---
function normalizeIdentifier(value: string): string {
  return value.trim().replace(/[\s-]/g, "").toUpperCase();
}

// --- Helper: Validación de ISSN ---
export function isValidIssn(value: string): boolean {
  if (!/^\d{7}[\dX]$/.test(value)) {
    return false;
  }

  const digits = value.split("");
  const sum = digits.slice(0, 7).reduce((acc, digit, index) => {
    return acc + Number(digit) * (8 - index);
  }, 0);

  const remainder = sum % 11;
  const checkValue = (11 - remainder) % 11;
  const expectedCheck = checkValue === 10 ? "X" : String(checkValue);

  return digits[7] === expectedCheck;
}

// --- Helper: Validación de ISBN-13 ---
export function isValidIsbn13(value: string): boolean {
  if (!/^\d{13}$/.test(value)) {
    return false;
  }

  const digits = value.split("").map(Number);
  const sum = digits.slice(0, 12).reduce((acc, digit, index) => {
    return acc + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);

  const checkDigit = (10 - (sum % 10)) % 10;
  return digits[12] === checkDigit;
}

// --- Helper: Validación de magic bytes para PDFs (%PDF-) ---
export function hasPdfMagicBytes(buffer: Uint8Array | ArrayBuffer): boolean {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (bytes.length < PDF_MAGIC_BYTES.length) return false;

  for (let i = 0; i < PDF_MAGIC_BYTES.length; i++) {
    if (bytes[i] !== PDF_MAGIC_BYTES[i]) return false;
  }
  return true;
}

// --- Helper: Escape para consultas ILIKE (RF-DOC-008) ---
export function escapeSqlLikePattern(value: string): string {
  return value.replace(/([%_\\])/g, "\\$1");
}

/* ==========================================================================
   3. ESQUEMAS DE CAMPOS INDIVIDUALES
   ========================================================================== */

// --- DOI ---
const DOI_REGEX = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

export const doiSchema = z
  .string()
  .trim()
  .transform((value) =>
    value
      .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
      .replace(/^doi:\s*/i, "")
      .trim(),
  )
  .refine((value) => DOI_REGEX.test(value), {
    message: "El formato del DOI es inválido.",
  })
  .transform((value) => value.toLowerCase());

export const optionalDoiSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (!val) return null;
    const trimmed = val.trim();
    return trimmed === "" ? null : trimmed;
  })
  .pipe(z.union([z.null(), doiSchema]));

// --- ISSN ---
export const issnSchema = z
  .string()
  .trim()
  .max(25, "El ISSN no puede exceder 25 caracteres.")
  .transform(normalizeIdentifier)
  .refine(isValidIssn, {
    message: "El código ISSN ingresado no es válido.",
  });

export const optionalIssnSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (!val) return null;
    const trimmed = val.trim();
    return trimmed === "" ? null : trimmed;
  })
  .pipe(z.union([z.null(), issnSchema]));

// --- ISBN-13 ---
export const isbn13Schema = z
  .string()
  .trim()
  .max(25, "El ISBN no puede exceder 25 caracteres.")
  .transform(normalizeIdentifier)
  .refine(isValidIsbn13, {
    message: "El código ISBN-13 ingresado no es válido.",
  });

export const optionalIsbn13Schema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (!val) return null;
    const trimmed = val.trim();
    return trimmed === "" ? null : trimmed;
  })
  .pipe(z.union([z.null(), isbn13Schema]));

// --- URL de Publicación ---
export const optionalUrlSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (!val) return null;
    const trimmed = val.trim();
    return trimmed === "" ? null : trimmed;
  })
  .pipe(
    z.union([
      z.null(),
      z
        .string()
        .max(500, "La URL no puede exceder los 500 caracteres.")
        .url("La URL de acceso no tiene un formato válido.")
        .refine(
          (val) => {
            try {
              const parsed = new URL(val);
              return (
                parsed.protocol === "http:" || parsed.protocol === "https:"
              );
            } catch {
              return false;
            }
          },
          {
            message:
              "Únicamente se permiten enlaces con protocolo http o https.",
          },
        ),
    ]),
  );

// --- Palabras Clave (RF-DOC-003) ---
// Normaliza: trim, minúsculas, espacios internos colapsados a 1 espacio.
export const singleKeywordSchema = z
  .string()
  .transform((val) => val.trim().toLowerCase().replace(/\s+/g, " "))
  .pipe(
    z
      .string()
      .min(3, "Cada palabra clave debe tener al menos 3 caracteres.")
      .max(50, "Cada palabra clave no debe superar 50 caracteres."),
  );

export const palabrasClaveArraySchema = z
  .array(singleKeywordSchema)
  .min(1, "Debe ingresar al menos 1 palabra clave.")
  .max(15, "No puede registrar más de 15 palabras clave.")
  .superRefine((keywords, ctx) => {
    const seen = new Set<string>();
    for (let i = 0; i < keywords.length; i++) {
      const kw = keywords[i];
      if (seen.has(kw)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `La palabra clave "${kw}" está duplicada tras su normalización.`,
          path: [i],
        });
      }
      seen.add(kw);
    }
  });

// --- Autores (RF-DOC-003) ---
export const autorInputSchema = z.object({
  nombres: z
    .string()
    .trim()
    .min(3, "Los nombres del autor deben tener al menos 3 caracteres.")
    .max(150, "Los nombres del autor no deben exceder 150 caracteres."),
  apellidos: z
    .string()
    .trim()
    .min(3, "Los apellidos del autor deben tener al menos 3 caracteres.")
    .max(150, "Los apellidos del autor no deben exceder 150 caracteres."),
  orden: z
    .number({
      error: (issue) => {
        if (issue.input === undefined) {
          return "El orden del autor es obligatorio.";
        }

        return "El orden debe ser un número entero.";
      },
    })
    .int("El orden del autor debe ser un número entero.")
    .min(1, "El orden del autor debe ser mayor o igual a 1.")
    .max(50, "El orden del autor no puede superar 50."),
});

export const autoresArraySchema = z
  .array(autorInputSchema)
  .min(1, "La publicación debe tener al menos 1 autor.")
  .max(50, "La publicación no puede tener más de 50 autores.")
  .superRefine((autores, ctx) => {
    const ordenes = new Set<number>();
    for (let i = 0; i < autores.length; i++) {
      const orden = autores[i].orden;
      if (ordenes.has(orden)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `La posición de orden ${orden} está duplicada entre los autores.`,
          path: [i, "orden"],
        });
      }
      ordenes.add(orden);
    }
  });

// --- Archivo PDF (Frontend/Backend File) (RF-DOC-001) ---
export const pdfFileSchema = z
  .custom<File>((val) => typeof File !== "undefined" && val instanceof File, {
    message: "Debe proporcionar un archivo válido.",
  })
  .refine((file) => file.size > 0, {
    message: "El archivo no puede estar vacío.",
  })
  .refine((file) => file.size <= MAX_PDF_SIZE_BYTES, {
    message: "El documento PDF no puede exceder el límite de 5 MB.",
  })
  .refine((file) => file.name.toLowerCase().endsWith(".pdf"), {
    message: "El archivo debe tener extensión .pdf.",
  })
  .refine((file) => file.type === PDF_MIME_TYPE, {
    message: "El tipo MIME del archivo debe ser application/pdf.",
  });

/* ==========================================================================
   4. ESQUEMAS BASE DE METADATOS
   ========================================================================== */

export const publicacionBaseMetadataSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres.")
    .max(300, "El título no puede exceder 300 caracteres."),
  descripcion: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres.")
    .max(1800, "La descripción no puede exceder 1,800 caracteres."),
  tipo: tipoPublicacionEnum,
  tipoOtro: z.union([z.string(), z.null(), z.undefined()]).transform((val) => {
    if (!val) return null;
    const trimmed = val.trim();
    return trimmed === "" ? null : trimmed;
  }),
  anioPublicacion: z
    .number({
      error: (issue) => {
        if (issue.code === "invalid_type") {
          return "El año debe ser un número entero.";
        }
        return "El año de publicación es obligatorio.";
      },
    })
    .int("El año de publicación debe ser un número entero.")
    .min(
      MIN_ANIO_PUBLICACION,
      `El año mínimo permitido es ${MIN_ANIO_PUBLICACION}.`,
    )
    .refine(
      (year) => year <= new Date().getFullYear(),
      `El año de publicación no puede ser mayor al año en curso (${new Date().getFullYear()}).`,
    ),
  doi: optionalDoiSchema,
  revistaCongreso: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (!val) return null;
      const trimmed = val.trim();
      return trimmed === "" ? null : trimmed;
    })
    .pipe(
      z.union([
        z.null(),
        z
          .string()
          .max(250, "Revista o congreso no puede exceder 250 caracteres."),
      ]),
    ),
  editorial: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (!val) return null;
      const trimmed = val.trim();
      return trimmed === "" ? null : trimmed;
    })
    .pipe(
      z.union([
        z.null(),
        z.string().max(250, "La editorial no puede exceder 250 caracteres."),
      ]),
    ),
  isbn: optionalIsbn13Schema,
  issn: optionalIssnSchema,
  url: optionalUrlSchema,
  autores: autoresArraySchema,
  palabrasClave: palabrasClaveArraySchema,
});

/**
 * Validador conjunto que garantiza la consistencia entre `tipo` y `tipoOtro`:
 * - Si tipo === "OTRO", tipoOtro es obligatorio (3-50 chars).
 * - Si tipo !== "OTRO", tipoOtro debe ser null.
 */
function refineTipoPublicacion<
  T extends {
    tipo: TipoPublicacionType;
    tipoOtro: string | null;
  },
>(data: T, ctx: z.RefinementCtx) {
  if (data.tipo === TipoPublicacion.OTRO) {
    if (!data.tipoOtro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tipoOtro"],
        message:
          'Debe especificar el tipo de publicación cuando selecciona "Otro".',
      });
      return;
    }

    if (data.tipoOtro.length < 3 || data.tipoOtro.length > 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tipoOtro"],
        message:
          'La especificación de "Otro" debe tener entre 3 y 50 caracteres.',
      });
    }
  } else {
    // Si no es OTRO, se fuerza a que tipoOtro sea null
    data.tipoOtro = null;
  }
}

/* ==========================================================================
   5. ENDPOINT DTO SCHEMAS (REQUESTS & RESPONSES)
   ========================================================================== */

// --------------------------------------------------------------------------
// 5.1 POST /api/publicaciones (Creación de publicación)
// --------------------------------------------------------------------------

export const createPublicacionSchema = publicacionBaseMetadataSchema
  .extend({
    // El usuario debe explícitamente aceptar los términos/descargo (RF-DOC-002)
    aceptaDescargo: z.literal(true, {
      error:
        "Debe leer y aceptar el descargo de responsabilidad para publicar.",
    }),
  })
  .superRefine(refineTipoPublicacion);

export type CreatePublicacionInput = z.infer<typeof createPublicacionSchema>;

// --------------------------------------------------------------------------
// 5.2 PATCH /api/publicaciones/:id (Edición de metadatos) (RF-DOC-007)
// --------------------------------------------------------------------------

// Solo metadatos. No incluye descargo ni sustitución de documento.
export const updatePublicacionSchema =
  publicacionBaseMetadataSchema.superRefine(refineTipoPublicacion);

export type UpdatePublicacionInput = z.infer<typeof updatePublicacionSchema>;

// --------------------------------------------------------------------------
// 5.3 PARÁMETROS DE RUTA: [id]
// --------------------------------------------------------------------------

export const publicacionIdParamSchema = z.object({
  id: z
    .string()
    .uuid("El identificador de publicación debe ser un UUID válido."),
});

export type PublicacionIdParam = z.infer<typeof publicacionIdParamSchema>;

// --------------------------------------------------------------------------
// 5.4 GET /api/afiliado/publicaciones (Consulta "Mis publicaciones") (RF-DOC-008)
// --------------------------------------------------------------------------

export const misPublicacionesQuerySchema = z.object({
  page: z.coerce
    .number({
      error: "El parámetro page debe ser un número.",
    })
    .int("El parámetro page debe ser un número entero.")
    .min(1, "El parámetro page debe ser mayor o igual a 1.")
    .default(1),
  pageSize: z.coerce
    .number({
      error: "El parámetro pageSize debe ser un número.",
    })
    .int("El parámetro pageSize debe ser un número entero.")
    .min(1, "El parámetro pageSize debe ser mayor o igual a 1.")
    .max(150, "El parámetro pageSize no puede exceder 150 elementos.")
    .default(20),
  q: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
});

export type MisPublicacionesQuery = z.infer<typeof misPublicacionesQuerySchema>;

/* ==========================================================================
   6. ESQUEMAS DE RESPUESTA DE LA API (OUTPUTS)
   ========================================================================== */

/** Autor retornado por la API */
export const publicacionAutorResponseSchema = z.object({
  id: z.string().uuid(),
  publicacionId: z.string().uuid(),
  nombres: z.string(),
  apellidos: z.string(),
  orden: z.number().int(),
});

export type PublicacionAutorResponse = z.infer<
  typeof publicacionAutorResponseSchema
>;

/** Metadatos del archivo asociado expuestos de forma segura (sin keys privadas ni endpoints internos) */
export const publicacionArchivoResponseSchema = z.object({
  id: z.string().uuid(),
  originalName: z.string(),
  contentType: z.string(),
  size: z.number(),
  createdAt: z.string().datetime().or(z.date()),
});

export type PublicacionArchivoResponse = z.infer<
  typeof publicacionArchivoResponseSchema
>;

/** Detalle completo de publicación (GET /api/publicaciones/:id) */
export const publicacionDetalleResponseSchema = z.object({
  id: z.string().uuid(),
  afiliadoId: z.string(),
  titulo: z.string(),
  descripcion: z.string(),
  tipo: tipoPublicacionEnum,
  tipoOtro: z.string().nullable(),
  anioPublicacion: z.number().int(),
  doi: z.string().nullable(),
  revistaCongreso: z.string().nullable(),
  editorial: z.string().nullable(),
  isbn: z.string().nullable(),
  issn: z.string().nullable(),
  url: z.string().nullable(),
  estado: estadoPublicacionEnum,
  descargoVersion: z.number().int(),
  descargoAceptadoAt: z.string().datetime().or(z.date()),
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()),
  autores: z.array(publicacionAutorResponseSchema),
  palabrasClave: z.array(z.string()),
  archivo: publicacionArchivoResponseSchema,
});

export type PublicacionDetalleResponse = z.infer<
  typeof publicacionDetalleResponseSchema
>;

/** Elemento del listado para "Mis Publicaciones" */
export const publicacionListItemResponseSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  descripcion: z.string(),
  tipo: tipoPublicacionEnum,
  tipoOtro: z.string().nullable(),
  anioPublicacion: z.number().int(),
  estado: estadoPublicacionEnum,
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()),
  autores: z.array(
    z.object({
      nombres: z.string(),
      apellidos: z.string(),
      orden: z.number().int(),
    }),
  ),
  palabrasClave: z.array(z.string()),
  archivo: z.object({
    id: z.string().uuid(),
    originalName: z.string(),
    size: z.number(),
  }),
});

export type PublicacionListItemResponse = z.infer<
  typeof publicacionListItemResponseSchema
>;

/** Respuesta paginada para GET /api/afiliado/publicaciones */
export const misPublicacionesPaginatedResponseSchema = z.object({
  items: z.array(publicacionListItemResponseSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type MisPublicacionesPaginatedResponse = z.infer<
  typeof misPublicacionesPaginatedResponseSchema
>;

/** Respuesta para la generación de URL firmada bajo demanda (GET /api/publicaciones/:id/documento) */
export const publicacionDocumentoResponseSchema = z.object({
  url: z.string().url(),
  expiresInSeconds: z.number().int(),
  expiresAt: z.string().datetime(),
  fileName: z.string(),
});

export type PublicacionDocumentoResponse = z.infer<
  typeof publicacionDocumentoResponseSchema
>;
