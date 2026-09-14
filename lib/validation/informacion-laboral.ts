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

const tiempoPrimerEmpleoSchema = z.enum(tiempoPrimerEmpleoEnum.enumValues);
const factorEmpleoSchema = z.enum(factorEmpleoEnum.enumValues);
const causaDesempleoSchema = z.enum(causaDesempleoEnum.enumValues);
const estrategiaConsecucionEmpleoSchema = z.enum(
  estrategiaConsecucionEmpleoEnum.enumValues,
);
const tipoContratacionSchema = z.enum(tipoContratacionEnum.enumValues);
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
  tiempoPrimerEmpleo: tiempoPrimerEmpleoSchema,

  factoresEmpleo: z.array(factorEmpleoSchema).optional().default([]),
  factoresEmpleoOtro: z.string().trim().min(1).max(500).nullable().optional(),

  laboraActualmente: z.boolean().default(false),

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

export const informacionLaboralSchema =
  baseInformacionLaboralSchema.superRefine((data, ctx) => {
    const consiguioEmpleo = data.tiempoPrimerEmpleo !== "sin_empleo";

    if (!consiguioEmpleo && data.factoresEmpleo.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["factoresEmpleo"],
        message: "No aplica cuando aún no cuenta con empleo.",
      });
    }
    if (
      consiguioEmpleo &&
      data.factoresEmpleo.includes("otro") &&
      !data.factoresEmpleoOtro
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["factoresEmpleoOtro"],
        message: "Especifique el otro factor.",
      });
    }

    if (data.laboraActualmente && data.causasDesempleo.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["causasDesempleo"],
        message: "No aplica cuando la persona labora actualmente.",
      });
    }
    if (
      !data.laboraActualmente &&
      data.causasDesempleo.includes("otro") &&
      !data.causasDesempleoOtro
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["causasDesempleoOtro"],
        message: "Especifique la otra causa.",
      });
    }

    if (!consiguioEmpleo && data.estrategiaPostgrado.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["estrategiaPostgrado"],
        message: "No aplica cuando aún no cuenta con empleo.",
      });
    }
    if (
      consiguioEmpleo &&
      data.estrategiaPostgrado.includes("otro") &&
      !data.estrategiaPostgradoOtro
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["estrategiaPostgradoOtro"],
        message: "Especifique la otra estrategia.",
      });
    }
  });

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

  fechaInicioAnio: z.coerce.number().int().min(1965),
  fechaInicioMes: z.coerce.number().int().min(1).max(12),

  esActual: z.boolean().default(false),

  fechaFinAnio: z.coerce.number().int().min(1965).nullable().optional(),
  fechaFinMes: z.coerce.number().int().min(1).max(12).nullable().optional(),

  tipoContratacion: tipoContratacionSchema.nullable().optional(),
  tipoContratacionOtro: z.string().trim().min(1).max(200).nullable().optional(),

  // numeric() de Drizzle devuelve string por defecto: se acepta string o
  // number desde el formulario/API y se normaliza a number para validar.
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
  // Fecha de inicio no puede ser futura
  if (esFechaFutura(data.fechaInicioAnio, data.fechaInicioMes)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["fechaInicioMes"],
      message: "La fecha de inicio no puede ser posterior al mes/año actual.",
    });
  }

  if (!data.esActual) {
    // No es el empleo actual -> fecha de término requerida
    if (data.fechaFinAnio == null || data.fechaFinMes == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fechaFinAnio"],
        message:
          "La fecha de término es requerida si el empleo no es el actual.",
      });
    } else {
      if (esFechaFutura(data.fechaFinAnio, data.fechaFinMes)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fechaFinMes"],
          message:
            "La fecha de término no puede ser posterior al mes/año actual.",
        });
      }
      const inicio = data.fechaInicioAnio * 12 + data.fechaInicioMes;
      const fin = data.fechaFinAnio * 12 + data.fechaFinMes;
      if (fin < inicio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fechaFinMes"],
          message:
            "La fecha de término no puede ser anterior a la fecha de inicio.",
        });
      }
    }
  } else if (data.fechaFinAnio != null || data.fechaFinMes != null) {
    // Es el empleo actual -> fecha de término debe quedar vacía
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["fechaFinAnio"],
      message: "Debe quedar vacía si es el empleo actual.",
    });
  }

  if (data.tipoContratacion === "otro" && !data.tipoContratacionOtro) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["tipoContratacionOtro"],
      message: "Especifique el otro tipo de contratación.",
    });
  }

  if (!data.esActual) {
    // Campos que en el formulario solo se muestran cuando es el empleo actual
    const soloEmpleoActual: Record<string, unknown> = {
      tipoInstitucion: data.tipoInstitucion.length
        ? data.tipoInstitucion
        : undefined,
      telefonoOrganismo: data.telefonoOrganismo,
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
          code: z.ZodIssueCode.custom,
          path: [field],
          message: "Este campo solo aplica cuando es el empleo actual.",
        });
      }
    }
  } else {
    if (data.tipoInstitucion.includes("otro") && !data.tipoInstitucionOtro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tipoInstitucionOtro"],
        message: "Especifique el otro tipo de institución.",
      });
    }
    if (data.tipoActividad.includes("otro") && !data.tipoActividadOtro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tipoActividadOtro"],
        message: "Especifique el otro tipo de actividad.",
      });
    }
    if (
      data.estrategiaEmpleoActual.includes("otro") &&
      !data.estrategiaEmpleoActualOtro
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
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
