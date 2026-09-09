// @/components/formacion-academica/formacion-academica-form.tsx
//
// Formulario completo de "Formación Académica". Usa un único useForm con el
// esquema combinado `formacionAcademicaSchema`, y un useFieldArray por cada
// sección repetible (licenciaturas, posgrados, estanciasPosdoctorales).
//
// El envío a un endpoint real queda pendiente a propósito (ver `handleSubmit`
// más abajo); por defecto solo hace console.log del payload ya validado.

"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FormacionAcademicaInput,
  FormacionAcademicaOutput,
  formacionAcademicaSchema,
  type FormacionAcademica,
} from "@/lib/validation/formacion-academica";
import { LicenciaturaFields } from "./licenciatura-fields";
import { PosgradoFields } from "./posgrado-fields";
import { ResumenPosgradoFields } from "./resumen-posgrado-fields";
import { EstanciaPosdoctoralFields } from "./estancia-posdoctoral-fields";
import type { Institucion } from "./shared";

export type { Institucion };

// ---------------------------------------------------------------------------
// Filas vacías para cuando el usuario agrega una nueva entrada.
// data_model_notes: "El formulario puede comenzar mostrando una sola
// instancia de cada tipo, pero el modelo de datos debe permitir agregar más
// de una." Los campos requeridos quedan en null/"" hasta que el usuario los
// completa; zodResolver los marcará como error solo si se intenta enviar así
// (por eso el cast: son intencionalmente "inválidos" hasta que se completen).
// ---------------------------------------------------------------------------

const emptyLicenciatura = {
  institucionId: "",
  programa: "",
  disciplina: "",
  anioIngreso: null,
  anioEgreso: null,
  tieneTitulo: null,
  anioTitulacion: null,
  motivoNoTitulacion: null,
} as unknown as FormacionAcademica["licenciaturas"][number];

const emptyPosgrado = {
  tipoPosgrado: null,
  trayectoriaPosgrado: null,
  institucionId: "",
  programa: "",
  disciplina: "",
  lineaInvestigacion: null,
  motivosEleccionInstitucion: {
    filas: {
      prestigio_academico: null,
      proximidad_domicilio: null,
      posgrado_interes: null,
      beca_academica: null,
    },
    otros: [],
  },
  anioIngreso: null,
  anioEgreso: null,
  actualmenteCursa: false,
  modalidad: null,
  modalidadOtra: null,
  dedicacion: null,
  becado: null,
  fuentesFinanciamiento: null,
  fuentesFinanciamientoOtro: null,
  tieneGrado: null,
  anioObtencionGrado: null,
  mesesObtencionGrado: null,
  motivoNoObtencionGrado: null,
  motivoNoObtencionGradoOtro: null,
  estadoCivilInicio: null,
  estadoCivilInicioOtro: null,
  estadoCivilConclusion: null,
  estadoCivilConclusionOtro: null,
} as unknown as FormacionAcademica["posgrados"][number];

const emptyEstanciaPosdoctoral = {
  situacion: null,
  institucionId: null,
  programa: null,
  campoInvestigacion: null,
  campoInvestigacionOtro: null,
  lineaInvestigacion: null,
  anioInicio: null,
  anioFin: null,
  recibioApoyoEconomico: null,
  fuentesFinanciamiento: null,
  fuentesFinanciamientoOtro: null,
} as unknown as FormacionAcademica["estanciasPosdoctorales"][number];

function buildDefaultValues(
  initial?: Partial<FormacionAcademicaOutput>,
): FormacionAcademicaInput {
  return {
    licenciaturas: initial?.licenciaturas?.length
      ? initial.licenciaturas
      : [emptyLicenciatura],

    posgrados: initial?.posgrados?.length ? initial.posgrados : [emptyPosgrado],

    resumenPosgrado: initial?.resumenPosgrado ?? {
      programasPosgradoCursados: [],
      trayectoriaMaestriaDoctoradoIntegrada: null,
    },

    estanciasPosdoctorales: initial?.estanciasPosdoctorales?.length
      ? initial.estanciasPosdoctorales
      : [emptyEstanciaPosdoctoral],
  };
}

export type FormacionAcademicaFormProps = {
  /** Catálogo de instituciones para los campos tipo "catalog". */
  instituciones: Institucion[];
  /** Valores existentes, para editar un perfil ya capturado. */
  defaultValues?: Partial<FormacionAcademica>;
  /** Si no se provee, el formulario solo hace console.log del payload validado. */
  onSubmit?: (data: FormacionAcademica) => Promise<void> | void;
};

export function FormacionAcademicaForm({
  instituciones,
  defaultValues,
  onSubmit,
}: FormacionAcademicaFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<
    FormacionAcademicaInput,
    undefined,
    FormacionAcademicaOutput
  >({
    resolver: zodResolver(formacionAcademicaSchema),
    defaultValues: buildDefaultValues(defaultValues),
    mode: "onBlur",
  });

  const licenciaturas = useFieldArray({
    control: form.control,
    name: "licenciaturas",
  });
  const posgrados = useFieldArray({ control: form.control, name: "posgrados" });
  const estancias = useFieldArray({
    control: form.control,
    name: "estanciasPosdoctorales",
  });

  async function handleSubmit(values: FormacionAcademicaOutput) {
    setSubmitError(null);
    try {
      if (onSubmit) {
        await onSubmit(values);
        return;
      }
      // TODO: reemplazar por la llamada real al endpoint, por ejemplo:
      // const res = await fetch("/api/afiliados/formacion-academica", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(values),
      // });
      // if (!res.ok) throw new Error("request failed");
      console.log("Formación académica (endpoint pendiente):", values);
    } catch {
      setSubmitError("No se pudo guardar la información. Intenta de nuevo.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Tabs defaultValue="licenciatura">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="licenciatura">Licenciatura</TabsTrigger>
          <TabsTrigger value="posgrado">Posgrado</TabsTrigger>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="posdoctorado">Posdoctorado</TabsTrigger>
        </TabsList>

        <TabsContent value="licenciatura" className="space-y-4 pt-4">
          {licenciaturas.fields.map((field, index) => (
            <LicenciaturaFields
              key={field.id}
              control={form.control}
              setValue={form.setValue}
              index={index}
              instituciones={instituciones}
              onRemove={() => licenciaturas.remove(index)}
              removable={licenciaturas.fields.length > 1}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => licenciaturas.append(emptyLicenciatura)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar licenciatura
          </Button>
        </TabsContent>

        <TabsContent value="posgrado" className="space-y-4 pt-4">
          {posgrados.fields.map((field, index) => (
            <PosgradoFields
              key={field.id}
              control={form.control}
              setValue={form.setValue}
              index={index}
              instituciones={instituciones}
              onRemove={() => posgrados.remove(index)}
              removable={posgrados.fields.length > 1}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => posgrados.append(emptyPosgrado)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar posgrado
          </Button>
        </TabsContent>

        <TabsContent value="resumen" className="space-y-4 pt-4">
          <ResumenPosgradoFields control={form.control} />
        </TabsContent>

        <TabsContent value="posdoctorado" className="space-y-4 pt-4">
          {estancias.fields.map((field, index) => (
            <EstanciaPosdoctoralFields
              key={field.id}
              control={form.control}
              setValue={form.setValue}
              index={index}
              instituciones={instituciones}
              onRemove={() => estancias.remove(index)}
              removable={estancias.fields.length > 1}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => estancias.append(emptyEstanciaPosdoctoral)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar estancia posdoctoral
          </Button>
        </TabsContent>
      </Tabs>

      {submitError ? (
        <p className="text-sm text-destructive">{submitError}</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Guardando..."
            : "Guardar formación académica"}
        </Button>
      </div>
    </form>
  );
}
