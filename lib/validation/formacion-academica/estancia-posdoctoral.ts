// @/lib/validations/formacion-academica/estancia-posdoctoral.ts
//
// Sección "Posdoctorado / Estancias posdoctorales" (entity: estancia_posdoctoral).

import { z } from "zod";
import {
  campoInvestigacionPosdoctoradoEnum,
  fuenteFinanciamientoPosdoctoradoEnum,
  situacionPosdoctoradoEnum,
} from "@/lib/db/schema/formacion-academica";
import {
  anioAcademicoOpcionalSchema,
  required,
  validateConditionalField,
  validateOtroEspecifique,
  validateRangoAnios,
} from "./common";

const SITUACIONES_CON_DETALLE = ["CONCLUIDA", "ACTUAL"] as const;

export const estanciaPosdoctoralSchema = z
  .object({
    id: z.uuid().optional(),
    situacion: z.enum(situacionPosdoctoradoEnum.enumValues),

    // Los siguientes campos solo aplican cuando situacion in (CONCLUIDA, ACTUAL)
    institucionId: z.uuid().nullish(),
    programa: z.string().nullish(),
    campoInvestigacion: z
      .enum(campoInvestigacionPosdoctoradoEnum.enumValues)
      .nullish(),
    campoInvestigacionOtro: z.string().nullish(), // visible_when campo_investigacion = OTRO
    lineaInvestigacion: z.string().nullish(),
    anioInicio: anioAcademicoOpcionalSchema,
    anioFin: anioAcademicoOpcionalSchema, // visible_when situacion = CONCLUIDA

    recibioApoyoEconomico: z.boolean().nullish(),
    fuentesFinanciamiento: z
      .array(z.enum(fuenteFinanciamientoPosdoctoradoEnum.enumValues))
      .nullish(), // visible_when recibio_apoyo_economico = true
    fuentesFinanciamientoOtro: z.string().nullish(), // visible_when fuentes_financiamiento contiene OTRO
  })
  .superRefine((data, ctx) => {
    const conDetalle = (SITUACIONES_CON_DETALLE as readonly string[]).includes(
      data.situacion,
    );

    // Campos visibles solo cuando situacion in [CONCLUIDA, ACTUAL]
    validateConditionalField(
      ctx,
      data.institucionId,
      conDetalle,
      ["institucionId"],
      "La institución",
      { requiredWhenVisible: true },
    );
    validateConditionalField(
      ctx,
      data.programa,
      conDetalle,
      ["programa"],
      "El programa o proyecto",
      { requiredWhenVisible: true },
    );
    validateConditionalField(
      ctx,
      data.campoInvestigacion,
      conDetalle,
      ["campoInvestigacion"],
      "El campo de investigación",
      { requiredWhenVisible: true },
    );
    validateConditionalField(
      ctx,
      data.lineaInvestigacion,
      conDetalle,
      ["lineaInvestigacion"],
      "La línea de investigación",
    );
    validateConditionalField(
      ctx,
      data.anioInicio,
      conDetalle,
      ["anioInicio"],
      "El año de inicio",
      { requiredWhenVisible: true },
    );
    validateConditionalField(
      ctx,
      data.recibioApoyoEconomico,
      conDetalle,
      ["recibioApoyoEconomico"],
      "El apoyo económico",
      { requiredWhenVisible: true },
      true,
    );

    // campo_investigacion_otro visible_when campo_investigacion = OTRO
    validateOtroEspecifique(
      ctx,
      data.campoInvestigacionOtro,
      data.campoInvestigacion === "OTRO",
      ["campoInvestigacionOtro"],
      "el campo de investigación",
    );

    // cross_entity_validation_rules: situacion = ACTUAL => anio_fin is null
    // (anio_fin solo es visible cuando situacion = CONCLUIDA, lo cual ya cubre ACTUAL)
    validateConditionalField(
      ctx,
      data.anioFin,
      data.situacion === "CONCLUIDA",
      ["anioFin"],
      "El año de conclusión",
    );

    // cross_entity_validation_rules: anio_fin >= anio_inicio
    validateRangoAnios(
      ctx,
      data.anioInicio,
      data.anioFin,
      ["anioFin"],
      "El año de conclusión debe ser mayor o igual al año de inicio.",
    );

    // cross_entity_validation_rules: recibio_apoyo_economico = false => fuentes_financiamiento is empty
    validateConditionalField(
      ctx,
      data.fuentesFinanciamiento,
      data.recibioApoyoEconomico === true,
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
  });

export type EstanciaPosdoctoral = z.infer<typeof estanciaPosdoctoralSchema>;
