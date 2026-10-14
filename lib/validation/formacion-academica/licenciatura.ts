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
 anioTitulacion: anioAcademicoSchema,
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
 validateRangoAnios(
 ctx,
 data.anioEgreso,
 data.anioTitulacion,
 ["anioTitulacion"],
 "El año de titulación debe ser mayor o igual al año de egreso.",
 );
 });

export type Licenciatura = z.infer<typeof licenciaturaSchema>;
