// @/lib/validations/formacion-academica/posgrado.ts
//
// Sección "Posgrados" del JSON de especificación (entity: posgrado). Cubre
// tanto maestría como doctorado, distinguidos por `tipoPosgrado`.

import {
  dedicacionPosgradoEnum,
  estadoCivilEnum,
  fuenteFinanciamientoPosgradoEnum,
  modalidadPosgradoEnum,
  motivoNoObtencionGradoEnum,
  tipoPosgradoEnum,
  trayectoriaPosgradoEnum,
} from "@/lib/db/schema/formacion-academica";
import { z } from "zod";
import {
  anioAcademicoOpcionalSchema,
  anioAcademicoSchema,
  validateConditionalField,
  validateOtroEspecifique,
  validateRangoAnios,
} from "./common";

//
// Sección "Posgrados" -> campo motivos_eleccion_institucion
// (scale_matrix_with_custom_rows)
// Filas fijas como propiedades estructuradas + motivos personalizados
// con su propia calificación.

export const motivoEleccionInstitucionSchema = z.object(
  {
    filas: z.object({
      prestigio_academico: z
        .number({
          error: "El prestigio académico debe ser un número.",
        })
        .int({
          error: "El prestigio académico debe ser un número entero.",
        })
        .min(1, {
          error: "El prestigio académico debe ser mayor o igual a 1.",
        })
        .max(5, {
          error: "El prestigio académico debe ser menor o igual a 5.",
        }),

      proximidad_domicilio: z
        .number({
          error: "La proximidad al domicilio debe ser un número.",
        })
        .int({
          error: "La proximidad al domicilio debe ser un número entero.",
        })
        .min(1, {
          error: "La proximidad al domicilio debe ser mayor o igual a 1.",
        })
        .max(5, {
          error: "La proximidad al domicilio debe ser menor o igual a 5.",
        }),

      posgrado_interes: z
        .number({
          error: "El interés en el posgrado debe ser un número.",
        })
        .int({
          error: "El interés en el posgrado debe ser un número entero.",
        })
        .min(1, {
          error: "El interés en el posgrado debe ser mayor o igual a 1.",
        })
        .max(5, {
          error: "El interés en el posgrado debe ser menor o igual a 5.",
        }),

      beca_academica: z
        .number({
          error: "La beca académica debe ser un número.",
        })
        .int({
          error: "La beca académica debe ser un número entero.",
        })
        .min(1, {
          error: "La beca académica debe ser mayor o igual a 1.",
        })
        .max(5, {
          error: "La beca académica debe ser menor o igual a 5.",
        }),
    }),

    otros: z
      .array(
        z.object({
          motivo: z
            .string({
              error: "El motivo personalizado debe ser un texto.",
            })
            .min(1, "El motivo personalizado no puede estar vacío."),

          calificacion: z
            .number({
              error: "La calificación debe ser un número.",
            })
            .int({
              error: "La calificación debe ser un número entero.",
            })
            .min(1, {
              error: "La calificación debe ser mayor o igual a 1.",
            })
            .max(5, {
              error: "La calificación debe ser menor o igual a 5.",
            }),
        }),
        {
          error: "Los motivos personalizados deben ser una lista válida.",
        },
      )
      .optional(),
  },
  {
    error: "Los motivos de elección de la institución no son válidos.",
  },
);

export const posgradoSchema = z
  .object(
    {
      id: z
        .uuid({
          error: "El identificador del posgrado no es válido.",
        })
        .optional(),

      tipoPosgrado: z.enum(tipoPosgradoEnum.enumValues, {
        error: "Debe seleccionar una opción mostrada.",
      }),

      // Conserva la semántica de "Maestría y Doctorado" sin forzar
      // una entidad única.
      trayectoriaPosgrado: z
        .enum(trayectoriaPosgradoEnum.enumValues, {
          error: "La trayectoria del posgrado no es válida.",
        })
        .nullish(), // visible_when tipo_posgrado = DOCTORADO

      institucionId: z.uuid({
        error: "Selecciona una institución válida.",
      }),

      programa: z
        .string({
          error: "El programa debe ser un texto.",
        })
        .min(1, "El programa es requerido."),

      disciplina: z
        .string({
          error: "La disciplina debe ser un texto.",
        })
        .min(1, "La disciplina es requerida."),

      lineaInvestigacion: z
        .string({
          error: "La línea de investigación debe ser un texto.",
        })
        .nullish(), // opcional

      motivosEleccionInstitucion: motivoEleccionInstitucionSchema,

      anioIngreso: anioAcademicoSchema, // required: true

      anioEgreso: anioAcademicoOpcionalSchema, // required: false,
      // puede faltar si actualmente_cursa

      actualmenteCursa: z.boolean({
        error: "Debe indicar si actualmente cursa el posgrado.",
      }),

      modalidad: z.enum(modalidadPosgradoEnum.enumValues, {
        error: "Debe seleccionar una opción mostrada.",
      }),

      modalidadOtra: z
        .string({
          error: "La modalidad especificada debe ser un texto.",
        })
        .nullish(), // visible_when modalidad = OTRA

      dedicacion: z.enum(dedicacionPosgradoEnum.enumValues, {
        error: "Debe seleccionar una opción mostrada.",
      }),

      becado: z.boolean({
        error: "Debe indicar si cuenta con una beca.",
      }),

      fuentesFinanciamiento: z
        .array(
          z.enum(fuenteFinanciamientoPosgradoEnum.enumValues, {
            error: "Debe seleccionar una fuente de financiamiento válida.",
          }),
          {
            error: "Las fuentes de financiamiento deben ser una lista válida.",
          },
        )
        .nullish(), // visible_when becado = true

      fuentesFinanciamientoOtro: z
        .string({
          error: "La otra fuente de financiamiento debe ser un texto.",
        })
        .nullish(), // visible_when fuentes_financiamiento contiene OTRO

      tieneGrado: z.boolean({
        error: "Debe indicar si ha obtenido el grado.",
      }),

      anioObtencionGrado: anioAcademicoOpcionalSchema, // visible_when
      // tiene_grado = true

      mesesObtencionGrado: z
        .number({
          error: "Los meses para obtener el grado deben ser un número.",
        })
        .int({
          error: "Los meses para obtener el grado deben ser un número entero.",
        })
        .min(0, {
          error:
            "Los meses para obtener el grado deben ser un entero no negativo.",
        })
        .nullish(), // visible_when tiene_grado = true

      motivoNoObtencionGrado: z
        .enum(motivoNoObtencionGradoEnum.enumValues, {
          error:
            "Debe seleccionar un motivo válido por el que no ha obtenido el grado.",
        })
        .nullish(), // visible_when tiene_grado = false

      motivoNoObtencionGradoOtro: z
        .string({
          error: "El motivo especificado debe ser un texto.",
        })
        .nullish(), // visible_when motivo_no_obtencion_grado = OTRO

      // Datos históricos conservados por compatibilidad con el formulario original.
      estadoCivilInicio: z
        .enum(estadoCivilEnum.enumValues, {
          error: "El estado civil al iniciar el posgrado no es válido.",
        })
        .nullish(),

      estadoCivilInicioOtro: z
        .string({
          error:
            "El estado civil especificado al iniciar el posgrado debe ser un texto.",
        })
        .nullish(), // visible_when estado_civil_inicio = OTRO

      estadoCivilConclusion: z
        .enum(estadoCivilEnum.enumValues, {
          error: "El estado civil al concluir el posgrado no es válido.",
        })
        .nullish(), // visible_when actualmente_cursa = false

      estadoCivilConclusionOtro: z
        .string({
          error:
            "El estado civil especificado al concluir el posgrado debe ser un texto.",
        })
        .nullish(), // visible_when estado_civil_conclusion = OTRO
    },
    {
      error: "Los datos del posgrado no son válidos.",
    },
  )
  .superRefine((data, ctx) => {
    // trayectoria_posgrado visible_when tipo_posgrado = DOCTORADO
    validateConditionalField(
      ctx,
      data.trayectoriaPosgrado,
      data.tipoPosgrado === "DOCTORADO",
      ["trayectoriaPosgrado"],
      "La trayectoria del posgrado",
    );

    // cross_entity_validation_rules: anio_egreso >= anio_ingreso
    validateRangoAnios(
      ctx,
      data.anioIngreso,
      data.anioEgreso,
      ["anioEgreso"],
      "El año de egreso debe ser mayor o igual al año de ingreso.",
    );

    // cross_entity_validation_rules: actualmente_cursa = true => anio_egreso is null
    validateConditionalField(
      ctx,
      data.anioEgreso,
      data.actualmenteCursa !== true,
      ["anioEgreso"],
      "El año de egreso",
      { requiredWhenVisible: true },
    );

    // modalidad_otra visible_when modalidad = OTRA
    validateOtroEspecifique(
      ctx,
      data.modalidadOtra,
      data.modalidad === "OTRA",
      ["modalidadOtra"],
      "la modalidad",
    );

    // cross_entity_validation_rules: becado = false => fuentes_financiamiento is empty
    // (shouldBeVisible = becado === true cubre también el caso becado = null/undefined)
    validateConditionalField(
      ctx,
      data.fuentesFinanciamiento,
      data.becado === true,
      ["fuentesFinanciamiento"],
      "La fuente de financiamiento",
      { requiredWhenVisible: true },
    );

    // fuentes_financiamiento_otro visible_when fuentes_financiamiento contiene OTRO
    validateOtroEspecifique(
      ctx,
      data.fuentesFinanciamientoOtro,
      Boolean(data.fuentesFinanciamiento?.includes("OTRO")),
      ["fuentesFinanciamientoOtro"],
      "la fuente de financiamiento",
    );

    // cross_entity_validation_rules: tiene_grado = true => anio_obtencion_grado requerido
    // cross_entity_validation_rules: tiene_grado = false => anio_obtencion_grado is null
    validateConditionalField(
      ctx,
      data.anioObtencionGrado,
      data.tieneGrado === true,
      ["anioObtencionGrado"],
      "El año de obtención del grado",
      { requiredWhenVisible: true },
    );

    // cross_entity_validation_rules: anio_obtencion_grado >= anio_egreso
    if (data.tieneGrado === true) {
      validateRangoAnios(
        ctx,
        data.anioEgreso,
        data.anioObtencionGrado,
        ["anioObtencionGrado"],
        "El año de obtención del grado debe ser mayor o igual al año de egreso.",
      );
    }

    validateConditionalField(
      ctx,
      data.mesesObtencionGrado,
      data.tieneGrado === true,
      ["mesesObtencionGrado"],
      "Los meses para obtener el grado",
      { requiredWhenVisible: true },
    );

    // motivo_no_obtencion_grado visible_when tiene_grado = false
    validateConditionalField(
      ctx,
      data.motivoNoObtencionGrado,
      data.tieneGrado === false,
      ["motivoNoObtencionGrado"],
      "El motivo por el que no ha obtenido el grado",
      { requiredWhenVisible: true },
    );

    validateOtroEspecifique(
      ctx,
      data.motivoNoObtencionGradoOtro,
      data.motivoNoObtencionGrado === "OTRO",
      ["motivoNoObtencionGradoOtro"],
      "el motivo por el que no ha obtenido el grado",
    );

    // estado_civil_*_otro visible_when estado_civil_* = OTRO
    validateOtroEspecifique(
      ctx,
      data.estadoCivilInicioOtro,
      data.estadoCivilInicio === "OTRO",
      ["estadoCivilInicioOtro"],
      "el estado civil al iniciar el posgrado",
    );

    validateOtroEspecifique(
      ctx,
      data.estadoCivilConclusionOtro,
      data.estadoCivilConclusion === "OTRO",
      ["estadoCivilConclusionOtro"],
      "el estado civil al concluir el posgrado",
    );
  });

export type Posgrado = z.infer<typeof posgradoSchema>;
