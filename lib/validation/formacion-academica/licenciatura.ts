// @/lib/validations/formacion-academica/licenciatura.ts
//
// Sección "Licenciatura" del JSON de especificación (entity: licenciatura).
// NOTA: `afiliadoId` se omite a propósito; debe asignarse en el backend a
// partir de la sesión autenticada, nunca confiar en un valor enviado por el cliente.

import { z } from "zod";
import {
  anioAcademicoOpcionalSchema,
  anioAcademicoSchema,
  required,
  validateConditionalField,
  validateRangoAnios,
} from "./common";

export const licenciaturaSchema = z
  .object({
    id: z.uuid().optional(), // ausente al crear, presente al editar
    institucionId: required(z.uuid(), "Selecciona una institución válida."),
    programa: z.string().min(1, "El programa es requerido."),
    disciplina: z.string().min(1, "La disciplina es requerida."),

    anioIngreso: anioAcademicoOpcionalSchema, // required: false
    anioEgreso: anioAcademicoSchema, // required: true

    // Se separa egreso de titulación porque egresar no implica haber obtenido el título.
    tieneTitulo: z.boolean().nullish(), // required: false
    anioTitulacion: anioAcademicoOpcionalSchema, // visible_when tiene_titulo = true
    motivoNoTitulacion: z.string().nullish(), // visible_when tiene_titulo = false
  })
  .superRefine((data, ctx) => {
    // cross_entity_validation_rules: anio_egreso >= anio_ingreso
    validateRangoAnios(
      ctx,
      data.anioIngreso,
      data.anioEgreso,
      ["anioEgreso"],
      "El año de egreso debe ser mayor o igual al año de ingreso.",
    );

    // visible_when tiene_titulo = true
    validateConditionalField(
      ctx,
      data.anioTitulacion,
      data.tieneTitulo === true,
      ["anioTitulacion"],
      "El año de titulación",
      { requiredWhenVisible: true }
    );

    // cross_entity_validation_rules: anio_titulacion >= anio_egreso
    if (data.tieneTitulo === true) {
      validateRangoAnios(
        ctx,
        data.anioEgreso,
        data.anioTitulacion,
        ["anioTitulacion"],
        "El año de titulación debe ser mayor o igual al año de egreso.",
      );
    }

    // visible_when tiene_titulo = false
    validateConditionalField(
      ctx,
      data.motivoNoTitulacion,
      data.tieneTitulo === false,
      ["motivoNoTitulacion"],
      "El motivo por el que no ha obtenido el título",
      { requiredWhenVisible: true }
    );
  });

export type Licenciatura = z.infer<typeof licenciaturaSchema>;
