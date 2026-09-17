// @/lib/validations/informacion-laboral.ts
//
// Ajusta el import de abajo a la ruta real donde coloques
// informacion-laboral.schema.ts dentro de tu proyecto (aquí se usa el
// alias "@" apuntando a la carpeta db/schema, igual que en tus otros
// archivos).

import { z } from "zod";
import {
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

/* -------------------------------------------------------------------------- */
/* Enums Zod (derivados directamente de los pgEnum de Drizzle)               */
/* -------------------------------------------------------------------------- */
//
//
//

const tiempoPrimerEmpleoSchema = z.enum(tiempoPrimerEmpleoEnum.enumValues);
const factorEmpleoSchema = z.enum(factorEmpleoEnum.enumValues);
const causaDesempleoSchema = z.enum(causaDesempleoEnum.enumValues);
const estrategiaConsecucionEmpleoSchema = z.enum(
  estrategiaConsecucionEmpleoEnum.enumValues,
);
const tipoContratacionSchema = z
  .enum(tipoContratacionEnum.enumValues, {
    error: "El tipo de contratación no es válido",
  })
  .nullable()
  .refine((value) => value !== null, {
    error: "El tipo de contratación es requerido",
  });
const tipoInstitucionSchema = z.enum(tipoInstitucionEnum.enumValues);
const sectorPrimarioSchema = z.enum(sectorPrimarioEnum.enumValues);
const sectorSecundarioSchema = z.enum(sectorSecundarioEnum.enumValues);
const sectorTerciarioSchema = z.enum(sectorTerciarioEnum.enumValues);
const tipoActividadSchema = z.enum(tipoActividadEnum.enumValues);
const valoracionNivelSchema = z.enum(valoracionNivelEnum.enumValues);
const valoracionImpactoSchema = z.enum(valoracionImpactoEnum.enumValues);

/* -------------------------------------------------------------------------- */
/* Sección 3 - Campos generales (afiliados_informacion_laboral)              */
/* -------------------------------------------------------------------------- */

const baseInformacionLaboralSchema = z.object({
  tiempoPrimerEmpleo: tiempoPrimerEmpleoSchema.nullable(),

  factoresEmpleo: z.array(factorEmpleoSchema).optional().default([]),

  factoresEmpleoOtro: z.string().trim().min(1).max(500).nullable().optional(),

  laboraActualmente: z.boolean().nullable(),

  causasDesempleo: z.array(causaDesempleoSchema).optional().default([]),

  causasDesempleoOtro: z.string().trim().min(1).max(500).nullable().optional(),

  estrategiaPostgrado: z
    .array(estrategiaConsecucionEmpleoSchema)
    .optional()
    .default([]),

  estrategiaPostgradoOtro: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .nullable()
    .optional(),
});

export const informacionLaboralSchema = baseInformacionLaboralSchema
  .superRefine((data, ctx) => {
    if (data.tiempoPrimerEmpleo === null) {
      ctx.addIssue({
        code: "custom",
        path: ["tiempoPrimerEmpleo"],
        message: "Debe seleccionar una opción.",
      });
      return;
    }

    if (data.laboraActualmente === null) {
      ctx.addIssue({
        code: "custom",
        path: ["laboraActualmente"],
        message: "Debe indicar si labora actualmente.",
      });
    }

    // Si todavía no respondió alguno, no podemos evaluar las reglas
    // dependientes.
    if (data.tiempoPrimerEmpleo === null || data.laboraActualmente === null) {
      return;
    }
    const sinEmpleo =
      data.tiempoPrimerEmpleo === tiempoPrimerEmpleoSchema.enum.sin_empleo;

    if (sinEmpleo) {
      // ----------------------------------------------------------------------
      // Sin empleo:
      // causasDesempleo es obligatorio y debe tener al menos un elemento.
      // factoresEmpleo y estrategiaPostgrado no aplican.
      // ----------------------------------------------------------------------

      if (data.causasDesempleo.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["causasDesempleo"],
          message: "Debe seleccionar al menos una causa de desempleo.",
        });
      }

      if (data.factoresEmpleo.length > 0) {
        ctx.addIssue({
          code: "custom",
          path: ["factoresEmpleo"],
          message: "No aplica cuando aún no cuenta con empleo.",
        });
      }

      if (data.estrategiaPostgrado.length > 0) {
        ctx.addIssue({
          code: "custom",
          path: ["estrategiaPostgrado"],
          message: "No aplica cuando aún no cuenta con empleo.",
        });
      }

      // "Otro" en causas de desempleo
      if (data.causasDesempleo.includes("otro") && !data.causasDesempleoOtro) {
        ctx.addIssue({
          code: "custom",
          path: ["causasDesempleoOtro"],
          message: "Especifique la otra causa.",
        });
      }
    } else {
      // ----------------------------------------------------------------------
      // Con empleo:
      // factoresEmpleo y estrategiaPostgrado son obligatorios y no vacíos.
      // causasDesempleo no aplica.
      // ----------------------------------------------------------------------

      if (data.factoresEmpleo.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["factoresEmpleo"],
          message: "Debe seleccionar al menos un factor de empleo.",
        });
      }

      if (data.estrategiaPostgrado.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["estrategiaPostgrado"],
          message: "Debe seleccionar al menos una estrategia.",
        });
      }

      if (data.causasDesempleo.length > 0) {
        ctx.addIssue({
          code: "custom",
          path: ["causasDesempleo"],
          message: "No aplica cuando cuenta con empleo.",
        });
      }

      // "Otro" en factores de empleo
      if (data.factoresEmpleo.includes("otro") && !data.factoresEmpleoOtro) {
        ctx.addIssue({
          code: "custom",
          path: ["factoresEmpleoOtro"],
          message: "Especifique el otro factor.",
        });
      }

      // "Otro" en estrategia de posgrado
      if (
        data.estrategiaPostgrado.includes("otro") &&
        !data.estrategiaPostgradoOtro
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["estrategiaPostgradoOtro"],
          message: "Especifique la otra estrategia.",
        });
      }
    }
  })
  .transform((data) => ({
    ...data,
    tiempoPrimerEmpleo: data.tiempoPrimerEmpleo!,
    laboraActualmente: data.laboraActualmente!,
  }));

export type InformacionLaboralInput = z.infer<typeof informacionLaboralSchema>;

/* -------------------------------------------------------------------------- */
/* Utilidades de fecha (mes/año actual, sin quedar "congeladas" al importar) */
/* -------------------------------------------------------------------------- */

function esFechaFutura(anio: number, mes: number): boolean {
  const ahora = new Date();
  const anioActual = ahora.getFullYear();
  const mesActual = ahora.getMonth() + 1;
  return anio > anioActual || (anio === anioActual && mes > mesActual);
}

/* -------------------------------------------------------------------------- */
/* Historial de empleos (afiliados_empleos)                                  */
/* -------------------------------------------------------------------------- */

const baseEmpleoSchema = z.object({
  puesto: z.string().trim().min(1, "El puesto es requerido").max(200),
  institucion: z.string().trim().min(1, "La institución es requerida").max(250),

  fechaInicioAnio: z.coerce
    .number()
    .int()
    .min(1965, { error: "El año de inicio debe ser 1965 o posterior" }),
  fechaInicioMes: z.coerce
    .number()
    .int()
    .min(1, { error: "El mes de término debe ser entre 1 y 12" })
    .max(12, { error: "El mes de término debe ser entre 1 y 12" }),

  // Obligatorio en el resultado, false por defecto
  esActual: z.boolean().default(false),

  fechaFinAnio: z.coerce
    .number()
    .int()
    .min(1965, { error: "El año de inicio debe ser 1965 o posterior" })
    .nullable()
    .optional(),
  fechaFinMes: z.coerce.number().int().min(1).max(12).nullable().optional(),

  tipoContratacion: tipoContratacionSchema,
  tipoContratacionOtro: z.string().trim().min(1).max(200).nullable().optional(),

  salarioMensualBruto: z.coerce.number().min(0).nullable().optional(),
  horasSemanales: z.coerce.number().int().min(1).max(48).nullable().optional(),

  tipoInstitucion: z.array(tipoInstitucionSchema).optional().default([]),
  tipoInstitucionOtro: z.string().trim().min(1).max(200).nullable().optional(),

  telefonoOrganismo: z.string().trim().max(20).nullable().optional(),

  sectorPrimario: z.array(sectorPrimarioSchema).optional().default([]),
  sectorSecundario: z.array(sectorSecundarioSchema).optional().default([]),
  sectorTerciario: z.array(sectorTerciarioSchema).optional().default([]),

  tipoActividad: z.array(tipoActividadSchema).optional().default([]),
  tipoActividadOtro: z.string().trim().min(1).max(200).nullable().optional(),

  actividadesPrincipales: z
    .string()
    .trim()
    .refine(
      (val) => val.split(/\s+/).filter(Boolean).length <= 500,
      "No puede exceder 500 palabras.",
    )
    .nullable()
    .optional(),

  estrategiaEmpleoActual: z
    .array(estrategiaConsecucionEmpleoSchema)
    .optional()
    .default([]),

  estrategiaEmpleoActualOtro: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .nullable()
    .optional(),

  valoracionCoincidenciaConocimientos: valoracionNivelSchema
    .nullable()
    .optional(),

  valoracionCapacidadResolverProblemas: valoracionNivelSchema
    .nullable()
    .optional(),

  valoracionImpactoSocial: valoracionImpactoSchema.nullable().optional(),

  valoracionPertinenciaPrograma: valoracionNivelSchema.nullable().optional(),
});

export const empleoSchema = baseEmpleoSchema.superRefine((data, ctx) => {
  // --------------------------------------------------------------------------
  // Fecha de inicio
  // --------------------------------------------------------------------------

  if (esFechaFutura(data.fechaInicioAnio, data.fechaInicioMes)) {
    ctx.addIssue({
      code: "custom",
      path: ["fechaInicioMes"],
      message: "La fecha de inicio no puede ser posterior al mes/año actual.",
    });
  }

  // --------------------------------------------------------------------------
  // Fecha de término según esActual
  // --------------------------------------------------------------------------

  if (!data.esActual) {
    const faltaAnio = data.fechaFinAnio == null;
    const faltaMes = data.fechaFinMes == null;

    if (faltaAnio) {
      ctx.addIssue({
        code: "custom",
        path: ["fechaFinAnio"],
        message: "El año de término es requerido si el empleo no es el actual.",
      });
    }

    if (faltaMes) {
      ctx.addIssue({
        code: "custom",
        path: ["fechaFinMes"],
        message: "El mes de término es requerido si el empleo no es el actual.",
      });
    }

    if (!faltaAnio && !faltaMes) {
      if (esFechaFutura(data.fechaFinAnio!, data.fechaFinMes!)) {
        ctx.addIssue({
          code: "custom",
          path: ["fechaFinMes"],
          message:
            "La fecha de término no puede ser posterior al mes/año actual.",
        });
      }

      const inicio = data.fechaInicioAnio * 12 + data.fechaInicioMes;
      const fin = data.fechaFinAnio! * 12 + data.fechaFinMes!;

      if (fin < inicio) {
        ctx.addIssue({
          code: "custom",
          path: ["fechaFinMes"],
          message:
            "La fecha de término no puede ser anterior a la fecha de inicio.",
        });
      }
    }
  } else if (data.fechaFinAnio != null || data.fechaFinMes != null) {
    ctx.addIssue({
      code: "custom",
      path: ["fechaFinAnio"],
      message: "Debe quedar vacía si es el empleo actual.",
    });
  }

  // --------------------------------------------------------------------------
  // Tipo de contratación
  // --------------------------------------------------------------------------

  if (data.tipoContratacion === "otro" && !data.tipoContratacionOtro) {
    ctx.addIssue({
      code: "custom",
      path: ["tipoContratacionOtro"],
      message: "Especifique el otro tipo de contratación.",
    });
  }

  // --------------------------------------------------------------------------
  // Campos exclusivos del empleo actual
  // --------------------------------------------------------------------------

  if (!data.esActual) {
    const soloEmpleoActual: Record<string, unknown> = {
      tipoInstitucion: data.tipoInstitucion.length
        ? data.tipoInstitucion
        : undefined,

      // telefonoOrganismo queda fuera deliberadamente
      telefonoOrganismo: undefined,

      sectorPrimario: data.sectorPrimario.length
        ? data.sectorPrimario
        : undefined,

      sectorSecundario: data.sectorSecundario.length
        ? data.sectorSecundario
        : undefined,

      sectorTerciario: data.sectorTerciario.length
        ? data.sectorTerciario
        : undefined,

      tipoActividad: data.tipoActividad.length ? data.tipoActividad : undefined,

      actividadesPrincipales: data.actividadesPrincipales,

      estrategiaEmpleoActual: data.estrategiaEmpleoActual.length
        ? data.estrategiaEmpleoActual
        : undefined,

      valoracionCoincidenciaConocimientos:
        data.valoracionCoincidenciaConocimientos,

      valoracionCapacidadResolverProblemas:
        data.valoracionCapacidadResolverProblemas,

      valoracionImpactoSocial: data.valoracionImpactoSocial,

      valoracionPertinenciaPrograma: data.valoracionPertinenciaPrograma,
    };

    for (const [field, value] of Object.entries(soloEmpleoActual)) {
      if (value != null && value !== "") {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "Este campo solo aplica cuando es el empleo actual.",
        });
      }
    }
  } else {
    // ------------------------------------------------------------------------
    // Campos OBLIGATORIOS cuando esActual === true
    // ------------------------------------------------------------------------

    if (data.tipoInstitucion.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["tipoInstitucion"],
        message: "Seleccione al menos un tipo de institución.",
      });
    }

    if (data.sectorPrimario.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["sectorPrimario"],
        message: "Seleccione al menos un sector primario.",
      });
    }

    if (data.sectorSecundario.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["sectorSecundario"],
        message: "Seleccione al menos un sector secundario.",
      });
    }

    if (data.sectorTerciario.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["sectorTerciario"],
        message: "Seleccione al menos un sector terciario.",
      });
    }

    if (data.tipoActividad.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["tipoActividad"],
        message: "Seleccione al menos un tipo de actividad.",
      });
    }

    if (
      data.actividadesPrincipales == null ||
      data.actividadesPrincipales.trim() === ""
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["actividadesPrincipales"],
        message: "Las actividades principales son requeridas.",
      });
    }

    if (data.estrategiaEmpleoActual.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["estrategiaEmpleoActual"],
        message: "Seleccione al menos una estrategia.",
      });
    }

    if (data.valoracionCoincidenciaConocimientos == null) {
      ctx.addIssue({
        code: "custom",
        path: ["valoracionCoincidenciaConocimientos"],
        message: "La valoración es requerida.",
      });
    }

    if (data.valoracionCapacidadResolverProblemas == null) {
      ctx.addIssue({
        code: "custom",
        path: ["valoracionCapacidadResolverProblemas"],
        message: "La valoración es requerida.",
      });
    }

    if (data.valoracionImpactoSocial == null) {
      ctx.addIssue({
        code: "custom",
        path: ["valoracionImpactoSocial"],
        message: "La valoración es requerida.",
      });
    }

    if (data.valoracionPertinenciaPrograma == null) {
      ctx.addIssue({
        code: "custom",
        path: ["valoracionPertinenciaPrograma"],
        message: "La valoración es requerida.",
      });
    }

    // --------------------------------------------------------------
    // Campos "Otro"
    // --------------------------------------------------------------

    if (data.tipoInstitucion.includes("otro") && !data.tipoInstitucionOtro) {
      ctx.addIssue({
        code: "custom",
        path: ["tipoInstitucionOtro"],
        message: "Especifique el otro tipo de institución.",
      });
    }

    if (data.tipoActividad.includes("otro") && !data.tipoActividadOtro) {
      ctx.addIssue({
        code: "custom",
        path: ["tipoActividadOtro"],
        message: "Especifique el otro tipo de actividad.",
      });
    }

    if (
      data.estrategiaEmpleoActual.includes("otro") &&
      !data.estrategiaEmpleoActualOtro
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["estrategiaEmpleoActualOtro"],
        message: "Especifique la otra estrategia.",
      });
    }
  }
});

export type EmpleoInput = z.infer<typeof empleoSchema>;

// Nota: se permiten empleos simultáneos/solapados a propósito (ver notas del
// JSON) -> no se valida solapamiento de fechas entre elementos del arreglo,
// ni unicidad de "esActual".
export const historialEmpleosSchema = z.array(empleoSchema).min(0).max(50);

export type HistorialEmpleosInput = z.infer<typeof historialEmpleosSchema>;

/* -------------------------------------------------------------------------- */
/* Payload combinado para el envío completo de la Sección 3                  */
/* -------------------------------------------------------------------------- */

export const informacionLaboralSeccionSchema = z.object({
  informacionLaboral: informacionLaboralSchema,
  historialEmpleos: historialEmpleosSchema,
});

export type InformacionLaboralSeccionInput = z.infer<
  typeof informacionLaboralSeccionSchema
>;
