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
// Sección "Posgrados" -> campo motivos_eleccion_institucion (scale_matrix_with_custom_rows)
// Filas fijas como propiedades estructuradas + motivos personalizados con su propia calificación.
export const motivoEleccionInstitucionSchema = z.object({
  filas: z.object({
    prestigio_academico: z.number().int().min(1).max(5),
    proximidad_domicilio: z.number().int().min(1).max(5),
    posgrado_interes: z.number().int().min(1).max(5),
    beca_academica: z.number().int().min(1).max(5),
  }),
  otros: z
    .array(
      z.object({
        motivo: z
          .string()
          .min(1, "El motivo personalizado no puede estar vacío."),
        calificacion: z.number().int().min(1).max(5),
      }),
    )
    .optional(),
});

export const posgradoSchema = z
  .object({
    id: z.uuid().optional(),

    tipoPosgrado: z.enum(tipoPosgradoEnum.enumValues),
    // Conserva la semántica de "Maestría y Doctorado" sin forzar una entidad única.
    trayectoriaPosgrado: z.enum(trayectoriaPosgradoEnum.enumValues).nullish(), // visible_when tipo_posgrado = DOCTORADO

    institucionId: z.uuid({ message: "Selecciona una institución válida." }),
    programa: z.string().min(1, "El programa es requerido."),
    disciplina: z.string().min(1, "La disciplina es requerida."),
    lineaInvestigacion: z.string().nullish(),

    motivosEleccionInstitucion: motivoEleccionInstitucionSchema,

    anioIngreso: anioAcademicoSchema, // required: true
    anioEgreso: anioAcademicoOpcionalSchema, // required: false, puede faltar si actualmente_cursa
    actualmenteCursa: z.boolean(),

    modalidad: z.enum(modalidadPosgradoEnum.enumValues).nullish(),
    modalidadOtra: z.string().nullish(), // visible_when modalidad = OTRA

    dedicacion: z.enum(dedicacionPosgradoEnum.enumValues).nullish(),

    becado: z.boolean().nullish(),
    fuentesFinanciamiento: z
      .array(z.enum(fuenteFinanciamientoPosgradoEnum.enumValues))
      .nullish(), // visible_when becado = true
    fuentesFinanciamientoOtro: z.string().nullish(), // visible_when fuentes_financiamiento contiene OTRO

    tieneGrado: z.boolean().nullish(),
    anioObtencionGrado: anioAcademicoOpcionalSchema, // visible_when tiene_grado = true
    mesesObtencionGrado: z
      .number()
      .int()
      .min(0, "Debe ser un entero no negativo.")
      .nullish(), // visible_when tiene_grado = true

    motivoNoObtencionGrado: z
      .enum(motivoNoObtencionGradoEnum.enumValues)
      .nullish(), // visible_when tiene_grado = false
    motivoNoObtencionGradoOtro: z.string().nullish(), // visible_when motivo_no_obtencion_grado = OTRO

    // Datos históricos conservados por compatibilidad con el formulario original.
    estadoCivilInicio: z.enum(estadoCivilEnum.enumValues),
    estadoCivilInicioOtro: z.string().nullish(), // visible_when estado_civil_inicio = OTRO
    estadoCivilConclusion: z.enum(estadoCivilEnum.enumValues).nullish(),
    estadoCivilConclusionOtro: z.string().nullish(), // visible_when estado_civil_conclusion = OTRO
  })
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
