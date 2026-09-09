// @/components/formacion-academica/estancia-posdoctoral-fields.tsx
//
// Sección "Posdoctorado / Estancias posdoctorales" del JSON de especificación.

//

"use client";

import { Trash2 } from "lucide-react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  FormacionAcademica,
  FormacionAcademicaInput,
} from "@/lib/validation/formacion-academica/";
import {
  AnioFormField,
  CheckboxGroupField,
  InstitucionFormField,
  RadioEnumField,
  TextFormField,
  YesNoField,
  type Institucion,
} from "./shared";

const SITUACION_OPTIONS = [
  { value: "CONCLUIDA", label: "Sí, ya concluí una estancia posdoctoral" },
  { value: "ACTUAL", label: "Sí, actualmente curso una estancia posdoctoral" },
  {
    value: "INTERES_FUTURO",
    label: "No, pero tengo interés en realizarla en un futuro",
  },
  { value: "SIN_INTERES", label: "No, y no tengo interés en realizarla" },
];

const CAMPO_INVESTIGACION_OPTIONS = [
  {
    value: "CIENCIAS_SOCIALES_HUMANIDADES",
    label: "Ciencias sociales y humanidades",
  },
  {
    value: "CIENCIAS_NATURALES_EXACTAS",
    label: "Ciencias naturales y exactas",
  },
  {
    value: "INGENIERIA_TECNOLOGIA",
    label: "Ciencias de la ingeniería y tecnología",
  },
  { value: "CIENCIAS_AGROPECUARIAS", label: "Ciencias agropecuarias" },
  { value: "EDUCACION", label: "Educación" },
  { value: "OTRO", label: "Otro" },
];

const FUENTE_FINANCIAMIENTO_POSDOCTORADO_OPTIONS = [
  { value: "BECA_NACIONAL", label: "Beca nacional" },
  { value: "BECA_INTERNACIONAL", label: "Beca internacional" },
  { value: "APOYO_INSTITUCIONAL", label: "Apoyo institucional" },
  {
    value: "PROYECTO_INVESTIGACION",
    label: "Apoyo de proyecto de investigación",
  },
  { value: "OTRO", label: "Otro" },
];

const SITUACIONES_CON_DETALLE = new Set(["CONCLUIDA", "ACTUAL"]);

type EstanciaPosdoctoralFieldsProps = {
  control: Control<FormacionAcademicaInput>;
  setValue: UseFormSetValue<FormacionAcademicaInput>;
  index: number;
  instituciones: Institucion[];
  onRemove: () => void;
  removable: boolean;
};

export function EstanciaPosdoctoralFields({
  control,
  setValue,
  index,
  instituciones,
  onRemove,
  removable,
}: EstanciaPosdoctoralFieldsProps) {
  const row = useWatch({ control, name: `estanciasPosdoctorales.${index}` }) as
    | FormacionAcademica["estanciasPosdoctorales"][number]
    | undefined;

  const path = `estanciasPosdoctorales.${index}` as const;
  const conDetalle = row?.situacion
    ? SITUACIONES_CON_DETALLE.has(row.situacion)
    : false;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-4">
        <CardTitle className="text-sm font-medium">
          Estancia posdoctoral {index + 1}
        </CardTitle>
        {removable ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 className="mr-1 h-4 w-4" />
            Quitar
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5">
        <RadioEnumField
          control={control}
          name={`${path}.situacion`}
          label="Situación de la estancia posdoctoral"
          layout="column"
          options={SITUACION_OPTIONS}
          onChangeExtra={(situacion) => {
            // Los siguientes campos solo aplican cuando situacion in (CONCLUIDA, ACTUAL)
            if (!SITUACIONES_CON_DETALLE.has(situacion)) {
              setValue(`${path}.institucionId`, null);
              setValue(`${path}.programa`, null);
              setValue(`${path}.campoInvestigacion`, null);
              setValue(`${path}.campoInvestigacionOtro`, null);
              setValue(`${path}.lineaInvestigacion`, null);
              setValue(`${path}.anioInicio`, null);
              setValue(`${path}.anioFin`, null);
              setValue(`${path}.recibioApoyoEconomico`, null);
              setValue(`${path}.fuentesFinanciamiento`, null);
              setValue(`${path}.fuentesFinanciamientoOtro`, null);
            }
            // anio_fin solo aplica cuando situacion = CONCLUIDA (ni siquiera con ACTUAL)
            if (situacion !== "CONCLUIDA") setValue(`${path}.anioFin`, null);
          }}
        />

        {conDetalle ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <InstitucionFormField
                control={control}
                name={`${path}.institucionId`}
                label="Institución donde realizó o realiza su estancia posdoctoral"
                instituciones={instituciones}
              />
              <TextFormField
                control={control}
                name={`${path}.programa`}
                label="Nombre del programa, estancia o proyecto"
                description="Útil si tuvo más de una estancia en la misma institución"
              />
            </div>

            <RadioEnumField
              control={control}
              name={`${path}.campoInvestigacion`}
              label="Campo de investigación, área o disciplina"
              layout="column"
              options={CAMPO_INVESTIGACION_OPTIONS}
              onChangeExtra={(v) => {
                if (v !== "OTRO")
                  setValue(`${path}.campoInvestigacionOtro`, null);
              }}
            />
            {row?.campoInvestigacion === "OTRO" ? (
              <TextFormField
                control={control}
                name={`${path}.campoInvestigacionOtro`}
                label="Especifique otro campo de investigación"
              />
            ) : null}

            <TextFormField
              control={control}
              name={`${path}.lineaInvestigacion`}
              label="Línea de investigación del posdoctorado"
            />

            <div className="grid grid-cols-2 gap-4">
              <AnioFormField
                control={control}
                name={`${path}.anioInicio`}
                label="Año de inicio"
              />
              {row?.situacion === "CONCLUIDA" ? (
                <AnioFormField
                  control={control}
                  name={`${path}.anioFin`}
                  label="Año de conclusión"
                />
              ) : null}
            </div>

            <YesNoField
              control={control}
              name={`${path}.recibioApoyoEconomico`}
              label="¿Recibió o recibe apoyo económico para su posdoctorado?"
              onChangeExtra={(recibio) => {
                if (!recibio) {
                  setValue(`${path}.fuentesFinanciamiento`, null);
                  setValue(`${path}.fuentesFinanciamientoOtro`, null);
                }
              }}
            />

            {row?.recibioApoyoEconomico === true ? (
              <>
                <CheckboxGroupField
                  control={control}
                  name={`${path}.fuentesFinanciamiento`}
                  label="Fuente o fuentes del apoyo económico"
                  options={FUENTE_FINANCIAMIENTO_POSDOCTORADO_OPTIONS}
                  onChangeExtra={(values) => {
                    if (!values.includes("OTRO"))
                      setValue(`${path}.fuentesFinanciamientoOtro`, null);
                  }}
                />
                {row?.fuentesFinanciamiento?.includes("OTRO") ? (
                  <TextFormField
                    control={control}
                    name={`${path}.fuentesFinanciamientoOtro`}
                    label="Especifique otra fuente de financiamiento"
                  />
                ) : null}
              </>
            ) : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
