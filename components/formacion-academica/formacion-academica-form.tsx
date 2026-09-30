// @/components/formacion-academica/formacion-academica-form.tsx
//
// Formulario completo de "Formación Académica". Usa un único useForm con el
// esquema combinado `formacionAcademicaSchema`, y un useFieldArray por cada
// sección repetible (licenciaturas, posgrados, estanciasPosdoctorales).
//
// El envío a un endpoint real queda pendiente a propósito (ver `handleSubmit`
// m�s abajo); por defecto solo hace console.log del payload ya validado.

"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useFieldArray, useForm } from "react-hook-form";
import { AlertCircle, Plus } from "lucide-react";
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
import { EstanciaPosdoctoralFields } from "./estancia-posdoctoral-fields";
import type { Institucion } from "./shared";
import { cn } from "@/lib/utils";

export type { Institucion };

// ---------------------------------------------------------------------------
// Filas vacías para cuando el usuario agrega una nueva entrada.
// data_model_notes: "El formulario puede comenzar mostrando una sola
// instancia de cada tipo, pero el modelo de datos debe permitir agregar m�s
// de una." Los campos requeridos quedan en null/"" hasta que el usuario los
// completa; zodResolver los marcar� como error solo si se intenta enviar así
// (por eso el cast: son intencionalmente "inv�lidos" hasta que se completen).
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
};

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
  actualmenteCursa: null,
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

    estanciasPosdoctorales: initial?.estanciasPosdoctorales?.length
      ? initial.estanciasPosdoctorales
      : [emptyEstanciaPosdoctoral],
  };
}

export type FormacionAcademicaFormProps = {
  /** Cat�logo de instituciones para los campos tipo "catalog". */
  instituciones: Institucion[];
  /** Valores existentes, para editar un perfil ya capturado. */
  defaultValues?: Partial<FormacionAcademica>;
  /** Si no se provee, el formulario solo hace console.log del payload validado. */
  onSubmit?: (data: FormacionAcademica) => Promise<void> | void;
};

type TabValue = "licenciatura" | "posgrado" | "posdoctorado";

const SECTION_BY_TAB: Record<TabValue, keyof FormacionAcademicaInput> = {
  licenciatura: "licenciaturas",
  posgrado: "posgrados",
  posdoctorado: "estanciasPosdoctorales",
};

export function FormacionAcademicaForm({
  instituciones,
  defaultValues,
  onSubmit,
}: FormacionAcademicaFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const [activeTab, setActiveTab] = useState<TabValue>("licenciatura");
  const errors = form.formState.errors;
  const hasErrorIn = (tab: TabValue) => Boolean(errors[SECTION_BY_TAB[tab]]);

  function onInvalid(formErrors: FieldErrors<FormacionAcademicaInput>) {
    //console.log(" Errores de validación:", formErrors);
    const firstTabWithError = (Object.keys(SECTION_BY_TAB) as TabValue[]).find(
      (tab) => formErrors[SECTION_BY_TAB[tab]],
    );
    if (firstTabWithError) setActiveTab(firstTabWithError);
  }

  async function handleSubmit(values: FormacionAcademicaOutput) {
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      if (onSubmit) {
        await onSubmit(values);
        setSubmitSuccess(true);
        return;
      }

      const res = await fetch("/api/afiliados/formacion-academica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      console.log(res);

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo guardar la información.");
      }

      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la información. Intenta de nuevo.",
      );
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit, onInvalid)}
      className="space-y-6"
      noValidate
    >
      {form.formState.submitCount > 0 && Object.keys(errors).length > 0 ? (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          Hay campos con errores que debes corregir antes de guardar.
        </div>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <TabsList className="grid w-full grid-cols-3">
          {(Object.keys(SECTION_BY_TAB) as TabValue[]).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={cn(hasErrorIn(tab) && "text-destructive")}
            >
              {SECTION_BY_TAB[tab][0].toUpperCase() +
                SECTION_BY_TAB[tab].slice(1)}
              {hasErrorIn(tab) ? (
                <span
                  className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-destructive"
                  aria-hidden
                />
              ) : null}
            </TabsTrigger>
          ))}
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
      {submitSuccess ? (
        <p className="text-sm text-emerald-600">
          Formación académica guardada.
        </p>
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
