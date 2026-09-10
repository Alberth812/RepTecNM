// @/components/formacion-academica/posgrado-fields.tsx
//
// Sección "Posgrados" del JSON de especificación. Cubre maestría y doctorado
// (distinguidos por tipoPosgrado) y la matriz "motivos_eleccion_institucion".

"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useFieldArray, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type {
  FormacionAcademica,
  FormacionAcademicaInput,
} from "@/lib/validation/formacion-academica";
import {
  AnioFormField,
  CheckboxGroupField,
  InstitucionFormField,
  NumberFormField,
  RadioEnumField,
  RatingSelectField,
  TextFormField,
  YesNoField,
  type Institucion,
} from "./shared";

// Sección "Posgrados" -> opciones de radio/checkbox (valores estables, iguales a los enums de Drizzle)
const TIPO_POSGRADO_OPTIONS = [
  { value: "MAESTRIA", label: "Maestría" },
  { value: "DOCTORADO", label: "Doctorado" },
];

const TRAYECTORIA_POSGRADO_OPTIONS = [
  { value: "INDEPENDIENTE", label: "Programa independiente" },
  {
    value: "INTEGRADA_MAESTRIA_DOCTORADO",
    label: "Parte de una trayectoria integrada de Maestría y Doctorado",
  },
];

const MODALIDAD_OPTIONS = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "EN_LINEA", label: "En línea" },
  { value: "HIBRIDA", label: "Híbrida" },
  { value: "OTRA", label: "Otra" },
];

const DEDICACION_OPTIONS = [
  { value: "TIEMPO_COMPLETO", label: "Tiempo completo" },
  { value: "MEDIO_TIEMPO", label: "Medio tiempo" },
  { value: "TIEMPO_PARCIAL", label: "Tiempo parcial" },
];

const FUENTE_FINANCIAMIENTO_POSGRADO_OPTIONS = [
  { value: "CONAHCYT", label: "CONAHCYT u organismo equivalente" },
  { value: "INSTITUCION_LABORA", label: "La institución donde labora" },
  { value: "PRODEP", label: "PRODEP" },
  {
    value: "INSTITUCION_POSGRADO",
    label: "La institución donde cursó el posgrado",
  },
  { value: "OTRO", label: "Otro" },
];

const MOTIVO_NO_OBTENCION_GRADO_OPTIONS = [
  { value: "EN_PROCESO", label: "En proceso de titulación o graduación" },
  { value: "TESIS_PENDIENTE", label: "Tesis o trabajo de grado pendiente" },
  { value: "EXAMEN_PENDIENTE", label: "Examen o defensa pendiente" },
  { value: "TRAMITE_NO_REALIZADO", label: "No ha realizado el trámite" },
  { value: "OTRO", label: "Otro" },
];

const ESTADO_CIVIL_OPTIONS = [
  { value: "SOLTERO", label: "Soltero(a)" },
  { value: "CASADO", label: "Casado(a)" },
  { value: "UNION_LIBRE", label: "Unión Libre" },
  { value: "OTRO", label: "Otro" },
];

const MOTIVOS_FIJOS: {
  key:
    | "prestigio_academico"
    | "proximidad_domicilio"
    | "posgrado_interes"
    | "beca_academica";
  label: string;
}[] = [
  { key: "prestigio_academico", label: "Prestigio académico" },
  { key: "proximidad_domicilio", label: "Proximidad con su domicilio" },
  {
    key: "posgrado_interes",
    label: "Porque cuenta con el posgrado de interés",
  },
  { key: "beca_academica", label: "Porque cuenta con beca académica" },
];

function MotivosEleccionInstitucionFields({
  control,
  index,
}: {
  control: Control<FormacionAcademicaInput>;
  index: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `posgrados.${index}.motivosEleccionInstitucion.otros`,
  });

  return (
    <div className="space-y-3 rounded-md border p-3">
      <p className="text-sm font-medium">
        Motivos por los que eligió esta institución{" "}
        <span className="font-normal text-muted-foreground">
          (1 = menor importancia, 5 = mayor importancia)
        </span>
      </p>

      <div className="space-y-2">
        {MOTIVOS_FIJOS.map((motivo) => (
          <RatingSelectField
            key={motivo.key}
            control={control}
            name={`posgrados.${index}.motivosEleccionInstitucion.filas.${motivo.key}`}
            label={motivo.label}
          />
        ))}
      </div>

      {fields.length > 0 ? <Separator /> : null}

      <div className="space-y-3">
        {fields.map((otroField, otroIndex) => (
          <div key={otroField.id} className="flex items-end gap-2">
            <div className="flex-1">
              <TextFormField
                control={control}
                name={`posgrados.${index}.motivosEleccionInstitucion.otros.${otroIndex}.motivo`}
                label={
                  otroIndex === 0
                    ? "Otro motivo"
                    : `Otro motivo ${otroIndex + 1}`
                }
                placeholder="Describe el motivo"
              />
            </div>
            <RatingSelectField
              control={control}
              name={`posgrados.${index}.motivosEleccionInstitucion.otros.${otroIndex}.calificacion`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mb-2"
              onClick={() => remove(otroIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ motivo: "", calificacion: 3 })}
        >
          <Plus className="mr-1 h-4 w-4" />
          Agregar otro motivo
        </Button>
      </div>
    </div>
  );
}

type PosgradoFieldsProps = {
  control: Control<FormacionAcademicaInput>;
  setValue: UseFormSetValue<FormacionAcademicaInput>;
  index: number;
  instituciones: Institucion[];
  onRemove: () => void;
  removable: boolean;
};

export function PosgradoFields({
  control,
  setValue,
  index,
  instituciones,
  onRemove,
  removable,
}: PosgradoFieldsProps) {
  const row = useWatch({ control, name: `posgrados.${index}` }) as
    | FormacionAcademica["posgrados"][number]
    | undefined;

  const path = `posgrados.${index}` as const;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-4">
        <CardTitle className="text-sm font-medium">
          Posgrado {index + 1}
          {row?.tipoPosgrado
            ? ` — ${row.tipoPosgrado === "DOCTORADO" ? "Doctorado" : "Maestría"}`
            : ""}
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
          name={`${path}.tipoPosgrado`}
          label="Tipo de posgrado"
          options={TIPO_POSGRADO_OPTIONS}
          onChangeExtra={(tipo) => {
            // trayectoria_posgrado visible_when tipo_posgrado = DOCTORADO
            if (tipo !== "DOCTORADO")
              setValue(`${path}.trayectoriaPosgrado`, null);
          }}
        />

        {row?.tipoPosgrado === "DOCTORADO" ? (
          <RadioEnumField
            control={control}
            name={`${path}.trayectoriaPosgrado`}
            label="Relación de la trayectoria de posgrado"
            layout="column"
            options={TRAYECTORIA_POSGRADO_OPTIONS}
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <InstitucionFormField
            control={control}
            name={`${path}.institucionId`}
            label="Institución donde cursó el posgrado"
            instituciones={instituciones}
          />
          <TextFormField
            control={control}
            name={`${path}.programa`}
            label="Nombre del programa"
            placeholder="Ej. Doctorado en Ciencias de la Ingeniería"
          />
          <TextFormField
            control={control}
            name={`${path}.disciplina`}
            label="Disciplina o área"
          />
          <TextFormField
            control={control}
            name={`${path}.lineaInvestigacion`}
            label="Línea de investigación"
            description="Opcional"
          />
        </div>

        <MotivosEleccionInstitucionFields control={control} index={index} />

        <YesNoField
          control={control}
          name={`${path}.actualmenteCursa`}
          label="¿Actualmente cursa este posgrado?"
          onChangeExtra={(actualmenteCursa) => {
            // actualmente_cursa = true => anio_egreso is null
            if (actualmenteCursa) setValue(`${path}.anioEgreso`, null);
          }}
        />

        <div className="grid grid-cols-2 gap-4">
          <AnioFormField
            control={control}
            name={`${path}.anioIngreso`}
            label="Año de ingreso"
          />

          {row?.actualmenteCursa === false && (
            <AnioFormField
              control={control}
              name={`${path}.anioEgreso`}
              label="Año de egreso o conclusión de créditos"
            />
          )}
        </div>

        <RadioEnumField
          control={control}
          name={`${path}.modalidad`}
          label="Modalidad en que cursó o cursa el posgrado"
          options={MODALIDAD_OPTIONS}
          onChangeExtra={(modalidad) => {
            if (modalidad !== "OTRA") setValue(`${path}.modalidadOtra`, null);
          }}
        />
        {row?.modalidad === "OTRA" ? (
          <TextFormField
            control={control}
            name={`${path}.modalidadOtra`}
            label="Especifique la modalidad"
          />
        ) : null}

        <RadioEnumField
          control={control}
          name={`${path}.dedicacion`}
          label="Tiempo de dedicación al posgrado"
          options={DEDICACION_OPTIONS}
        />

        <YesNoField
          control={control}
          name={`${path}.becado`}
          label="¿Estuvo o está becado?"
          onChangeExtra={(becado) => {
            if (!becado) {
              setValue(`${path}.fuentesFinanciamiento`, null);
              setValue(`${path}.fuentesFinanciamientoOtro`, null);
            }
          }}
        />
        {row?.becado === true ? (
          <>
            <CheckboxGroupField
              control={control}
              name={`${path}.fuentesFinanciamiento`}
              label="Institución u organismo que otorgó la beca o apoyo económico"
              options={FUENTE_FINANCIAMIENTO_POSGRADO_OPTIONS}
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

        <YesNoField
          control={control}
          name={`${path}.tieneGrado`}
          label="¿Tiene el grado?"
          onChangeExtra={(tieneGrado) => {
            if (tieneGrado) {
              setValue(`${path}.motivoNoObtencionGrado`, null);
              setValue(`${path}.motivoNoObtencionGradoOtro`, null);
            } else {
              setValue(`${path}.anioObtencionGrado`, null);
              setValue(`${path}.mesesObtencionGrado`, null);
            }
          }}
        />

        {row?.tieneGrado === true ? (
          <div className="grid grid-cols-2 gap-4">
            <AnioFormField
              control={control}
              name={`${path}.anioObtencionGrado`}
              label="Año de obtención del grado"
            />
            <NumberFormField
              control={control}
              name={`${path}.mesesObtencionGrado`}
              label="Meses para obtener el grado tras concluir créditos"
            />
          </div>
        ) : null}

        {row?.tieneGrado === false ? (
          <>
            <RadioEnumField
              control={control}
              name={`${path}.motivoNoObtencionGrado`}
              label="Motivo por el que no ha obtenido el grado"
              layout="column"
              options={MOTIVO_NO_OBTENCION_GRADO_OPTIONS}
              onChangeExtra={(motivo) => {
                if (motivo !== "OTRO")
                  setValue(`${path}.motivoNoObtencionGradoOtro`, null);
              }}
            />
            {row?.motivoNoObtencionGrado === "OTRO" ? (
              <TextFormField
                control={control}
                name={`${path}.motivoNoObtencionGradoOtro`}
                label="Especifique el motivo"
              />
            ) : null}
          </>
        ) : null}

        <Separator />

        <RadioEnumField
          control={control}
          name={`${path}.estadoCivilInicio`}
          label="Estado civil al iniciar el posgrado"
          options={ESTADO_CIVIL_OPTIONS}
          onChangeExtra={(v) => {
            if (v !== "OTRO") setValue(`${path}.estadoCivilInicioOtro`, null);
          }}
        />
        {row?.estadoCivilInicio === "OTRO" ? (
          <TextFormField
            control={control}
            name={`${path}.estadoCivilInicioOtro`}
            label="Especifique otro estado civil al iniciar el posgrado"
          />
        ) : null}

        <RadioEnumField
          control={control}
          name={`${path}.estadoCivilConclusion`}
          label="Estado civil al concluir el posgrado"
          description="Puede dejarse vacío si aún no concluye"
          options={ESTADO_CIVIL_OPTIONS}
          onChangeExtra={(v) => {
            if (v !== "OTRO")
              setValue(`${path}.estadoCivilConclusionOtro`, null);
          }}
        />
        {row?.estadoCivilConclusion === "OTRO" ? (
          <TextFormField
            control={control}
            name={`${path}.estadoCivilConclusionOtro`}
            label="Especifique otro estado civil al concluir el posgrado"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
